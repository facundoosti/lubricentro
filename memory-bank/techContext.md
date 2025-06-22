# Tech Context - Stack Tecnológico Lubricentro

## Stack Principal

### Backend: Ruby on Rails 8.0.2

```ruby
# Gemfile principales
gem "rails", "~> 8.0.2"
gem "sqlite3", ">= 2.1" # desarrollo
gem "pg" # producción
gem "puma", ">= 5.0"
gem "bootsnap", require: false

# Autenticación y seguridad
gem "jwt"
gem "bcrypt", "~> 3.1.7"
gem "rack-cors"

# Serialización
gem "jsonapi-serializer"

# Testing
gem "rspec-rails"
gem "factory_bot_rails"
gem "faker"
gem "shoulda-matchers"
gem "database_cleaner-active_record"
gem "simplecov", require: false

# Deployment
gem "kamal"
gem "thruster"
```

### Frontend: React + Vite + Tailwind CSS v4

- **Gestor de paquetes**: Se utiliza `npm` para gestionar las dependencias del frontend.
- **Nota sobre Bun**: Se intentó migrar a `bun` pero se encontraron problemas con la instalación de dependencias nativas (`lightningcss`, `@rollup/rollup-darwin-x64`). Se revirtió a `npm` para garantizar la estabilidad del entorno de desarrollo.

**🚨 REGLA CRÍTICA: Tailwind CSS First**
- **OBLIGATORIO**: Todo el CSS debe usar clases de Tailwind
- **PROHIBIDO**: CSS personalizado sin justificación técnica
- **ÚNICO ARCHIVO CSS**: `frontend/src/index.css` con sistema `@theme`

```json
{
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.2",
    "axios": "^1.10.0",
    "@tanstack/react-query": "^5.80.10",
    "@tanstack/react-query-devtools": "^5.80.10",
    "react-hook-form": "^7.58.1",
    "@hookform/resolvers": "^5.1.1",
    "yup": "^1.6.1",
    "lucide-react": "^0.518.0"
  },
  "devDependencies": {
    "vite": "^6.3.5",
    "tailwindcss": "^4.1.10",
    "@tailwindcss/vite": "^4.1.10",
    "@tailwindcss/postcss": "^4.1.10",
    "autoprefixer": "^10.4.13",
    "postcss": "^8.4.21",
    "@vitejs/plugin-react": "^4.4.1",
    "eslint": "^9.25.0"
  }
}
```

### Configuración Tailwind CSS v4

**Sistema `@theme` (Tailwind v4):**
```css
/* frontend/src/index.css - ÚNICO archivo de configuración */
@import "tailwindcss";

@theme {
  --font-outfit: Outfit, sans-serif;
  
  /* Colores de grises */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f2f4f7;
  --color-gray-200: #e4e7ec;
  /* ... hasta gray-950 */
  
  /* Colores de marca */
  --color-brand-500: #465fff;
  --color-brand-600: #3641f5;
  /* ... hasta brand-950 */
  
  /* Tamaños de texto */
  --text-title-md: 36px;
  --text-theme-sm: 14px;
  /* ... otros tamaños */
  
  /* Sombras */
  --shadow-theme-sm: 0px 1px 3px 0px rgba(16, 24, 40, 0.1);
  --shadow-theme-md: 0px 4px 8px -2px rgba(16, 24, 40, 0.1);
  /* ... otras sombras */
}
```

**PostCSS Configuration:**
```javascript
// frontend/postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

**⚠️ NO usar `tailwind.config.js`** - Tailwind v4 usa `@theme` en CSS

## 🎨 Template de Referencia: TailAdmin React

### Información del Template Base

**Template**: TailAdmin React - Free React Tailwind Admin Dashboard Template
**Versión**: 2.0.2 (Marzo 2025)
**Licencia**: MIT (Gratuito)
**Ubicación**: `frontend/template-analysis/`

### Características del Template

- **Framework**: React 19 + TypeScript + Tailwind CSS
- **Tipo**: Admin Dashboard Template profesional
- **Tema**: Soporte para modo oscuro/claro
- **Componentes**: 30+ componentes de dashboard, 50+ elementos UI
- **Responsive**: Mobile-first design

### Recursos del Template

- **Documentación**: https://tailadmin.com/docs
- **Demo Online**: https://free-react-demo.tailadmin.com/
- **Figma Design**: Archivos de diseño disponibles
- **GitHub**: https://github.com/TailAdmin/free-react-tailwind-admin-dashboard

### Adaptación para Lubricentro

**Estructura Base Adaptada**:
```
frontend/src/
├── layout/           # Layout, Header, Sidebar (adaptados del template)
├── components/       # Componentes UI reutilizables (adaptados)
├── pages/           # Páginas específicas del lubricentro
├── icons/           # Iconos SVG (del template)
├── contexts/        # Contextos React (QueryProvider, etc.)
├── services/        # Servicios API
└── utils/           # Utilidades
```

**Componentes Clave Adaptados**:
- `Layout.jsx` - Estructura principal con sidebar y header
- `Sidebar.jsx` - Navegación específica del lubricentro
- `Header.jsx` - Header con controles de tema y usuario
- Componentes UI: Button, Table, Modal, Form, etc.

**Rutas Específicas Implementadas**:
- `/` - Dashboard principal
- `/services` - Gestión de servicios
- `/customers` - Gestión de clientes
- `/vehicles` - Gestión de vehículos
- `/appointments` - Gestión de turnos
- `/products` - Gestión de productos
- `/settings` - Configuración

### Diferencias Clave: Template → Lubricentro

| Aspecto | Template Original | Nuestra Adaptación |
|---------|------------------|-------------------|
| **Dashboard** | Genérico (ecommerce, analytics) | Específico de lubricentro |
| **Navegación** | Rutas genéricas | Rutas de dominio específico |
| **Componentes** | UI genérica | Adaptados a casos de uso del lubricentro |
| **Backend** | Sin backend | Integración con Rails API |
| **Datos** | Mock data | Datos reales del sistema |

## Configuraciones de Desarrollo

### Backend Rails Setup

```ruby
# config/application.rb
config.api_only = true
config.middleware.use ActionDispatch::Cookies
config.middleware.use ActionDispatch::Session::CookieStore

# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:5173' # Vite dev server
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

### Frontend Vite Setup

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});

// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
    },
  },
  plugins: [],
};
```

## Base de Datos

### Desarrollo: SQLite3

```ruby
# config/database.yml
development:
  adapter: sqlite3
  database: storage/development.sqlite3
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  timeout: 5000

test:
  adapter: sqlite3
  database: storage/test.sqlite3
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  timeout: 5000
```

### Producción: PostgreSQL

```ruby
production:
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  database: <%= ENV["DATABASE_NAME"] %>
  username: <%= ENV["DATABASE_USERNAME"] %>
  password: <%= ENV["DATABASE_PASSWORD"] %>
  host: <%= ENV["DATABASE_HOST"] %>
  port: <%= ENV["DATABASE_PORT"] %>
```

## Herramientas de Desarrollo

### Scripts de Desarrollo

```json
// package.json (frontend)
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

```sh
# Procfile.dev
web: cd backend && bin/rails server -p 3000
frontend: cd frontend && npm run dev
```

### Comandos Comunes (Frontend)

- **Instalar dependencias**: `cd frontend && npm install`
- **Iniciar desarrollo**: `cd frontend && npm run dev`
- **Ejecutar tests**: `cd frontend && npm test`
- **Añadir dependencia**: `cd frontend && npm install <package>`
- **Añadir dependencia de desarrollo**: `cd frontend && npm install -D <package>`

### Testing Setup

```ruby
# spec/rails_helper.rb
RSpec.configure do |config|
  config.use_transactional_fixtures = true
  config.include FactoryBot::Syntax::Methods
end

# spec/factories/customers.rb
FactoryBot.define do
  factory :customer do
    nombre { Faker::Name.name }
    telefono { Faker::PhoneNumber.phone_number }
    email { Faker::Internet.email }
  end
end
```

## Arquitectura de Deploy

### Backend: Railway/Heroku

```

## 🚀 Vite Configuration & Path Aliases

### Path Aliases Configurados

**Ubicación**: `frontend/vite.config.js`

```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@components': path.resolve(__dirname, './src/components'),
    '@ui': path.resolve(__dirname, './src/components/ui'),
    '@common': path.resolve(__dirname, './src/components/common'),
    '@layout': path.resolve(__dirname, './src/layout'),
    '@pages': path.resolve(__dirname, './src/pages'),
    '@hooks': path.resolve(__dirname, './src/hooks'),
    '@services': path.resolve(__dirname, './src/services'),
    '@utils': path.resolve(__dirname, './src/utils'),
    '@contexts': path.resolve(__dirname, './src/contexts'),
    '@icons': path.resolve(__dirname, './src/icons'),
    '@assets': path.resolve(__dirname, './src/assets'),
  },
}
```

### Uso de Path Aliases

**✅ CORRECTO - Usar aliases:**
```javascript
import CustomersTable from '@components/features/customers/CustomersTable';
import { useCustomers } from '@services/customersService';
import Layout from '@layout/Layout';
import Button from '@ui/Button';
```

**❌ INCORRECTO - Usar rutas relativas:**
```javascript
import CustomersTable from '../components/features/customers/CustomersTable';
import { useCustomers } from '../services/customersService';
```

### Beneficios de los Path Aliases

1. **Imports más limpios**: No más `../../../` 
2. **Refactoring seguro**: Mover archivos no rompe imports
3. **Mejor legibilidad**: Fácil identificar de dónde viene cada import
4. **Consistencia**: Patrón uniforme en todo el proyecto
5. **IDE Support**: Autocompletado mejorado

### Reglas de Uso

- **SIEMPRE usar aliases** para imports internos del proyecto
- **NUNCA usar rutas relativas** para archivos dentro de `src/`
- **Usar rutas relativas** solo para imports del mismo directorio
- **Mantener consistencia** en el uso de aliases en todo el proyecto
