# MVP - Sistema Lubricentro

## Alcance del MVP

Sistema de gestión para lubricentro con las siguientes capacidades core:
- Gestión de clientes y vehículos
- Catálogo de productos y servicios
- Registro de atenciones (service records)
- Presupuestos con ciclo de vida completo
- Autenticación de usuarios

---

## Estado Actual

| Módulo                  | Backend | Frontend | Estado    |
|-------------------------|---------|----------|-----------|
| Autenticación (JWT)     | ✅      | ✅       | Completo  |
| Clientes (CRUD)         | ✅      | ✅       | Completo  |
| Vehículos (CRUD)        | ✅      | ✅       | Completo  |
| Productos (CRUD)        | ✅      | ✅       | Completo  |
| Servicios (CRUD)        | ✅      | ✅       | Completo  |
| Atenciones (CRUD)       | ✅      | ⚠️       | Pendiente modales |
| Presupuestos (CRUD)     | ✅      | ✅       | Completo  |
| Conversión presupuesto → atención | ✅ | ✅ | Completo |

---

## Pendiente para completar el MVP

- [ ] Modales de creación/edición de atenciones (ServiceRecord) en el frontend

---

## Roadmap Post-MVP

### Fase 2
- [ ] Generación de PDF de presupuestos
- [ ] Envío de presupuestos por email
- [ ] Firmas digitales
- [ ] Dashboard con métricas (tasa de conversión, productos más cotizados)

### Fase 3
- [ ] Integración con WhatsApp (agente de cotización automático)
- [ ] Notificaciones push
- [ ] Turnos/agenda
- [ ] Reportes avanzados
