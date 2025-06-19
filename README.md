# Sistema de Gestión Lubricentro 🚗

Sistema web integral para la gestión completa de un lubricentro, desarrollado con Ruby on Rails (API) y React.

## 🎯 Descripción del Proyecto

Una aplicación web moderna que digitaliza y optimiza las operaciones de un lubricentro, incluyendo:

- **Gestión de Clientes**: Registro y administración de clientes
- **Gestión de Vehículos**: Control de vehículos asociados a clientes
- **Sistema de Turnos**: Programación y seguimiento de citas
- **Catálogo de Servicios**: Administración de servicios ofrecidos
- **Gestión de Productos**: Control de productos utilizados
- **Registro de Atenciones**: Documentación completa de servicios realizados
- **Reportes Básicos**: Estadísticas y análisis del negocio

## 🛠️ Stack Tecnológico

### Backend

- **Ruby on Rails 8.0.2** (API mode)
- **SQLite3** (desarrollo) → **PostgreSQL** (producción)
- **JWT** para autenticación
- **RSpec** para testing

### Frontend

- **React 18** con **Vite**
- **Tailwind CSS** para estilos
- **React Query** para gestión de estado del servidor
- **React Router** para navegación
- **Axios** para comunicación con API

## 📁 Estructura del Proyecto

```
lubricentro/
├── backend/              # Rails API
├── frontend/             # React App
├── memory-bank/          # 📚 Documentación del proyecto
│   ├── projectbrief.md   # Objetivos y alcance
│   ├── productContext.md # Contexto del producto
│   ├── systemPatterns.md # Arquitectura y patrones
│   ├── techContext.md    # Stack tecnológico
│   ├── activeContext.md  # Estado actual
│   └── progress.md       # Progreso del proyecto
├── .cursorrules          # 🧠 Reglas de desarrollo
└── README.md
```

## 📚 Memory Bank

Este proyecto utiliza un **Memory Bank** completo que documenta toda la inteligencia del proyecto:

### Archivos Core (LEER ANTES DE DESARROLLAR)

- `memory-bank/projectbrief.md` - Fundamentos del proyecto
- `memory-bank/productContext.md` - Contexto y problemática
- `memory-bank/systemPatterns.md` - Arquitectura y patrones
- `memory-bank/techContext.md` - Configuraciones técnicas
- `memory-bank/activeContext.md` - Estado actual y próximos pasos
- `memory-bank/progress.md` - Progreso y métricas

### ⚠️ Importante para Desarrolladores

El Memory Bank es la **fuente única de verdad** del proyecto. Siempre consulta estos archivos antes de:

- Implementar nuevas funcionalidades
- Tomar decisiones técnicas
- Resolver dudas sobre arquitectura
- Entender el contexto del negocio

## 🚀 Quick Start

### Prerrequisitos

- Ruby 3.2+
- Node.js 18+
- Rails 8.0.2
- Git

### Setup Backend

```bash
cd backend
bundle install
rails db:create db:migrate db:seed
rails server -p 3000
```

### Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1

## 🏗️ Arquitectura

### Patrón API-First

```
Frontend (React) ↔ HTTP/JSON API ↔ Backend (Rails) ↔ Database
```

### Modelo de Datos Principal

- **Customer** (Cliente) → tiene muchos **Vehicles**
- **Vehicle** (Vehículo) → pertenece a **Customer**
- **Appointment** (Turno) → relacionado con **Customer** y **Vehicle**
- **Service** (Servicio) → catálogo de servicios
- **Product** (Producto) → catálogo de productos
- **ServiceRecord** (Atención) → registro de servicios realizados

## 📊 Estado del Proyecto

### ✅ Completado

- [x] Planificación y diseño completo
- [x] Definición de arquitectura
- [x] Stack tecnológico definido
- [x] Memory Bank establecido
- [x] Cursor rules configuradas

### 🚧 En Desarrollo

- [ ] Backend Rails API setup
- [ ] Frontend React setup
- [ ] Modelos de datos
- [ ] API endpoints básicos
- [ ] Interface de usuario

### 📋 Roadmap MVP (7-10 semanas)

1. **Semana 1-2**: Backend API base
2. **Semana 2-3**: Frontend base + layout
3. **Semana 3-4**: CRUD clientes/vehículos
4. **Semana 4-5**: Sistema de turnos
5. **Semana 5-6**: Registro de atenciones
6. **Semana 6-7**: Reportes básicos
7. **Semana 7-8**: Testing y deploy

## 🧠 Desarrollo con Cursor

Este proyecto está optimizado para desarrollo con **Cursor AI**:

### Cursor Rules

- Lee `.cursorrules` para entender patrones específicos
- Siempre consulta Memory Bank antes de desarrollar
- Sigue las convenciones establecidas
- Usa los patrones de arquitectura definidos

### Memory Bank Integration

- El sistema se resetea entre sesiones
- Memory Bank mantiene contexto completo
- Actualiza documentación cuando hagas cambios importantes
- Usa `activeContext.md` para coordinar el trabajo actual

## 🤝 Contribución

1. Lee completamente el Memory Bank
2. Revisa `.cursorrules` para patrones
3. Crea feature branch desde `develop`
4. Implementa siguiendo patrones establecidos
5. Actualiza documentación si es necesario
6. Crea PR con descripción detallada

## 📝 Comandos Útiles

### Backend

```bash
# Consola Rails
rails console

# Testing
rspec

# Migraciones
rails db:migrate

# Generar modelo
rails g model ModelName field:type
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Testing
npm test

# Linting
npm run lint
```

## 📞 Soporte

Para dudas sobre el proyecto:

1. Consulta el Memory Bank primero
2. Revisa las cursor rules
3. Busca en la documentación técnica
4. Contacta al equipo de desarrollo

---

**Powered by Memory Bank System** 🧠 | **Optimized for Cursor AI** ⚡
