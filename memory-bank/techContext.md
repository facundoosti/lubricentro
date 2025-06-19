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

# Deployment
gem "kamal"
gem "thruster"
```

### Frontend: React + Vite + Tailwind CSS

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.3.0",
    "@tanstack/react-query": "^4.24.0",
    "date-fns": "^2.29.0",
    "react-hook-form": "^7.43.0",
    "react-hot-toast": "^2.4.0"
  },
  "devDependencies": {
    "vite": "^4.1.0",
    "tailwindcss": "^3.2.0",
    "autoprefixer": "^10.4.13",
    "postcss": "^8.4.21",
    "@vitejs/plugin-react": "^3.1.0",
    "vitest": "^0.28.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

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

```ruby
# Procfile.dev
web: cd backend && bin/rails server -p 3000
frontend: cd frontend && npm run dev
```

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

```dockerfile
# Dockerfile
FROM ruby:3.2-alpine
WORKDIR /app
COPY Gemfile* ./
RUN bundle install
COPY . .
EXPOSE 3000
CMD ["rails", "server", "-b", "0.0.0.0"]
```

### Frontend: Netlify/Vercel

```javascript
// netlify.toml
[build];
command = "npm run build";
publish = "dist"[[redirects]];
from = "/*";
to = "/index.html";
status = 200;
```

## Variables de Entorno

### Backend (.env)

```bash
# Development
DATABASE_URL=sqlite3:storage/development.sqlite3

# Production
DATABASE_URL=postgresql://user:pass@host:port/dbname
JWT_SECRET_KEY=your-secret-key
RAILS_ENV=production
CORS_ORIGINS=https://yourdomain.com
```

### Frontend (.env)

```bash
# Development
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Production
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

## Estructura de Directorios

### Backend

```
backend/
├── app/
│   ├── controllers/api/v1/
│   ├── models/
│   ├── serializers/
│   └── services/
├── config/
├── db/migrate/
├── spec/
└── Dockerfile
```

### Frontend

```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── styles/
├── public/
└── dist/
```

## Performance & Monitoring

### Backend Monitoring

```ruby
# Gemfile
gem "rack-mini-profiler" # development
gem "memory_profiler" # development
gem "bullet" # N+1 detection

# Production monitoring
gem "sentry-ruby"
gem "sentry-rails"
```

### Frontend Monitoring

```javascript
// Sentry for error tracking
import * as Sentry from "@sentry/react";

// Web Vitals for performance
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";
```

## Development Workflow

### Git Flow

```bash
main (production)
├── develop (staging)
├── feature/customer-management
├── feature/appointment-system
└── hotfix/urgent-bug-fix
```

### Commands Frecuentes

```bash
# Backend
cd backend
bundle install
rails db:create db:migrate db:seed
rails server
rails console
rspec

# Frontend
cd frontend
npm install
npm run dev
npm run build
npm test
```
