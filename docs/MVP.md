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

| Módulo                              | Backend | Frontend | Estado              |
|-------------------------------------|---------|----------|---------------------|
| Autenticación (JWT)                 | ✅      | ✅       | Completo            |
| Clientes (CRUD)                     | ✅      | ✅       | Completo            |
| Vehículos (CRUD)                    | ✅      | ✅       | Completo            |
| Productos (CRUD)                    | ✅      | ✅       | Completo            |
| Servicios (CRUD)                    | ✅      | ✅       | Completo            |
| Atenciones (CRUD)                   | ✅      | ✅       | Completo            |
| Presupuestos (CRUD)                 | ✅      | ✅       | Completo            |
| Conversión presupuesto → atención   | ✅      | ✅       | Completo            |
| Notificaciones WhatsApp (reminders) | ❌      | ❌       | Fase 2              |
| Inbox Omnicanal + Agente IA         | ❌      | ❌       | Fase 2              |

---

## Roadmap Post-MVP

### Fase 2 — Automatización y Comunicación
- [ ] **Motor de Notificaciones Proactivas** — recordatorios de service por WhatsApp via Solid Queue + cron. Ver [FEATURE_NOTIFICATIONS.md](./FEATURE_NOTIFICATIONS.md)
- [ ] **Inbox Omnicanal con Agente IA** — bandeja centralizada de WhatsApp con triage automático, RAG sobre catálogo (pgvector) y escalado a humano. Ver [FEATURE_OMNICHANNEL_INBOX.md](./FEATURE_OMNICHANNEL_INBOX.md)
- [ ] Generación de PDF de presupuestos
- [ ] Envío de presupuestos por email
- [ ] Firmas digitales
- [ ] Dashboard con métricas (tasa de conversión, productos más cotizados)

### Fase 3 — Escala
- [ ] Turnos/agenda integrada con el inbox
- [ ] Notificaciones push (web)
- [ ] Reportes avanzados
