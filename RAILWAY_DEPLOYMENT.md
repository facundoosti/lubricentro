# 🚀 Railway Deployment Guide - Sistema Lubricentro

## 📋 Configuración Completa para Railway

### 🏗️ Estructura del Proyecto
```
lubricentro/
├── backend/          # Rails API (Railway)
├── frontend/         # React App (Railway)
└── .github/workflows/ # GitHub Actions
```

### 🔧 Variables de Entorno Requeridas

#### **Backend (Railway)**
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

#### **Frontend (Railway)**
```env
# API Configuration
VITE_API_BASE_URL=https://lubricentro-production.up.railway.app/api/v1

# App Configuration
VITE_APP_NAME=Lubricentro
NODE_ENV=production
```

### 🚀 Configuración de Railway

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
VITE_API_BASE_URL=https://lubricentro-production.up.railway.app/api/v1
VITE_APP_NAME=Lubricentro
NODE_ENV=production
```

### 🔄 GitHub Actions Secrets

Configurar en GitHub Repository Settings → Secrets:

```env
RAILWAY_TOKEN=tu-railway-token
RAILWAY_SERVICE_BACKEND=service-id-backend
RAILWAY_SERVICE_FRONTEND=service-id-frontend
SLACK_WEBHOOK_URL=tu-slack-webhook (opcional)
```

### 📊 Health Checks

#### **Backend Health Check**
- **Endpoint**: `/up`
- **Expected**: `200 OK`
- **Timeout**: 300s

#### **Frontend Health Check**
- **Endpoint**: `/health`
- **Expected**: `200 OK`
- **Timeout**: 300s

### 🔍 Troubleshooting

#### **Problemas Comunes**

1. **CORS Errors**
   - Verificar `CORS_ORIGIN` en backend
   - Asegurar que el frontend URL esté incluido

2. **Database Connection**
   - Verificar `DATABASE_URL` en Railway
   - Ejecutar `rails db:migrate` manualmente si es necesario

3. **Build Failures**
   - Verificar `package.json` y `Gemfile`
   - Revisar logs de build en Railway

4. **Health Check Failures**
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

### 📈 Monitoreo

#### **Railway Metrics**
- CPU Usage
- Memory Usage
- Request Count
- Response Time

#### **Application Logs**
- Backend: Rails logs en Railway
- Frontend: Caddy logs en Railway

### 🔐 Seguridad

#### **Variables Sensibles**
- `JWT_SECRET`: Usar generador de secretos
- `DATABASE_URL`: Configurado automáticamente por Railway
- `RAILWAY_TOKEN`: Token de Railway para GitHub Actions

#### **CORS Configuration**
- Solo dominios específicos permitidos
- Credentials habilitados para autenticación

### 🚀 Deploy Process

1. **Push a main branch**
2. **GitHub Actions detecta cambios**
3. **Deploy automático a Railway**
4. **Health checks verifican servicios**
5. **Notificación de estado (Slack)**

### 📞 URLs de Producción

- **Backend API**: `https://lubricentro-production.up.railway.app`
- **Frontend App**: `https://lubricentro-frontend.up.railway.app`
- **API Base**: `https://lubricentro-production.up.railway.app/api/v1`

---

**Última actualización**: Junio 2025
**Versión**: 1.0.0 