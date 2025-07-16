# 🚀 Deployment Guide - Sistema Lubricentro

## 📋 **Guía Completa de Deployment**

Este documento contiene todas las configuraciones y guías para el deployment del Sistema Lubricentro, incluyendo Docker Compose para desarrollo y Railway para producción.

## 🐳 **Docker Compose - Desarrollo Local**

### **Descripción**

Docker Compose configura un entorno de desarrollo completo con:

- **Backend**: Rails 8.0.2 API con PostgreSQL
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Base de datos**: PostgreSQL 15
- **Cache**: Redis 7
- **Proxy**: Nginx (opcional)

### **🚀 Inicio Rápido**

#### **1. Clonar y configurar**

```bash
# Clonar el repositorio
git clone <repository-url>
cd lubricentro

# Copiar variables de entorno (opcional)
cp .env.example .env
```

#### **2. Levantar servicios**

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### **3. Acceder a las aplicaciones**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Nginx Proxy**: http://localhost:80 (solo con profile production)

### **🛠️ Comandos Útiles**

#### **Gestión de servicios**

```bash
# Levantar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Reconstruir imágenes
docker-compose build

# Reconstruir y levantar
docker-compose up -d --build

# Ver estado de servicios
docker-compose ps

# Ver logs
docker-compose logs

# Ejecutar comandos en contenedores
docker-compose exec backend rails console
docker-compose exec frontend npm run build
```

#### **Base de datos**

```bash
# Acceder a PostgreSQL
docker-compose exec postgres psql -U lubricentro -d lubricentro_development

# Ejecutar migraciones
docker-compose exec backend rails db:migrate

# Crear seed data
docker-compose exec backend rails db:seed

# Resetear base de datos
docker-compose exec backend rails db:reset
```

#### **Desarrollo**

```bash
# Instalar nuevas gems
docker-compose exec backend bundle install

# Instalar nuevas dependencias de npm
docker-compose exec frontend npm install

# Ejecutar tests
docker-compose exec backend rspec
docker-compose exec frontend npm test

# Ejecutar linter
docker-compose exec backend bundle exec rubocop
docker-compose exec frontend npm run lint
```

### **📁 Estructura de Archivos**

```
lubricentro/
├── docker-compose.yml          # Configuración principal
├── backend/
│   ├── Dockerfile.dev         # Dockerfile para desarrollo
│   └── ...
├── frontend/
│   ├── Dockerfile.dev         # Dockerfile para desarrollo
│   └── ...
├── nginx.conf                 # Configuración de proxy
└── .env.example              # Variables de entorno de ejemplo
```

### **🔧 Configuración**

#### **Variables de Entorno**

El sistema usa las siguientes variables de entorno:

##### **Backend**
- `RAILS_ENV`: development
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `JWT_SECRET`: Clave secreta para JWT
- `CORS_ORIGIN`: Origen permitido para CORS

##### **Frontend**
- `VITE_API_BASE_URL`: URL del backend API
- `VITE_APP_NAME`: Nombre de la aplicación

#### **Puertos**

- **Frontend**: 5173
- **Backend**: 3000
- **PostgreSQL**: 5432
- **Nginx**: 80 (solo con profile production)

### **🐛 Troubleshooting**

#### **Problemas Comunes**

##### **1. Puerto ya en uso**
```bash
# Verificar qué está usando el puerto
lsof -i :3000
lsof -i :5173

# Detener servicios locales si es necesario
sudo kill -9 <PID>
```

##### **2. Problemas de permisos**
```bash
# Reconstruir imágenes
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

##### **3. Base de datos no conecta**
```bash
# Verificar logs de PostgreSQL
docker-compose logs postgres

# Recrear base de datos
docker-compose exec backend rails db:drop db:create db:migrate db:seed
```

##### **4. Frontend no carga**
```bash
# Verificar logs del frontend
docker-compose logs frontend

# Reinstalar dependencias
docker-compose exec frontend rm -rf node_modules package-lock.json
docker-compose exec frontend npm install
```

#### **Logs Detallados**

```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Seguir logs en tiempo real
docker-compose logs -f backend
```

## 🚂 **Railway - Producción**

### **Configuración Completa para Railway**

#### **🏗️ Estructura del Proyecto**
```
lubricentro/
├── backend/          # Rails API (Railway)
├── frontend/         # React App (Railway)
└── .github/workflows/ # GitHub Actions
```

#### **🔧 Variables de Entorno Requeridas**

##### **Backend (Railway)**
```env
# Base de Datos
DATABASE_URL=postgresql://...

# JWT Authentication
JWT_SECRET=tu-jwt-secret-super-seguro

# CORS Origins
CORS_ORIGIN=https://lubricentro-frontend.up.railway.app

# Railway Configuration
RAILWAY_STATIC_URL=https://lubricentro-production.up.railway.app
RAILS_ENV=production
RAILS_LOG_LEVEL=info

# Optional: Email (si se implementa)
SMTP_USERNAME=tu-email
SMTP_PASSWORD=tu-password
SMTP_ADDRESS=smtp.gmail.com
SMTP_PORT=587
```

##### **Frontend (Railway)**
```env
# API Configuration
VITE_API_BASE_URL=https://lubricentro-production.up.railway.app

