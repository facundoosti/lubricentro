#!/bin/bash

# Script de inicio rápido para el entorno de desarrollo del Sistema Lubricentro
# Autor: Sistema Lubricentro
# Versión: 1.0

set -e

echo "🚗 Sistema Lubricentro - Entorno de Desarrollo"
echo "=============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado. Por favor instala Docker primero."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
        exit 1
    fi

    print_success "Docker y Docker Compose están instalados"
}

# Verificar si los puertos están disponibles
check_ports() {
    local ports=("3000" "5173" "5432" "6379")
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Puerto $port está en uso. El servicio podría no iniciar correctamente."
        fi
    done
}

# Crear archivo .env si no existe
setup_env() {
    if [ ! -f .env ]; then
        print_status "Creando archivo .env desde .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Archivo .env creado"
        else
            print_warning "Archivo .env.example no encontrado. Creando .env básico..."
            cat > .env << EOF
# Variables de entorno para desarrollo
RAILS_ENV=development
RAILS_MASTER_KEY=dummy_key_for_dev
DATABASE_URL=postgresql://lubricentro:lubricentro123@localhost:5432/lubricentro_development
JWT_SECRET=lubricentro_jwt_secret_dev
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Lubricentro
EOF
            print_success "Archivo .env básico creado"
        fi
    else
        print_status "Archivo .env ya existe"
    fi
}

# Construir imágenes
build_images() {
    print_status "Construyendo imágenes Docker..."
    docker-compose build
    print_success "Imágenes construidas correctamente"
}

# Iniciar servicios
start_services() {
    print_status "Iniciando servicios..."
    docker-compose up -d
    
    print_status "Esperando a que los servicios estén listos..."
    sleep 10
    
    # Verificar estado de los servicios
    if docker-compose ps | grep -q "Up"; then
        print_success "Servicios iniciados correctamente"
    else
        print_error "Algunos servicios no se iniciaron correctamente"
        docker-compose logs
        exit 1
    fi
}

# Mostrar información de acceso
show_access_info() {
    echo ""
    echo "🎉 ¡Entorno de desarrollo listo!"
    echo "================================"
    echo ""
    echo "📱 Frontend (React):"
    echo "   URL: http://localhost:5173"
    echo ""
    echo "🔧 Backend (Rails API):"
    echo "   URL: http://localhost:3000"
    echo "   API Docs: http://localhost:3000/api/v1"
    echo ""
    echo "🗄️  Base de datos:"
    echo "   PostgreSQL: localhost:5432"
    echo "   Usuario: lubricentro"
    echo "   Base de datos: lubricentro_development"
    echo ""
    echo "📊 Monitoreo:"
    echo "   Ver logs: docker-compose logs -f"
    echo "   Estado servicios: docker-compose ps"
    echo ""
    echo "🛠️  Comandos útiles:"
    echo "   Rails console: docker-compose exec backend rails console"
    echo "   PostgreSQL: docker-compose exec postgres psql -U lubricentro -d lubricentro_development"
    echo "   Frontend build: docker-compose exec frontend npm run build"
    echo ""
}

# Función principal
main() {
    echo "Iniciando configuración del entorno de desarrollo..."
    echo ""
    
    check_docker
    check_ports
    setup_env
    build_images
    start_services
    show_access_info
}

# Ejecutar función principal
main "$@" 