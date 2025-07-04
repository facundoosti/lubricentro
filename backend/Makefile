# Makefile para API en Rails con Docker

# ------------------------------------------------------------------------------
# CONFIGURACIÓN
# Personaliza estas variables según tu proyecto.
# ------------------------------------------------------------------------------

# Nombre de la aplicación/servicio web en tu docker-compose.yml
APP_NAME := web

# Comandos base de Docker Compose. El --rm elimina el contenedor después de cada ejecución.
COMPOSE_RUN  := docker-compose run --rm $(APP_NAME)
COMPOSE_EXEC := docker-compose exec $(APP_NAME)
COMPOSE_LOGS := docker-compose logs -f

# ------------------------------------------------------------------------------
# COMANDOS
# El objetivo por defecto es 'help', así que `make` mostrará la ayuda.
# ------------------------------------------------------------------------------
.DEFAULT_GOAL := help

.PHONY: help build up start down stop destroy logs ps shell console c test test-file db-setup db-create db-migrate db-seed db-reset routes

# Comandos de Ayuda
help: ## 📖 Muestra esta lista de ayuda con todos los comandos disponibles.
	@echo "🚗 Sistema Lubricentro - Comandos Disponibles"
	@echo "=============================================="
	@echo ""
	@echo "🐳 GESTIÓN DE DOCKER:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / && $$2 ~ /🐳|🚀|🛑|💣|📜|📊/ {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "🐚 CONSOLAS Y SHELL:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / && $$2 ~ /🐚|💎/ {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "🛠️  BASE DE DATOS Y RAILS:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / && $$2 ~ /🛠️|🌱|🏃|🌰|♻️|🗺️/ {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "🧪 TESTING:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / && $$2 ~ /🧪|🔬/ {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "📖 AYUDA:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / && $$2 ~ /📖/ {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ------------------------------------------------------------------------------
# GESTIÓN DE DOCKER
# ------------------------------------------------------------------------------

build: ## 🐳 Construye o reconstruye las imágenes de Docker.
	@echo "🏗️  Construyendo imágenes de Docker..."
	@docker-compose build

up: ## 🚀 Inicia todos los servicios de Docker en segundo plano.
	@echo "🚀 Iniciando contenedores Docker..."
	@docker-compose up -d

start: up ## ✨ Alias para 'up'.

down: ## 🛑 Detiene todos los servicios de Docker.
	@echo "🛑 Deteniendo contenedores Docker..."
	@docker-compose down

stop: down ## ✨ Alias para 'down'.

destroy: ## 💣 Detiene y elimina contenedores, redes y volúmenes. ¡CUIDADO!
	@echo "💣  Destruyendo todo (contenedores, redes, volúmenes)..."
	@docker-compose down -v

logs: ## 📜 Muestra y sigue los logs de todos los servicios.
	@echo "📜 Mostrando logs..."
	@$(COMPOSE_LOGS)

ps: ## 📊 Lista los contenedores en ejecución.
	@echo "📊 Estado de los contenedores:"
	@docker-compose ps

# ------------------------------------------------------------------------------
# CONSOLAS Y SHELL
# ------------------------------------------------------------------------------

shell: ## 🐚 Inicia una sesión de shell (bash) dentro del contenedor web.
	@echo "🐚 Accediendo al shell del contenedor..."
	@$(COMPOSE_EXEC) /bin/bash

console: ## 💎 Inicia la consola de Rails.
	@echo "💎 Iniciando consola de Rails..."
	@$(COMPOSE_RUN) bundle exec rails console

c: console ## ✨ Alias para 'console'.

# ------------------------------------------------------------------------------
# BASE DE DATOS Y RAILS
# ------------------------------------------------------------------------------

db-setup: ## 🛠️  Configura la base de datos (crea, migra, carga seeds). Ideal para la primera vez.
	@echo "🛠️  Configurando la base de datos (create, migrate, seed)..."
	@$(COMPOSE_RUN) bundle exec rails db:prepare

db-create: ## 🌱 Crea la base de datos.
	@echo "🌱 Creando la base de datos..."
	@$(COMPOSE_RUN) bundle exec rails db:create

db-migrate: ## 🏃 Ejecuta las migraciones pendientes.
	@echo "🏃 Ejecutando migraciones..."
	@$(COMPOSE_RUN) bundle exec rails db:migrate

db-seed: ## 🌰 Carga los datos iniciales (seeds).
	@echo "🌰 Cargando seeds..."
	@$(COMPOSE_RUN) bundle exec rails db:seed

db-reset: ## ♻️  Reinicia la base de datos (drop, setup).
	@echo "♻️  Reiniciando la base de datos..."
	@$(COMPOSE_RUN) bundle exec rails db:reset

routes: ## 🗺️  Muestra todas las rutas de la API.
	@echo "🗺️  Listando rutas..."
	@$(COMPOSE_RUN) bundle exec rails routes

# ------------------------------------------------------------------------------
# TESTING (CONFIGURADO PARA RSPEC)
# ------------------------------------------------------------------------------

test: ## 🧪 Ejecuta toda la suite de pruebas con RSpec.
	@echo "🧪 Ejecutando pruebas con RSpec..."
	@RAILS_ENV=test $(COMPOSE_RUN) bundle exec rspec

# Para ejecutar un archivo de test específico: make test-file path=spec/models/mi_modelo_spec.rb
test-file: ## 🔬 Ejecuta un archivo de test específico de RSpec. Uso: make test-file path=ruta/al/test.
	@echo "🔬 Ejecutando test de RSpec en $(path)..."
	@RAILS_ENV=test $(COMPOSE_RUN) bundle exec rspec $(path)