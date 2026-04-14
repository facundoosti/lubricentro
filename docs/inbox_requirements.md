# Inbox — Requisitos y Casos de Uso

Sistema de mensajería WhatsApp bidireccional integrado con Kapso (wrapper de Meta WhatsApp Cloud API v24), IA conversacional (OpenAI) y WebSockets (ActionCable).

> Fuente de verdad de payloads: [docs.kapso.ai](https://docs.kapso.ai/docs/platform/webhooks/event-types)

---

## Arquitectura General

```
Cliente WhatsApp
      │
      ▼
Kapso API (proxy Meta WA Cloud API v24)
      │
      ├─ POST /webhooks/whatsapp  ──►  Webhooks::WhatsappController
      │    Header: X-Webhook-Signature (HMAC-SHA256)              │
      │    Header: X-Webhook-Event (tipo de evento)     MessageProcessorJob
      │                                                        (queue: inbox)
      │                                         ┌──────────────┼─────────────────┐
      │                                         ▼              ▼                 ▼
      │                               handle_message_  handle_message_  handle_message_
      │                               received         delivered/read   failed
      │                                    │
      │                          ┌─────────┴─────────┐
      │                          ▼                   ▼
      │                    SupplierPhone?         Conversation.bot?
      │                    → default reply        → AiAgentJob (queue: ai)
      │                                               │
      │                                       AiAgentService
      │                                       (OpenAI + RAG pgvector)
      │
      ├─ GET/PATCH /api/v1/conversations/*  ──►  ConversationsController
      └─ POST /api/v1/conversations/:id/messages ──► MessagesController
                                                          │
                                              WhatsAppService (HTTP → Kapso)

ActionCable broadcast → canal "inbox" → Frontend React
```

---

## Payloads Kapso (v2 format)

### Mensaje inbound (`whatsapp.message.received`)

```json
{
  "message": {
    "id": "wamid.AAA001",
    "timestamp": "1730092801",
    "type": "text",
    "text": { "body": "Hola, necesito un turno" },
    "kapso": {
      "direction": "inbound",
      "status": "received",
      "processing_status": "pending",
      "origin": "cloud_api",
      "phone_number": "+5491112345678",
      "phone_number_id": "123456789012345",
      "has_media": false
    }
  },
  "conversation": {
    "id": "conv_abc",
    "phone_number": "+5491112345678",
    "status": "active",
    "last_active_at": "2025-10-28T14:26:01Z",
    "created_at": "2025-10-28T13:40:00Z",
    "updated_at": "2025-10-28T14:26:01Z",
    "metadata": {},
    "phone_number_id": "123456789012345"
  },
  "is_new_conversation": true,
  "phone_number_id": "123456789012345"
}
```

**Campos que usa el job:**
- `message.id` → `whatsapp_message_id` (idempotencia)
- `message.type` → debe ser `"text"` para procesar; otros tipos se ignoran silenciosamente
- `message.text.body` → `message.body`
- `message.kapso.direction` → debe ser `"inbound"` para entrar al flujo de recepción
- `message.kapso.status` → `"received"` cae en el `else` del router (no matched por `delivered`/`read`/`failed`)
- `conversation.phone_number` → `conversation.whatsapp_phone` / lookup de `SupplierPhone` / `Customer`
- `is_new_conversation` → **no consumido** por el job (usa `find_or_create_by!` propio)

---

### Mensaje entregado (`whatsapp.message.delivered`)

```json
{
  "message": {
    "id": "wamid.OUT001",
    "timestamp": "1730092888",
    "type": "text",
    "text": { "body": "En camino" },
    "kapso": {
      "direction": "outbound",
      "status": "delivered",
      "processing_status": "completed",
      "origin": "cloud_api",
      "has_media": false,
      "statuses": [
        { "id": "wamid.OUT001", "status": "sent",      "timestamp": "1730092860", "recipient_id": "+5491112345678" },
        { "id": "wamid.OUT001", "status": "delivered", "timestamp": "1730092888", "recipient_id": "+5491112345678" }
      ]
    }
  },
  "conversation": {
    "id": "conv_abc",
    "phone_number": "+5491112345678",
    "phone_number_id": "123456789012345"
  },
  "is_new_conversation": false,
  "phone_number_id": "123456789012345"
}
```

**Campos que usa el job:**
- `message.id` (wamid) → `Message.find_by(whatsapp_message_id: wamid)`
- `message.kapso.status == "delivered"` → router → `handle_message_delivered`

---

### Mensaje leído (`whatsapp.message.read`)

Mismo formato que `delivered`, con `message.kapso.status: "read"` y una entrada adicional en `statuses`.

**Campos que usa el job:**
- `message.id` → busca `Message` por `whatsapp_message_id`
- `message.kapso.status == "read"` → `handle_message_read`
- Efecto extra: si `delivered_at` estaba vacío, se retro-stampa con `Time.current`

---

### Mensaje fallido (`whatsapp.message.failed`)

```json
{
  "message": {
    "id": "wamid.OUT001",
    "timestamp": "1730093200",
    "type": "text",
    "kapso": {
      "direction": "outbound",
      "status": "failed",
      "processing_status": "completed",
      "origin": "cloud_api",
      "has_media": false,
      "statuses": [
        { "id": "wamid.OUT001", "status": "sent",   "timestamp": "1730093100", "recipient_id": "+5491112345678" },
        {
          "id": "wamid.OUT001",
          "status": "failed",
          "timestamp": "1730093200",
          "recipient_id": "+5491112345678",
          "errors": [
            {
              "code": 131047,
              "title": "Re-engagement message",
              "message": "More than 24 hours have passed since the recipient last replied"
            }
          ]
        }
      ]
    }
  },
  "conversation": {
    "id": "conv_abc",
    "phone_number": "+5491112345678",
    "phone_number_id": "123456789012345"
  },
  "is_new_conversation": false,
  "phone_number_id": "123456789012345"
}
```

**Campos que usa el job:**
- `message.id` → `wamid` para log y broadcast
- `conversation.phone_number` → `Conversation.find_by(whatsapp_phone: phone)`
- `message.kapso.statuses.last["errors"]` → array de `{ code, title }` → formateado como `"131047: Re-engagement message"` en alert

---

### Payload batch (buffering habilitado)

```json
{
  "type": "whatsapp.message.received",
  "batch": true,
  "data": [
    {
      "message": { "id": "wamid.111", "type": "text", "text": { "body": "Primero" }, "kapso": { "direction": "inbound", "status": "received", "phone_number": "+5491112345678" } },
      "conversation": { "phone_number": "+5491112345678" },
      "is_new_conversation": false,
      "phone_number_id": "123456789012345"
    },
    {
      "message": { "id": "wamid.112", "type": "text", "text": { "body": "Segundo" }, "kapso": { "direction": "inbound", "status": "received", "phone_number": "+5491112345678" } },
      "conversation": { "phone_number": "+5491112345678" },
      "is_new_conversation": false,
      "phone_number_id": "123456789012345"
    }
  ],
  "batch_info": {
    "size": 2,
    "window_ms": 5000,
    "first_sequence": 101,
    "last_sequence": 102,
    "conversation_id": "conv_abc"
  }
}
```

**Detección en el controller:** `payload["batch"] == true` → itera `payload["data"]`, encola un `MessageProcessorJob` por elemento.
`batch_info` no es consumido actualmente.

---

## Cabeceras HTTP del Webhook

| Header                | Descripción                                                         |
|-----------------------|---------------------------------------------------------------------|
| `X-Webhook-Signature` | HMAC-SHA256 del raw body con `KAPSO_WEBHOOK_SECRET`                 |
| `X-Webhook-Event`     | Tipo de evento (`whatsapp.message.received`, etc.) — informativo    |
| `X-Webhook-Batch`     | `"true"` cuando es payload batch (alternativa al campo `batch`)     |
| `Content-Type`        | `application/json`                                                  |

**Verificación en el controller:**
```ruby
secret   = ENV.fetch("KAPSO_WEBHOOK_SECRET")
expected = OpenSSL::HMAC.hexdigest("SHA256", secret, raw_body)
Rack::Utils.secure_compare(signature, expected)
```

> ⚠️ La verificación opera sobre el **raw body** (`request.body.read`), antes de que Rails parsee el JSON. Si el middleware modifica el body (rewind, encoding), la firma fallará.

---

## Modelos y Estados

### Conversation

| Campo              | Tipo   | Notas                                           |
|--------------------|--------|-------------------------------------------------|
| `whatsapp_phone`   | string | único, normalizado (`+549...`)                  |
| `status`           | enum   | `bot` / `needs_human` / `supplier` / `archived` |
| `customer_id`      | FK     | nullable — se vincula si el teléfono existe     |
| `label`            | string | etiqueta libre del agente                       |
| `last_message_at`  | datetime | actualizado en cada mensaje enviado/recibido  |

**Transiciones de estado:**

```
           inbound de SupplierPhone / IA clasificar_intencion:proveedor / mark_as_supplier manual
    bot  ─────────────────────────────────────────────────────────────────────────────► supplier
     │
     │   IA derivar_a_humano / mensaje failed / assign_human manual
     └──────────────────────────────────────────────────────────────────────────────► needs_human
     │
     │   (desde cualquier estado) archive manual
     └──────────────────────────────────────────────────────────────────────────────► archived
```

> ⚠️ No hay validación en el modelo que restrinja las transiciones. Cualquier estado puede ir a cualquier otro.

### Message

| Campo                  | Tipo     | Notas                                                  |
|------------------------|----------|--------------------------------------------------------|
| `direction`            | enum     | `inbound` / `outbound`                                 |
| `sender_type`          | enum     | `customer` / `bot` / `agent`                           |
| `body`                 | text     | contenido del mensaje, requerido                       |
| `whatsapp_message_id`  | string   | wamid de Kapso, unique (nullable); NULL para mensajes internos |
| `received_at`          | datetime | inbound: timestamp de llegada                          |
| `delivered_at`         | datetime | outbound: confirmación de entrega vía webhook Kapso    |
| `read_at`              | datetime | outbound: confirmación de lectura vía webhook Kapso    |

### SupplierPhone

| Campo          | Tipo   | Notas                                    |
|----------------|--------|------------------------------------------|
| `phone`        | string | único, normalizado (via `normalizes`)    |
| `company_name` | string | nullable — puede asignarse desde el chat |
| `notes`        | text   | nullable                                 |

---

## Flujos y Casos de Uso

### F1 — Mensaje entrante, conversación nueva (bot)

**Trigger:** Kapso envía `whatsapp.message.received` de número desconocido, tipo `text`.

**Flujo:**
1. `WhatsappController#receive` lee raw body, verifica firma HMAC-SHA256
2. Encola `MessageProcessorJob(payload)` → responde `200 OK` en < 10s
3. Job: `status == "received"`, `direction == "inbound"`, `type == "text"` → `handle_message_received`
4. `SupplierPhone.exists?(phone)` → `false`
5. `Conversation.find_or_create_by!(whatsapp_phone: phone)` → crea con `status: bot`
6. Intenta `Customer.find_by(phone: phone)` → vincula si existe
7. Idempotencia: `Message.exists?(whatsapp_message_id: wamid)` → `false` → continúa
8. Crea `Message(inbound, customer, body, whatsapp_message_id, received_at)`
9. `conversation.update!(last_message_at: now)`
10. Broadcast: `{ conversation_id, status: "bot", new_message: { id, body, direction, sender_type } }`
11. `conversation.bot?` → `AiAgentJob.perform_later(conversation.id, message.id)`
12. `AiAgentJob`: guard `status == "bot"` → `AiAgentService.process(body)` → crea outbound bot message → `WhatsAppService.send_message()` → broadcast

**Postcondición:** conversación en `bot`, respuesta IA enviada, UI actualizada via WS.

---

### F2 — Mensaje entrante, conversación existente en `bot`

Igual a F1 excepto paso 5 (usa conversación existente) y paso 7 (si wamid duplicado → `return` silencioso).

---

### F3 — Mensaje entrante, conversación en `needs_human`

Pasos 1–10 iguales a F1.  
Paso 11: `conversation.bot?` → `false`, `conversation.supplier?` → `false` → no se encola `AiAgentJob`.

**Postcondición:** mensaje guardado y visible en inbox. Sin respuesta automática.

---

### F4 — Mensaje de proveedor registrado (SupplierPhone)

**Trigger:** `whatsapp.message.received` de teléfono en `SupplierPhone`.

**Flujo:** pasos 1–3 de F1, luego:
4. `SupplierPhone.exists?(phone)` → `true`
5. Si conversación nueva → `status: supplier`; si existente en `bot` → `update!(status: "supplier")`
6–9. Crea message, actualiza `last_message_at`
10. Broadcast: `{ conversation_id, status: "supplier", new_message }`
11. `send_supplier_default_reply`:
    - Crea `Message(outbound, bot, SUPPLIER_DEFAULT_REPLY)`
    - Broadcast nuevo mensaje
    - `WhatsAppService.send_message()` (fallo aquí es rescatado — no aborta el job)

**Postcondición:** conversación en `supplier`, respuesta de cortesía enviada.

---

### F5 — Proveedor detectado por IA (`clasificar_intencion`)

**Trigger:** Conversación en `bot`, OpenAI invoca tool `clasificar_intencion` con `tipo: "proveedor"`.

1. `AiAgentService#handle_tool_calls` → `conversation.update!(status: "supplier")`
2. Broadcast: `{ conversation_id, status: "supplier" }`
3. Retorna texto de acuse

> El proveedor queda en `supplier` sin registro en `SupplierPhone` (solo la IA lo detectó).

---

### F6 — Escalación al humano por IA (`derivar_a_humano`)

**Trigger:** OpenAI invoca tool `derivar_a_humano`.

1. `conversation.update!(status: "needs_human")`
2. Broadcast: `{ conversation_id, status: "needs_human" }`
3. Retorna mensaje de cortesía al cliente

---

### F7 — Escalación manual por agente

**Trigger:** `PATCH /api/v1/conversations/:id/assign_human`

1. `conversation.update!(status: "needs_human")`
2. Broadcast: `{ conversation_id, status: "needs_human" }`
3. Retorna conversación serializada

---

### F8 — Respuesta manual del agente

**Trigger:** `POST /api/v1/conversations/:id/messages` con `{ body: "..." }`

1. Crea `Message(outbound, agent, body)`
2. `conversation.update!(last_message_at: now)`
3. `WhatsAppService.send_message(phone, text)`
4. Broadcast: `{ conversation_id, new_message }`
5. Retorna mensaje serializado (201)

---

### F9 — Archivar conversación

**Trigger:** `PATCH /api/v1/conversations/:id/archive`

1. `conversation.update!(status: "archived")`
2. Broadcast: `{ conversation_id, status: "archived" }`
3. Retorna conversación (200)

---

### F10 — Clasificación manual como proveedor

**Trigger:** `PATCH /api/v1/conversations/:id/mark_as_supplier`

1. `conversation.update!(status: "supplier")`
2. `SupplierPhone.find_or_create_by!(phone: conversation.whatsapp_phone)` con `company_name` y `notes` opcionales
3. Broadcast: `{ conversation_id, status: "supplier" }`

> ⚠️ `find_or_create_by!` solo asigna `company_name`/`notes` al **crear** el registro. Si el teléfono ya existe en `SupplierPhone`, los params se ignoran.

---

### F11 — Confirmación de entrega (`delivered`)

**Trigger:** Kapso envía webhook con `message.kapso.status: "delivered"`.

1. Job → `handle_message_delivered`
2. `Message.find_by(whatsapp_message_id: wamid)` — si no existe: `return` sin error
3. Si `delivered_at` ya tiene valor: `return` (idempotente)
4. `message.update!(delivered_at: now)`
5. Broadcast: `{ conversation_id, message_status: { id, wamid, status: "delivered" } }`

---

### F12 — Confirmación de lectura (`read`)

**Trigger:** Kapso envía webhook con `message.kapso.status: "read"`.

1. Job → `handle_message_read`
2. `Message.find_by(whatsapp_message_id: wamid)` — si no existe: `return`
3. Si `read_at` ya tiene valor: `return` (idempotente)
4. `message.update!(delivered_at: existing_or_now, read_at: now)` — retro-stampa `delivered_at` si faltaba
5. Broadcast: `{ conversation_id, message_status: { id, wamid, status: "read" } }`

---

### F13 — Mensaje fallido (`failed`)

**Trigger:** Kapso envía `message.kapso.status: "failed"` con `statuses[].errors`.

1. Job → `handle_message_failed`
2. Extrae: `wamid = message["id"]`, `phone = conversation["phone_number"]`, `errors = kapso.statuses.last["errors"]`
3. `Rails.logger.error(...)` con resumen `"code: title"`
4. `Conversation.find_by(whatsapp_phone: phone)` — si no existe: `return`
5. Si ya está en `needs_human`: `return` (idempotente)
6. `conversation.update!(status: "needs_human")`
7. Broadcast: `{ conversation_id, status: "needs_human", alert: { type: "message_failed", wamid, errors: "131047: Re-engagement message" } }`

---

### F14 — Payload en batch

**Trigger:** Kapso envía `{ "batch": true, "data": [...] }`.

1. Controller: `payload["batch"]` → itera `payload["data"]`
2. Encola un `MessageProcessorJob(event)` por cada elemento

---

### F15 — Envío de recordatorio de servicio

**Trigger:** `WhatsAppReminderJob.perform_later(service_record_id)`

1. `ServiceRecord.find(id)` → obtiene `customer` y `vehicle`
2. `ServiceReminder.create!(status: "pending")`
3. `WhatsAppService.send_reminder_template(phone, name, vehicle, due_date)` → template `service_reminder_v1`
4. `reminder.update!(status: "sent", sent_at: now)`
5. En error: `reminder.update!(status: "failed", error_message: e.message)` → `raise` (para retry)

**Retry:** `retry_on StandardError, wait: 5.minutes, attempts: 3`

> ⚠️ **Comportamiento de retry:** `perform_now` en tests NO propaga el error porque `retry_on` lo intercepta y encola el retry. Para testear el bloque `rescue`, llamar `described_class.new.perform(id)` directamente.

---

### F16 — Webhook con firma inválida

**Trigger:** POST sin `X-Webhook-Signature` o con firma incorrecta.

**Resultado:** `401 Unauthorized`, sin procesamiento, sin job encolado.

---

### F17 — Idempotencia: mensaje duplicado

**Trigger:** Kapso reenvía el mismo webhook (mismo wamid).

```ruby
return if message_data[:id].present? &&
          Message.exists?(whatsapp_message_id: message_data[:id])
```

**Resultado:** segundo evento descartado, `AiAgentJob` no se encola.

---

### F18 — Error del LLM

**Trigger:** OpenAI devuelve error o timeout.

- `AiAgentService` captura la excepción, loguea, retorna fallback text
- Conversación permanece en `bot`
- El job crea y envía el mensaje de fallback igualmente

---

### F19 — Guard: AiAgentJob con conversación ya escalada

**Trigger:** Job encolado pero la conversación cambió de estado antes de ejecutarse.

```ruby
return unless conversation.bot?   # al inicio de AiAgentJob#perform
```

**Aplica a:** `needs_human`, `supplier`, `archived` — cualquier estado distinto de `bot`.

---

### F20 — Mensajes no-text (imagen, audio, documento)

**Trigger:** Kapso envía `message.type != "text"`.

**Comportamiento actual:** el `else` del router verifica `type == "text"` → si es `image`/`audio`/`document` → se ignora silenciosamente.

> ⚠️ **Limitación conocida:** no hay respuesta automática para mensajes de media. El cliente queda sin ACK.

---

### F21 — Listado y filtrado de conversaciones

**Trigger:** `GET /api/v1/conversations?status=needs_human`

**Resultado:** lista paginada, ordenada por `last_message_at` DESC, filtrable por `status`.

---

## Broadcast ActionCable — Estructura de eventos

| Evento                 | Payload                                                                          |
|------------------------|---------------------------------------------------------------------------------|
| Mensaje nuevo          | `{ conversation_id, status, new_message: { id, body, direction, sender_type } }` |
| Cambio de estado       | `{ conversation_id, status: "needs_human" / "supplier" / "archived" }`          |
| Estado de entrega      | `{ conversation_id, message_status: { id, wamid, status: "delivered"/"read" } }` |
| Alerta mensaje fallido | `{ conversation_id, status: "needs_human", alert: { type, wamid, errors } }`    |

Canal: `"inbox"` (stream único, sin segmentación por usuario/conversación).

---

## Comportamientos Verificados por Tests

> Estado al 2026-04-09. Suite: 683 ejemplos, 0 failures.

### WhatsappController (`spec/requests/webhooks/whatsapp_controller_spec.rb`)
- ✅ Firma válida → 200 + encola `MessageProcessorJob` con el payload parseado
- ✅ Firma inválida → 401 + no encola job
- ✅ Sin header `X-Webhook-Signature` → 401
- ✅ Payload batch → encola un job por cada evento de `data`

### MessageProcessorJob (`spec/jobs/message_processor_job_spec.rb`)
- ✅ Inbound nuevo: crea `Conversation(bot)` + `Message(inbound, customer)` + broadcast + encola `AiAgentJob`
- ✅ Inbound existente: reutiliza conversación, agrega mensaje
- ✅ Vinculación con `Customer` por teléfono
- ✅ Idempotencia: wamid duplicado → no crea segundo mensaje, no re-encola AI job
- ✅ Proveedor registrado: `status: supplier` + reply automático + `WhatsAppService` llamado + no encola AI
- ✅ Upgrade bot→supplier: conversación existente en `bot` migra a `supplier`
- ✅ `needs_human`: mensaje guardado, sin `AiAgentJob`
- ✅ No-text (image): ignorado silenciosamente
- ✅ Delivered: actualiza `delivered_at` + broadcast `message_status`
- ✅ Delivered idempotente: si ya tiene `delivered_at`, no modifica
- ✅ Read: actualiza `read_at` + retro-stampa `delivered_at` si vacío + broadcast
- ✅ Read idempotente
- ✅ Failed: escala a `needs_human` + broadcast con alert + error code/title
- ✅ Failed idempotente: ya en `needs_human` → sin broadcast
- ✅ Failed con conversación no encontrada: sin error

### AiAgentJob (`spec/jobs/ai_agent_job_spec.rb`)
- ✅ Happy path: crea mensaje outbound bot + llama WA + broadcast + actualiza `last_message_at`
- ✅ Delega a `AiAgentService.process(message.body)`
- ✅ Guard `needs_human`: no crea mensaje, no llama WA, no broadcast
- ✅ Guard `supplier`: mismo comportamiento
- ✅ Guard `archived`: mismo comportamiento

### WhatsAppService (`spec/services/whats_app_service_spec.rb`)
- ✅ `send_message`: body JSON correcto (`messaging_product`, `to`, `type`, `text.body`)
- ✅ `send_message`: header `X-API-Key` y `Content-Type: application/json`
- ✅ `send_message`: API error → log sin raise
- ✅ `send_reminder_template`: template `service_reminder_v1`, language `es_AR`, parámetros en `body.parameters`
- ✅ `send_reminder_template`: API error → raise `RuntimeError`

### WhatsAppReminderJob (`spec/jobs/whats_app_reminder_job_spec.rb`)
- ✅ Crea `ServiceReminder(pending)` antes de llamar WA
- ✅ Vincula service_record, customer, vehicle
- ✅ Llama `send_reminder_template` con phone, name, vehicle, due_date formateada `%d/%m/%Y`
- ✅ Actualiza reminder a `status: sent`
- ✅ En error: actualiza a `status: failed` + guarda `error_message` + re-raise para retry

### ConversationsController (`spec/requests/api/v1/conversations_spec.rb`)
- ✅ index (sin filtro y con filtro de status)
- ✅ show con mensajes
- ✅ assign_human: estado + broadcast
- ✅ archive: estado + broadcast
- ✅ mark_as_supplier: estado + crea `SupplierPhone` + broadcast
- ✅ mark_as_supplier con `company_name` y `notes`

### AiAgentService (`spec/services/ai_agent_service_spec.rb`)
- ✅ Respuesta texto, tools (derivar_a_humano, clasificar_intencion, agendar_turno, consultar_precios)
- ✅ LLM error fallback, historial 10 mensajes, RAG con pgvector y fallback SQLite

---

## Hallazgos durante la implementación de tests

### H1 — `retry_on` intercepta excepciones en `perform_now`

`WhatsAppReminderJob` declara `retry_on StandardError`. ActiveJob captura el error antes de que llegue al caller de `perform_now`, por lo que **los tests de error no pueden usar `perform_now`**. Solución: llamar `described_class.new.perform(id)` para bypassear el ciclo de ActiveJob.

### H2 — `find_or_create_by!` no actualiza registros existentes

`ConversationsController#mark_as_supplier` usa `find_or_create_by!` con un bloque que solo se ejecuta al crear. Si el `SupplierPhone` ya existe (por un PATCH previo), `company_name`/`notes` no se actualizan. Esto es un **bug de diseño** si se desea editar proveedores ya registrados: habría que usar `find_or_initialize_by` + `assign_attributes` + `save!`.

### H3 — `let` lazy en `expect { }.not_to change`

En RSpec, un `let(:message)` evaluado dentro del bloque `expect { }` cuenta como cambio en `Message.count`. Los tests de guard en `AiAgentJob` necesitan pre-evaluar `message.id` fuera del bloque para que la creación del mensaje no se confunda con la creación que haría el job.

---

## Limitaciones y Gaps conocidos

| Gap | Descripción | Impacto |
|-----|-------------|---------|
| No-text sin ACK | Mensajes imagen/audio/video ignorados silenciosamente | Cliente sin respuesta |
| SupplierPhone no editable vía API | `find_or_create_by!` no actualiza si ya existe | Imposible corregir nombre de proveedor |
| Transiciones de estado sin restricción | Cualquier estado puede pasar a cualquier otro sin validación | Conversación puede ir de `archived` a `bot` |
| `batch_info` no consumido | `size`, `window_ms` disponibles pero no usados | No hay métricas de batch |
| InboxChannel sin autenticación | `ActionCable::Connection` no valida usuario | Cualquier cliente puede suscribirse al canal inbox |
| AiAgentJob sin manejo de error propio | Si `AiAgentService` falla → el fallback reply se envía igual, pero `AiAgentJob` no tiene `retry_on` | Errores transitorios de red con OpenAI no se reintentan |

---

## Variables de Entorno

| Variable                | Componente             | Uso                                               |
|-------------------------|------------------------|---------------------------------------------------|
| `KAPSO_WEBHOOK_SECRET`  | `WhatsappController`   | Verificación HMAC-SHA256                          |
| `KAPSO_API_KEY`         | `WhatsAppService`      | Header `X-API-Key`                                |
| `KAPSO_API_BASE_URL`    | `WhatsAppService`      | Constante `BASE_URL` (evaluada al cargar la clase) |
| `KAPSO_PHONE_NUMBER_ID` | `WhatsAppService`      | Path del endpoint (`/messages`)                   |
| `AI_API_URL`            | `AiAgentService`       | Endpoint LLM (OpenAI-compatible)                  |
| `AI_API_KEY`            | `AiAgentService`       | Clave LLM                                         |
| `AI_MODEL`              | `AiAgentService`       | Modelo LLM (ej: `gpt-4o`)                         |
| `AI_MODEL_EMBEDDING`    | `EmbeddingService`     | Modelo embedding para RAG                         |

> ⚠️ `KAPSO_API_BASE_URL` se evalúa una sola vez cuando `WhatsAppService` se carga por primera vez. En tests, usar `stub_const("WhatsAppService::BASE_URL", ...)` para sobreescribirla.
