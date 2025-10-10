# Sistema de Gestión Lubricentro 🚗

Sistema web integral para la gestión completa de un lubricentro, desarrollado con Ruby on Rails (API) y React.

## 🎯 **Descripción del Proyecto**

Una aplicación web moderna que digitaliza y optimiza las operaciones de un lubricentro, incluyendo:

- **Gestión de Clientes**: Registro y administración de clientes
- **Gestión de Vehículos**: Control de vehículos asociados a clientes
- **Sistema de Turnos**: Programación y seguimiento de citas
- **Catálogo de Servicios**: Administración de servicios ofrecidos
- **Gestión de Productos**: Control de productos utilizados
- **Registro de Atenciones**: Documentación completa de servicios realizados
- **Sistema de Presupuestos**: Cotizaciones y seguimiento
- **Reportes Básicos**: Estadísticas y análisis del negocio

## 🛠️ **Stack Tecnológico**

### **Backend**
- **Ruby on Rails 8.0.2** (API mode)
- **PostgreSQL** (producción) / **SQLite3** (desarrollo)
- **JWT** para autenticación
- **RSpec** para testing

### **Frontend**
- **React 19** con **Vite**
- **Tailwind CSS v4** para estilos
- **React Query** para gestión de estado del servidor
- **React Router** para navegación
- **Axios** para comunicación con API

## 📁 **Estructura del Proyecto**

```
lubricentro/
├── backend/              # Rails API
├── frontend/             # React App
├── .cursorrules          # 🧠 Reglas de desarrollo para Cursor
├── DOCKER_README.md      # 🚀 Guía de deployment
└── README.md
```

## 📚 **Documentación Técnica**

- **`.cursorrules`** - Patrones y reglas del proyecto (LEER ANTES DE DESARROLLAR)
- **`backend/BLUEPRINT_GUIDE.md`** - Guía técnica completa del backend
- **`frontend/IMPORT_RULES.md`** - Reglas de importación y alias
- **`DOCKER_README.md`** - Guía de deployment y producción
- **`CONTRIBUTING.md`** - Guía de contribución para desarrolladores

## 🚀 **Quick Start**

### **Prerrequisitos**

- Ruby 3.2+
- Node.js 18+
- Docker (opcional, para desarrollo local)
- Git

### **Opción 1: Desarrollo Local**

#### **Setup Backend**
```bash
cd backend
bundle install
rails db:create db:migrate db:seed
rails server -p 3000
```

#### **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

### **Opción 2: Docker Compose (Recomendado)**

```bash
# Clonar y configurar
git clone <repository-url>
cd lubricentro

# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

**Ver [DOCKER_README.md](./DOCKER_README.md) para más detalles.**

### **Acceso a la Aplicación**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1

## 🏗️ **Arquitectura**

### **Patrón API-First**

```
Frontend (React) ↔ HTTP/JSON API ↔ Backend (Rails) ↔ Database
```

### **Modelo de Datos Principal**

- **Customer** (Cliente) → tiene muchos **Vehicles**
- **Vehicle** (Vehículo) → pertenece a **Customer**
- **Appointment** (Turno) → relacionado con **Customer** y **Vehicle**
- **Service** (Servicio) → catálogo de servicios
- **Product** (Producto) → catálogo de productos
- **ServiceRecord** (Atención) → registro de servicios realizados
- **Quote** (Presupuesto) → sistema de cotizaciones

## 📊 **Estado del Proyecto**

### **✅ Completado (98%)**

- [x] Planificación y diseño completo
- [x] Definición de arquitectura
- [x] Stack tecnológico definido
- [x] Backend Rails API completo
- [x] Autenticación JWT implementada
- [x] Frontend React base implementado
- [x] CRUD de clientes completo
- [x] CRUD de vehículos completo
- [x] Sistema de turnos funcional
- [x] CRUD de productos y servicios
- [x] Sistema de presupuestos completo
- [x] Reportes básicos
- [x] Integración frontend-backend
- [x] UI responsive y profesional

### **🚧 En Desarrollo (2%)**

- [ ] CRUD de atenciones (modales faltantes)
- [ ] Testing frontend completo
- [ ] Deploy a producción

### **📋 Roadmap MVP**

1. **Semana 1**: Completar modales de atenciones
2. **Semana 2**: Testing frontend con Vitest
3. **Semana 3**: Deploy y optimización final

## 🧠 **Desarrollo con Cursor**

Este proyecto está optimizado para desarrollo con **Cursor AI**:

### **Cursor Rules**

- Lee `.cursorrules` para entender patrones específicos
- Sigue las convenciones establecidas
- Usa los patrones de arquitectura definidos
- Consulta documentación técnica según necesites

### **Comandos Útiles**

```bash
# Desarrollo completo
make dev

# Backend
cd backend && rails s
rails console
rspec

# Frontend
cd frontend && npm run dev
npm run build
npm test

# Docker
docker-compose up -d
docker-compose exec backend rails console
docker-compose exec frontend npm run dev
```

## 🚀 **Deployment**

### **Desarrollo Local**
Ver [DOCKER_README.md](./DOCKER_README.md) para configuración con Docker Compose.

### **Producción**
El proyecto está configurado para deploy en Railway con GitHub Actions.

**Ver [DOCKER_README.md](./DOCKER_README.md) para guía completa de deployment.**

## 🤝 **Contribución**

1. Lee `.cursorrules` para patrones del proyecto
2. Revisa documentación técnica según corresponda
3. Crea feature branch desde `main`
4. Implementa siguiendo patrones establecidos
5. Testing: `rspec` (backend) o `npm test` (frontend)
6. Crea PR con descripción detallada

**Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para guía completa.**

## 📝 **Comandos Útiles**

### **Backend**
```bash
# Consola Rails
docker-compose exec backend rails console

# Testing
docker-compose exec backend rspec

# Migraciones
docker-compose exec backend rails db:migrate

# Generar modelo
docker-compose exec backend rails g model ModelName field:type
```

### **Frontend**
```bash
# Desarrollo
docker-compose exec frontend npm run dev

# Build
docker-compose exec frontend npm run build

# Testing
docker-compose exec frontend npm test
```

## 📚 **Documentación Adicional**

- **[Cursor Rules](./.cursorrules)** - Patrones y reglas del proyecto
- **[Backend Technical Guide](./backend/BLUEPRINT_GUIDE.md)** - Guía técnica del backend
- **[Frontend Import Rules](./frontend/IMPORT_RULES.md)** - Reglas de importación
- **[Docker & Deployment](./DOCKER_README.md)** - Guía de deployment
- **[Contributing Guide](./CONTRIBUTING.md)** - Guía de contribución

---

**Desarrollado para Sistema Lubricentro** 🚗

**Última actualización**: Diciembre 2025
**Versión**: 3.0 - Optimizado para Cursor AI