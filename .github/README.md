# GitHub Actions - Sistema Lubricentro

Este directorio contiene los workflows de CI/CD para el sistema de lubricentro.

## Workflows Disponibles

### 1. Backend CI (`backend/.github/workflows/ci.yml`)

**Trigger**: Push/PR a `main` o `develop` con cambios en `backend/`

**Jobs**:
- **test**: Ejecuta tests con RSpec en PostgreSQL
- **lint**: Ejecuta RuboCop para linting de código
- **security**: Ejecuta Brakeman para análisis de seguridad
- **bundle-audit**: Verifica vulnerabilidades en dependencias
- **build**: Compila assets para producción

### 2. Frontend CI (`frontend/.github/workflows/ci.yml`)

**Trigger**: Push/PR a `main` o `develop` con cambios en `frontend/`

**Jobs**:
- **lint**: Ejecuta ESLint para linting de código JavaScript
- **test**: Ejecuta tests con Vitest y coverage
- **build**: Compila la aplicación con Vite
- **preview**: Deploy preview en Vercel (solo en PRs)

### 3. Deploy to Production (`.github/workflows/deploy.yml`)

**Trigger**: Push a `main`

**Jobs**:
- **deploy-backend**: Deploy a Railway (solo si hay cambios en backend)
- **deploy-frontend**: Deploy a Vercel (solo si hay cambios en frontend)
- **notify-deployment**: Notificación a Slack

## Configuración de Secrets

### Backend (Railway)
- `RAILWAY_TOKEN`: Token de autenticación de Railway
- `RAILWAY_SERVICE_BACKEND`: ID del servicio backend en Railway

### Frontend (Vercel)
- `VERCEL_TOKEN`: Token de autenticación de Vercel
- `VERCEL_ORG_ID`: ID de la organización en Vercel
- `VERCEL_PROJECT_ID`: ID del proyecto en Vercel

### Notificaciones
- `SLACK_WEBHOOK_URL`: Webhook URL de Slack para notificaciones

### Coverage Reports
- `CODECOV_TOKEN`: Token de Codecov (opcional)

## Configuración Local

### Backend
```bash
# Instalar dependencias de desarrollo
cd backend
bundle install

# Ejecutar tests
bundle exec rspec

# Ejecutar linting
bundle exec rubocop

# Ejecutar análisis de seguridad
bundle exec brakeman
```

### Frontend
```bash
# Instalar dependencias
cd frontend
npm install

# Ejecutar linting
npm run lint

# Ejecutar linting con auto-fix
npm run lint:fix

# Ejecutar tests
npm test

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar tests con UI
npm run test:ui

# Build para producción
npm run build

# Servidor de desarrollo
npm run dev
```

## Testing Frontend

### Estructura de Tests
```
frontend/src/test/
├── setup.js          # Configuración global de tests
├── utils.jsx         # Utilidades y helpers para testing
└── example.test.jsx  # Ejemplo de test
```

### Comandos de Testing
- `npm test`: Ejecuta tests en modo watch
- `npm run test:coverage`: Ejecuta tests con reporte de coverage
- `npm run test:ui`: Abre la interfaz visual de Vitest

### Escribir Tests
```javascript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/utils'

describe('Mi Componente', () => {
  it('renderiza correctamente', () => {
    renderWithProviders(<MiComponente />)
    expect(screen.getByText('Mi texto')).toBeInTheDocument()
  })
})
```

## Troubleshooting

### Backend CI Fails
1. Verificar que PostgreSQL esté configurado correctamente
2. Asegurar que todas las gemas estén en el Gemfile
3. Verificar que los tests pasen localmente

### Frontend CI Fails
1. Verificar que ESLint no tenga errores
2. Asegurar que los tests pasen localmente
3. Verificar que el build funcione localmente
4. Verificar que todas las dependencias estén instaladas

### Deploy Fails
1. Verificar que los secrets estén configurados correctamente
2. Asegurar que las plataformas de deploy (Railway/Vercel) estén configuradas
3. Verificar que los permisos de deploy estén habilitados

## Mejores Prácticas

1. **Siempre ejecutar tests y linting localmente antes de hacer push**
2. **Mantener los workflows actualizados con las últimas versiones de las actions**
3. **Usar cache para optimizar el tiempo de ejecución**
4. **Configurar notificaciones para deployments críticos**
5. **Mantener coverage de tests alto (>80%)**
6. **Escribir tests para nuevas funcionalidades** 