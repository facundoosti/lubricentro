# Makefile para Sistema Lubricentro
# Comandos útiles para desarrollo

.PHONY: help start stop restart build logs clean test db-reset db-seed console shell

# Variables
COMPOSE_FILE = docker-compose.yml
BACKEND_SERVICE = backend
FRONTEND_SERVICE = frontend
POSTGRES_SERVICE = postgres

# Comando por defecto
help: ## Mostrar esta ayuda
	@echo "🚗 Sistema Lubricentro - Comandos disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Gestión de servicios
start: ## Iniciar todos los servicios
	docker-compose up -d

stop: ## Detener todos los servicios
	docker-compose down

restart: ## Reiniciar todos los servicios
	docker-compose restart

build: ## Construir todas las imágenes
	docker-compose build

build-no-cache: ## Construir imágenes sin cache
	docker-compose build --no-cache

logs: ## Ver logs de todos los servicios
	docker-compose logs -f

logs-backend: ## Ver logs del backend
	docker-compose logs -f $(BACKEND_SERVICE)

logs-frontend: ## Ver logs del frontend
	docker-compose logs -f $(FRONTEND_SERVICE)

logs-db: ## Ver logs de la base de datos
	docker-compose logs -f $(POSTGRES_SERVICE)

# Desarrollo
dev: ## Iniciar entorno de desarrollo completo
	@echo "🚀 Iniciando entorno de desarrollo..."
	docker-compose up -d
	@echo "✅ Servicios iniciados"
	@echo "📱 Frontend: http://localhost:5173"
	@echo "🔧 Backend: http://localhost:3000"
	@echo "🗄️  PostgreSQL: localhost:5432"

dev-local: ## Iniciar solo base de datos (para desarrollo local)
	docker-compose up -d $(POSTGRES_SERVICE)
	@echo "✅ Base de datos iniciada"
	@echo "🗄️  PostgreSQL: localhost:5432"
	@echo "🔧 Ejecuta backend localmente: cd backend && rails server"
	@echo "📱 Ejecuta frontend localmente: cd frontend && npm run dev"

# Base de datos
db-reset: ## Resetear base de datos
	docker-compose exec $(BACKEND_SERVICE) rails db:drop db:create db:migrate db:seed

db-migrate: ## Ejecutar migraciones
	docker-compose exec $(BACKEND_SERVICE) rails db:migrate

db-seed: ## Ejecutar seed data
	docker-compose exec $(BACKEND_SERVICE) rails db:seed

db-console: ## Acceder a consola de PostgreSQL
	docker-compose exec $(POSTGRES_SERVICE) psql -U lubricentro -d lubricentro_development

# Consolas y shells
console: ## Acceder a Rails console
	docker-compose exec $(BACKEND_SERVICE) rails console

shell-backend: ## Acceder al shell del backend
	docker-compose exec $(BACKEND_SERVICE) bash

shell-frontend: ## Acceder al shell del frontend
	docker-compose exec $(FRONTEND_SERVICE) sh

# Testing
test-backend: ## Ejecutar tests del backend
	docker-compose exec $(BACKEND_SERVICE) rspec

test-frontend: ## Ejecutar tests del frontend
	docker-compose exec $(FRONTEND_SERVICE) npm test

test: ## Ejecutar todos los tests
	@echo "🧪 Ejecutando tests del backend..."
	docker-compose exec $(BACKEND_SERVICE) rspec
	@echo "🧪 Ejecutando tests del frontend..."
	docker-compose exec $(FRONTEND_SERVICE) npm test

# Linting
lint-backend: ## Ejecutar linter del backend
	docker-compose exec $(BACKEND_SERVICE) bundle exec rubocop

lint-frontend: ## Ejecutar linter del frontend
	docker-compose exec $(FRONTEND_SERVICE) npm run lint

lint: ## Ejecutar todos los linters
	@echo "🔍 Ejecutando linter del backend..."
	docker-compose exec $(BACKEND_SERVICE) bundle exec rubocop
	@echo "🔍 Ejecutando linter del frontend..."
	docker-compose exec $(FRONTEND_SERVICE) npm run lint

# Limpieza
clean: ## Limpiar contenedores y volúmenes
	docker-compose down -v
	docker system prune -f

clean-all: ## Limpieza completa (¡CUIDADO!)
	docker-compose down -v --rmi all
	docker system prune -a -f

# Estado y monitoreo
status: ## Ver estado de los servicios
	docker-compose ps

stats: ## Ver estadísticas de uso
	docker stats

# Instalación de dependencias
install-backend: ## Instalar gems del backend
	docker-compose exec $(BACKEND_SERVICE) bundle install

install-frontend: ## Instalar dependencias del frontend
	docker-compose exec $(FRONTEND_SERVICE) npm install

install: ## Instalar todas las dependencias
	@echo "📦 Instalando dependencias del backend..."
	docker-compose exec $(BACKEND_SERVICE) bundle install
	@echo "📦 Instalando dependencias del frontend..."
	docker-compose exec $(FRONTEND_SERVICE) npm install

# Build de producción
build-frontend: ## Build del frontend para producción
	docker-compose exec $(FRONTEND_SERVICE) npm run build

# Health checks
health: ## Verificar salud de los servicios
	@echo "🏥 Verificando salud de los servicios..."
	@docker-compose ps
	@echo ""
	@echo "🔍 Verificando conectividad..."
	@curl -s http://localhost:3000/health || echo "❌ Backend no responde"
	@curl -s http://localhost:5173 > /dev/null && echo "✅ Frontend responde" || echo "❌ Frontend no responde"

# Comandos específicos del proyecto
generate-model: ## Generar nuevo modelo (ej: make generate-model MODEL=Customer)
	docker-compose exec $(BACKEND_SERVICE) rails generate model $(MODEL)

generate-controller: ## Generar nuevo controller (ej: make generate-controller CONTROLLER=Customers)
	docker-compose exec $(BACKEND_SERVICE) rails generate controller $(CONTROLLER)

# Comandos de desarrollo rápido
quick-start: ## Inicio rápido del proyecto
	@echo "🚀 Inicio rápido del Sistema Lubricentro..."
	make dev
	@echo "⏳ Esperando a que los servicios estén listos..."
	@sleep 15
	make health

quick-stop: ## Parada rápida
	@echo "🛑 Deteniendo servicios..."
	make stop
	@echo "✅ Servicios detenidos"

# Información
info: ## Mostrar información del proyecto
	@echo "🚗 Sistema Lubricentro"
	@echo "======================"
	@echo "📱 Frontend: http://localhost:5173"
	@echo "🔧 Backend: http://localhost:3000"
	@echo "🗄️  PostgreSQL: localhost:5432"
	@echo ""
	@echo "📊 Comandos útiles:"
	@echo "  make dev          - Iniciar entorno completo"
	@echo "  make logs         - Ver logs"
	@echo "  make console      - Rails console"
	@echo "  make test         - Ejecutar tests"
	@echo "  make clean        - Limpiar contenedores" 