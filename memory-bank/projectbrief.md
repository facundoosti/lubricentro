# Project Brief - Sistema de Gestión Lubricentro

## Visión del Proyecto

Desarrollar un sistema de gestión integral para lubricentro que permita administrar clientes, vehículos, turnos, servicios y generar reportes básicos. El objetivo es digitalizar y optimizar las operaciones diarias del negocio.

## Objetivos Principales

1. **Digitalizar la gestión de clientes y vehículos**
2. **Optimizar la programación de turnos**
3. **Automatizar el registro de servicios y cálculo de costos**
4. **Generar reportes básicos para toma de decisiones**
5. **Mejorar la experiencia del cliente con un sistema organizado**

## Alcance del MVP

### Funcionalidades Esenciales

- Gestión de Clientes (CRUD)
- Gestión de Vehículos asociados a clientes
- Sistema de Turnos (crear, visualizar, cancelar)
- Catálogo de Productos y Servicios con precios
- Registro de Atenciones/Servicios realizados
- Cálculo automático de costos totales
- Estadísticas básicas (clientes y productos más utilizados)

### Fuera del Alcance del MVP

- Sistema de facturación completo
- Integración con sistemas contables externos
- Gestión de inventario avanzada
- Sistema de notificaciones automáticas
- Múltiples ubicaciones/sucursales

## Stack Tecnológico Definido

- **Frontend**: React + Tailwind CSS + Vite
- **Backend**: Ruby on Rails 8.0.2 (API mode)
- **Base de Datos**: SQLite (desarrollo) → PostgreSQL (producción)
- **Autenticación**: JWT tokens
- **Despliegue**: Backend (Heroku/Railway), Frontend (Netlify/Vercel)

## Criterios de Éxito del MVP

1. Poder registrar y gestionar clientes y sus vehículos
2. Agendar turnos y visualizarlos
3. Registrar una atención completa con productos/servicios
4. Calcular automáticamente el costo total de una atención
5. Generar reportes básicos de uso
6. Interface intuitiva y responsive

## Estimación de Tiempo

**Total: 7-10 semanas** dividido en 4 fases:

- Fase 1: Planificación y Diseño (1-2 días)
- Fase 2: Backend Rails API (2-3 semanas)
- Fase 3: Frontend React (3-4 semanas)
- Fase 4: Pruebas y Despliegue (1 semana)

## Limitaciones y Consideraciones

- MVP enfocado en funcionalidad esencial
- UI simple pero profesional
- Autenticación básica (sin roles complejos)
- Reportes simples (sin analytics avanzados)
- Base de datos simple (sin optimizaciones complejas)
