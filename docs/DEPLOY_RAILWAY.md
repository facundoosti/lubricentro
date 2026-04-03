# Deploy a Producción — Railway

Guía paso a paso para desplegar el monorepo en Railway con tres servicios: **backend** (Rails 8), **frontend** (React + Caddy) y **PostgreSQL**.

---

## Arquitectura en Railway

```
Proyecto: lubricentro
├── backend    (Rails 8 API — Dockerfile en backend/)
├── frontend   (React + Caddy — Dockerfile en frontend/)
└── Postgres   (Plugin Railway)
```

El deploy se activa automáticamente via GitHub Actions al pushear a `main`.

---

## 1. Crear el proyecto en Railway

1. Ir a [railway.app](https://railway.app) → **New Project**
2. Seleccionar **Empty Project**
3. Renombrar el proyecto a `lubricentro`

---

## 2. Agregar los servicios

### 2.1 PostgreSQL

1. Dentro del proyecto → **+ Create** → **Database** → **Add PostgreSQL**
2. Railway provisiona la base y expone la variable `DATABASE_URL` internamente.

### 2.2 Backend (Rails API)

1. **+ Create** → **GitHub Repo** → seleccionar este repositorio
2. Nombre del servicio: `backend`
3. En **Settings → Build → Root Directory**: `/backend`
4. Railway detecta el `Dockerfile` automáticamente.

### 2.3 Frontend (React)

1. **+ Create** → **GitHub Repo** → seleccionar este repositorio (otra vez)
2. Nombre del servicio: `frontend`
3. En **Settings → Build → Root Directory**: `/frontend`
4. Railway detecta el `Dockerfile` automáticamente.

---

## 3. Variables de entorno

### Backend — Variables requeridas

Ir a **backend → Variables** y agregar:

| Variable | Valor | Notas |
|---|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Referencia al plugin Railway |
| `SECRET_KEY_BASE` | `rails secret` (generar localmente) | |
| `JWT_SECRET` | string aleatorio seguro | |
| `ALLOWED_ORIGINS` | URL pública del frontend | Ej: `https://frontend.up.railway.app` |
| `RAILS_ENV` | `production` | |
| `RAILS_LOG_TO_STDOUT` | `true` | Para ver logs en Railway |
| `SOLID_QUEUE_IN_PUMA` | `true` | Corre los workers dentro del proceso web (ver sección Workers) |

**Generar SECRET_KEY_BASE localmente:**
```bash
cd backend && bundle exec rails secret
```

### Frontend — Variables de build

Ir a **frontend → Variables** y agregar:

| Variable | Valor | Notas |
|---|---|---|
| `VITE_API_BASE_URL` | URL pública del backend | Ej: `https://backend.up.railway.app` |

> **Importante:** `VITE_API_BASE_URL` es un build arg del Dockerfile — se inyecta en tiempo de compilación, no en runtime.

---

## 4. Generar dominios públicos

Para cada servicio:

1. Ir al servicio → **Settings → Networking → Generate Domain**
2. Anotar las URLs:
   - Backend: `https://backend-xxxx.up.railway.app`
   - Frontend: `https://frontend-xxxx.up.railway.app`

3. Actualizar las variables:
   - En backend: `ALLOWED_ORIGINS` = URL del frontend
   - En frontend: `VITE_API_BASE_URL` = URL del backend

> El orden importa: primero generar los dominios, luego cruzar las variables.

---

## 5. railway.toml por servicio

Agregar estos archivos para tener config-as-code. Railway los lee automáticamente.

### `backend/railway.toml`

```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/up"
healthcheckTimeout = 60
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

> El `docker-entrypoint` ya corre `db:prepare` antes de iniciar el servidor — no es necesario un `preDeployCommand` adicional.

### `frontend/railway.toml`

```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

> El Caddyfile ya responde `200 OK` en `/health` para Railway.

---

## 6. GitHub Actions — Secrets requeridos

Ir a **GitHub → Settings → Secrets and variables → Actions** y agregar:

| Secret | Cómo obtenerlo |
|---|---|
| `RAILWAY_TOKEN` | Railway → Account Settings → Tokens → Create Token |
| `RAILWAY_SERVICE_BACKEND` | ID del servicio backend (Railway dashboard URL o CLI) |
| `RAILWAY_SERVICE_FRONTEND` | ID del servicio frontend (Railway dashboard URL o CLI) |

**Obtener IDs de servicios via CLI:**
```bash
railway link   # vincular el proyecto
railway status # muestra project + service IDs
```

### Corrección al workflow existente

El archivo `.github/workflows/deploy.yml` tiene un bug en las condiciones de filtro por directorio — `contains()` no funciona con arrays de paths parciales. Reemplazar las condiciones:

```yaml
# ❌ Esto no funciona como se espera:
if: contains(github.event.head_commit.modified, 'backend/')

# ✅ Usar paths filter en el trigger en su lugar:
on:
  push:
    branches: [main]
    paths:
      - 'backend/**'   # solo para el job de backend
```

Ver la sección de workflow corregido más abajo.

### Workflow corregido

Reemplazar `.github/workflows/deploy.yml` con:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    if: |
      contains(toJSON(github.event.commits.*.modified), 'backend/') ||
      contains(toJSON(github.event.commits.*.added), 'backend/')
    steps:
      - uses: actions/checkout@v4
      - name: Deploy Backend to Railway
        uses: bervProject/railway-deploy@v1.0.0
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: ${{ secrets.RAILWAY_SERVICE_BACKEND }}

  deploy-frontend:
    runs-on: ubuntu-latest
    if: |
      contains(toJSON(github.event.commits.*.modified), 'frontend/') ||
      contains(toJSON(github.event.commits.*.added), 'frontend/')
    steps:
      - uses: actions/checkout@v4
      - name: Deploy Frontend to Railway
        uses: bervProject/railway-deploy@v1.0.0
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: ${{ secrets.RAILWAY_SERVICE_FRONTEND }}
```

---

## 7. Workers y Jobs en background

El proyecto usa **Solid Queue** con un recurring job activo en producción: `ServiceReminderJob` (todos los días a las 9am, cola `notifications`).

### Opción A — Workers dentro del proceso web (recomendado para MVP)

Con `SOLID_QUEUE_IN_PUMA=true`, Solid Queue corre su supervisor dentro de Puma. No se necesita un servicio extra. El dispatcher maneja el scheduling de recurring jobs automáticamente.

**Desventajas:** si el web process se reinicia, los jobs en ejecución se interrumpen. El procesamiento de jobs compite con los requests HTTP por CPU/memoria.

### Opción B — Servicio `worker` separado (para producción con carga alta)

Si el backend empieza a ir lento por jobs pesados, agregar un servicio `worker` en Railway:

1. **+ Create** → **GitHub Repo** → mismo repositorio
2. Nombre: `worker`
3. **Settings → Build → Root Directory**: `/backend`
4. **Settings → Deploy → Start Command**:
   ```
   bundle exec rails solid_queue:start
   ```
5. Mismas variables de entorno que el backend, **excepto** `SOLID_QUEUE_IN_PUMA` (eliminar esa variable del servicio web también).

El `railway.toml` del worker sería:

```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "bundle exec rails solid_queue:start"
restartPolicyType = "always"
```

**Para el primer deploy, usar Opción A.** Migrar a Opción B solo si hay evidencia de que el web process se ve afectado por los jobs.

---

## 8. Primer deploy manual

Antes de confiar en el CI, hacer el primer deploy manual para verificar todo:

```bash
# Instalar Railway CLI si no está instalado
npm install -g @railway/cli

# Login
railway login

# Vincular al proyecto lubricentro
railway link

# Deploy backend
cd backend
railway up --service backend

# Deploy frontend
cd ../frontend
railway up --service frontend
```

---

## 9. Verificación post-deploy

```bash
# Health del backend
curl https://backend-xxxx.up.railway.app/up

# Respuesta esperada
# => HTTP 200, "OK"

# Health del frontend (Caddy)
curl https://frontend-xxxx.up.railway.app/health
# => HTTP 200, "OK"

# Ver logs en tiempo real
railway logs --service backend
railway logs --service frontend
```

---

## 10. Checklist de deploy

- [ ] Proyecto creado en Railway
- [ ] PostgreSQL provisionado
- [ ] Servicio `backend` creado con Root Directory `/backend`
- [ ] Servicio `frontend` creado con Root Directory `/frontend`
- [ ] Variables de entorno del backend configuradas (incluyendo `DATABASE_URL`)
- [ ] Variables de entorno del frontend configuradas (`VITE_API_BASE_URL`)
- [ ] Dominios públicos generados para ambos servicios
- [ ] `ALLOWED_ORIGINS` en backend apunta al dominio del frontend
- [ ] `backend/railway.toml` y `frontend/railway.toml` commiteados
- [ ] Secrets de GitHub Actions configurados (`RAILWAY_TOKEN`, `RAILWAY_SERVICE_BACKEND`, `RAILWAY_SERVICE_FRONTEND`)
- [ ] Primer deploy manual exitoso
- [ ] `/up` responde 200 en backend
- [ ] `/health` responde 200 en frontend
- [ ] Login funciona desde el frontend en producción

---

## 11. Troubleshooting

**Error: `PG::ConnectionBad` en backend**
→ Verificar que `DATABASE_URL` usa `${{Postgres.DATABASE_URL}}` (con doble llave).

**Frontend muestra errores de red / CORS**
→ Verificar que `ALLOWED_ORIGINS` en backend coincide exactamente con el dominio del frontend (sin slash final).

**Build del frontend falla**
→ `VITE_API_BASE_URL` debe estar seteado antes del build. Es un build arg, no una variable de runtime.

**Migrations no corren**
→ El `docker-entrypoint` corre `db:prepare` automáticamente al iniciar. Si falla, revisar logs con `railway logs --service backend`.

**`SECRET_KEY_BASE` inválido**
→ Regenerar con `bundle exec rails secret` y actualizar la variable en Railway.
