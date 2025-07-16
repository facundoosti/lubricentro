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
├── memory-bank/          # 📚 Documentación del proyecto
│   ├── projectbrief.md   # Objetivos y alcance
│   ├── productContext.md # Contexto del producto
│   ├── systemPatterns.md # Arquitectura y patrones
│   ├── techContext.md    # Stack tecnológico
│   ├── activeContext.md  # Estado actual
│   ├── progress.md       # Progreso del proyecto
│   └── designSystem.md   # Sistema de diseño unificado
├── .cursorrules          # 🧠 Reglas de desarrollo
├── DOCKER_README.md      # 🚀 Guía de deployment
└── README.md
```

## 📚 **Memory Bank**

Este proyecto utiliza un **Memory Bank** completo que documenta toda la inteligencia del proyecto:

### **Archivos Core (LEER ANTES DE DESARROLLAR)**

- `memory-bank/projectbrief.md` - Fundamentos del proyecto
- `memory-bank/productContext.md` - Contexto y problemática
- `memory-bank/systemPatterns.md` - Arquitectura y patrones
- `memory-bank/techContext.md` - Configuraciones técnicas
- `memory-bank/activeContext.md` - Estado actual y próximos pasos
- `memory-bank/progress.md` - Progreso y métricas
- `memory-bank/designSystem.md` - Sistema de diseño unificado

### **⚠️ Importante para Desarrolladores**

El Memory Bank es la **fuente única de verdad** del proyecto. Siempre consulta estos archivos antes de:

- Implementar nuevas funcionalidades
- Tomar decisiones técnicas
- Resolver dudas sobre arquitectura
- Entender el contexto del negocio

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

## 📊 **Estado del Proyecto**

### **✅ Completado (70%)**

- [x] Planificación y diseño completo
- [x] Definición de arquitectura
- [x] Stack tecnológico definido
- [x] Memory Bank establecido
- [x] Backend Rails API completo
- [x] Autenticación JWT implementada
- [x] Frontend React base implementado
- [x] CRUD de clientes completo
- [x] Sistema de turnos funcional
- [x] Integración frontend-backend

### **🚧 En Desarrollo (30%)**

- [ ] CRUD de vehículos (modales faltantes)
- [ ] CRUD de productos (modales faltantes)
- [ ] CRUD de servicios (modales faltantes)
- [ ] CRUD de atenciones (modales faltantes)
- [ ] Testing frontend
- [ ] Deploy a producción

### **📋 Roadmap MVP**

1. **Semana 1-2**: Completar CRUD faltantes
2. **Semana 3**: Testing frontend
3. **Semana 4**: Deploy y optimización

## 🧠 **Desarrollo con Cursor**

Este proyecto está optimizado para desarrollo con **Cursor AI**:

### **Cursor Rules**

- Lee `.cursorrules` para entender patrones específicos
- Siempre consulta Memory Bank antes de desarrollar
- Sigue las convenciones establecidas
- Usa los patrones de arquitectura definidos

### **Memory Bank Integration**

- El sistema se resetea entre sesiones
- Memory Bank mantiene contexto completo
- Actualiza documentación cuando hagas cambios importantes
- Usa `activeContext.md` para coordinar el trabajo actual

## 🚀 **Deployment**

### **Desarrollo Local**
Ver [DOCKER_README.md](./DOCKER_README.md) para configuración con Docker Compose.

### **Producción**
El proyecto está configurado para deploy en Railway con GitHub Actions.

**Ver [DOCKER_README.md](./DOCKER_README.md) para guía completa de deployment.**

## 🤝 **Contribución**

1. Lee completamente el Memory Bank
2. Revisa `.cursorrules` para patrones
3. Crea feature branch desde `develop`
4. Implementa siguiendo patrones establecidos
5. Actualiza documentación si es necesario
6. Crea PR con descripción detallada

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

- **[Memory Bank](./memory-bank/)** - Documentación completa del proyecto
- **[Docker & Deployment](./DOCKER_README.md)** - Guía de deployment
- **[Backend Technical Guide](./backend/BLUEPRINT_GUIDE.md)** - Guía técnica del backend
- **[Frontend Import Rules](./frontend/IMPORT_RULES.md)** - Reglas de importación

---

**Desarrollado para Sistema Lubricentro** 🚗

**Última actualización**: Junio 2025
**Versión**: 2.0 - Documentación consolidada