# App Configuration
VITE_APP_NAME=Lubricentro
NODE_ENV=production
```

### **🚀 Configuración de Railway**

#### **1. Crear Proyecto en Railway**
1. Ir a [Railway.app](https://railway.app)
2. Crear nuevo proyecto
3. Conectar repositorio de GitHub

#### **2. Configurar Servicios**

##### **Backend Service**
- **Name**: `lubricentro-backend`
- **Source**: `backend/` directory
- **Build Command**: `bundle install && rails db:migrate`
- **Start Command**: `rails server -b 0.0.0.0 -p $PORT`
- **Health Check**: `/up`

##### **Frontend Service**
- **Name**: `lubricentro-frontend`
- **Source**: `frontend/` directory
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `caddy run --config Caddyfile --adapter caddyfile`
- **Health Check**: `/health`

#### **3. Configurar Variables de Entorno**

En Railway Dashboard, para cada servicio:

**Backend Variables:**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=tu-jwt-secret
CORS_ORIGIN=https://lubricentro-frontend.up.railway.app
RAILWAY_STATIC_URL=https://lubricentro-production.up.railway.app
RAILS_ENV=production
```

**Frontend Variables:**
```env
VITE_API_BASE_URL=https://lubricentro-production.up.railway.app
VITE_APP_NAME=Lubricentro
NODE_ENV=production
```

### **🔄 GitHub Actions Secrets**

Configurar en GitHub Repository Settings → Secrets:

```env
RAILWAY_TOKEN=tu-railway-token
RAILWAY_SERVICE_BACKEND=service-id-backend
RAILWAY_SERVICE_FRONTEND=service-id-frontend
SLACK_WEBHOOK_URL=tu-slack-webhook (opcional)
```

### **📊 Health Checks**

#### **Backend Health Check**
- **Endpoint**: `/up`
- **Expected**: `200 OK`
- **Timeout**: 300s

#### **Frontend Health Check**
- **Endpoint**: `/health`
- **Expected**: `200 OK`
- **Timeout**: 300s

### **🔍 Troubleshooting Railway**

#### **Problemas Comunes**

##### **1. CORS Errors**
- Verificar `CORS_ORIGIN` en backend
- Asegurar que el frontend URL esté incluido

##### **2. Database Connection**
- Verificar `DATABASE_URL` en Railway
- Ejecutar `rails db:migrate` manualmente si es necesario

##### **3. Build Failures**
- Verificar `package.json` y `Gemfile`
- Revisar logs de build en Railway

##### **4. Health Check Failures**
- Verificar que los endpoints `/up` y `/health` respondan
- Revisar logs de aplicación

#### **Comandos de Debug**

```bash
# Backend
rails console
rails db:migrate:status
rails routes | grep up

# Frontend
npm run build
npm run preview
```

### **📈 Monitoreo**

#### **Railway Metrics**
- CPU Usage
- Memory Usage
- Request Count
- Response Time

#### **Application Logs**
- Backend: Rails logs en Railway
- Frontend: Caddy logs en Railway

### **🔐 Seguridad**

#### **Variables Sensibles**
- `JWT_SECRET`: Usar generador de secretos
- `DATABASE_URL`: Configurado automáticamente por Railway
- `RAILWAY_TOKEN`: Token de Railway para GitHub Actions

#### **CORS Configuration**
- Solo dominios específicos permitidos
- Credentials habilitados para autenticación

### **🚀 Deploy Process**

1. **Push a main branch**
2. **GitHub Actions detecta cambios**
3. **Deploy automático a Railway**
4. **Health checks verifican servicios**
5. **Notificación de estado (Slack)**

### **📞 URLs de Producción**

- **Backend API**: `https://lubricentro-production.up.railway.app`
- **Frontend App**: `https://lubricentro-frontend.up.railway.app`
- **API Base**: `https://lubricentro-production.up.railway.app/api/v1`

## 📋 **Checklist de Deploy**

### **Railway Dashboard Setup**
- [ ] Crear proyecto en Railway
- [ ] Conectar repositorio de GitHub
- [ ] Configurar servicios backend y frontend
- [ ] Configurar variables de entorno
- [ ] Configurar health checks

### **GitHub Secrets Setup**
- [ ] RAILWAY_TOKEN
- [ ] RAILWAY_SERVICE_BACKEND
- [ ] RAILWAY_SERVICE_FRONTEND
- [ ] SLACK_WEBHOOK_URL (opcional)

### **Variables de Entorno Railway**
- [ ] Backend: DATABASE_URL, JWT_SECRET, CORS_ORIGIN
- [ ] Frontend: VITE_API_BASE_URL, VITE_APP_NAME

## 🎯 **Próximos Pasos para Deploy**

### **1. Configurar Railway Dashboard**
- Crear proyecto y conectar repositorio
- Configurar servicios backend y frontend
- Configurar variables de entorno

### **2. Configurar GitHub Secrets**
- Obtener RAILWAY_TOKEN desde Railway
- Obtener service IDs para backend y frontend
- Configurar secrets en GitHub

### **3. Probar Deploy**
- Hacer push a main branch
- Verificar que GitHub Actions ejecute correctamente
- Verificar health checks en Railway

### **4. Verificar Integración**
- Probar login desde frontend de producción
- Verificar que API responda correctamente
- Probar funcionalidades principales

---

**Última actualización**: Junio 2025
**Versión**: 2.0 - Guía de deployment consolidada 