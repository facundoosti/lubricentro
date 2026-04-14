# Webhook WhatsApp — Ejemplos curl / Postman

Endpoint: `POST http://localhost:3000/webhooks/whatsapp`

La firma `X-Webhook-Signature` es un HMAC-SHA256 del raw body con `KAPSO_WEBHOOK_SECRET`.

---

## Postman — Pre-request Script (pegar en la colección)

```javascript
// Pre-request Script — genera X-Webhook-Signature automáticamente
const body = pm.request.body.raw;
const secret = pm.environment.get("KAPSO_WEBHOOK_SECRET"); // setear en el environment

const signature = CryptoJS.HmacSHA256(body, secret).toString(CryptoJS.enc.Hex);
pm.request.headers.add({ key: "X-Webhook-Signature", value: signature });
```

> Agregar la variable `KAPSO_WEBHOOK_SECRET` en el environment de Postman con el mismo valor que el `.env` del backend.

Headers comunes en cada request:
- `Content-Type: application/json`
- `X-Webhook-Event: whatsapp.message.received` (informativo, no valida el controller)

---

## Caso 1 — Cliente pide un turno

El bot recibe el mensaje, lo procesa con IA y agenda/consulta un turno.

```bash
BODY='{
  "message": {
    "id": "wamid.TURNO001",
    "timestamp": "1730092801",
    "type": "text",
    "text": { "body": "Hola, quería saber si tienen turno disponible para un cambio de aceite esta semana" },
    "kapso": {
      "direction": "inbound",
      "status": "received",
      "processing_status": "pending",
      "origin": "cloud_api",
      "phone_number": "+5491123456701",
      "phone_number_id": "123456789012345",
      "has_media": false
    }
  },
  "conversation": {
    "id": "conv_turno001",
    "phone_number": "+5491123456701",
    "status": "active",
    "last_active_at": "2026-04-13T10:00:00Z",
    "created_at": "2026-04-13T10:00:00Z",
    "updated_at": "2026-04-13T10:00:00Z",
    "metadata": {},
    "phone_number_id": "123456789012345"
  },
  "is_new_conversation": true,
  "phone_number_id": "123456789012345"
}'

SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$KAPSO_WEBHOOK_SECRET" | awk '{print $2}')

curl -s -X POST http://localhost:3000/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Event: whatsapp.message.received" \
  -H "X-Webhook-Signature: $SIG" \
  -d "$BODY"
```

**Flujo esperado:** conversación nueva en `bot` → `AiAgentJob` → IA llama `consultar_turnos_disponibles` → devuelve horarios libres → cliente elige → IA llama `agendar_turno` → turno creado en BD.

---

## Caso 2 — Cliente consulta turnos disponibles para un día específico

El bot consulta los slots libres del día pedido sin agendar todavía.

```bash
BODY='{
  "message": {
    "id": "wamid.SLOTS001",
    "timestamp": "1730092820",
    "type": "text",
    "text": { "body": "Hola! ¿Qué turnos tienen disponibles para el viernes?" },
    "kapso": {
      "direction": "inbound",
      "status": "received",
      "processing_status": "pending",
      "origin": "cloud_api",
      "phone_number": "+5491123456704",
      "phone_number_id": "123456789012345",
      "has_media": false
    }
  },
  "conversation": {
    "id": "conv_slots001",
    "phone_number": "+5491123456704",
    "status": "active",
    "last_active_at": "2026-04-13T10:02:00Z",
    "created_at": "2026-04-13T10:02:00Z",
    "updated_at": "2026-04-13T10:02:00Z",
    "metadata": {},
    "phone_number_id": "123456789012345"
  },
  "is_new_conversation": true,
  "phone_number_id": "123456789012345"
}'

SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$KAPSO_WEBHOOK_SECRET" | awk '{print $2}')

curl -s -X POST http://localhost:3000/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Event: whatsapp.message.received" \
  -H "X-Webhook-Signature: $SIG" \
  -d "$BODY"
```

**Flujo esperado:** bot → IA llama `consultar_turnos_disponibles(fecha: "2026-04-17")` → consulta `Setting.opening_hours["viernes"]` y `Appointment` ocupados → respuesta con slots libres (ej: `09:00–12:00`, `15:00–18:00`).

**Respuesta esperada del bot:**
```
Para el 17/04 (viernes) hay 2 turno(s) disponible(s):
  • 09:00 a 12:00
  • 15:00 a 18:00
¿Querés reservar alguno?
```

**Variante — día sin atención** (sábado/domingo con `open: false`):
```bash
# Cambiar el body.text a: "¿tienen turno el domingo?"
# Respuesta esperada: "El Domingo no atendemos. ¿Querés consultar otro día?"
```

**Variante — día completo** (los 3 slots ocupados):
```bash
# Crear 3 appointments con scheduled_at en el mismo día desde rails console:
# Appointment.create!(customer: Customer.first, vehicle: Vehicle.first, scheduled_at: "2026-04-17 09:00", status: "scheduled", notes: "test")
# Appointment.create!(customer: Customer.first, vehicle: Vehicle.first, scheduled_at: "2026-04-17 12:00", status: "confirmed", notes: "test")
# Appointment.create!(customer: Customer.first, vehicle: Vehicle.first, scheduled_at: "2026-04-17 15:00", status: "scheduled", notes: "test")
# Respuesta esperada: "Para el 17/04 (viernes) no quedan turnos disponibles. ¿Querés que te anote para otro día?"
```

---

## Caso 3 — Cliente consulta precio de un producto

```bash
BODY='{
  "message": {
    "id": "wamid.PRECIO001",
    "timestamp": "1730092850",
    "type": "text",
    "text": { "body": "Cuánto sale el aceite 10W40 semisintético?" },
    "kapso": {
      "direction": "inbound",
      "status": "received",
      "processing_status": "pending",
      "origin": "cloud_api",
      "phone_number": "+5491123456702",
      "phone_number_id": "123456789012345",
      "has_media": false
    }
  },
  "conversation": {
    "id": "conv_precio001",
    "phone_number": "+5491123456702",
    "status": "active",
    "last_active_at": "2026-04-13T10:05:00Z",
    "created_at": "2026-04-13T10:05:00Z",
    "updated_at": "2026-04-13T10:05:00Z",
    "metadata": {},
    "phone_number_id": "123456789012345"
  },
  "is_new_conversation": true,
  "phone_number_id": "123456789012345"
}'

SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$KAPSO_WEBHOOK_SECRET" | awk '{print $2}')

curl -s -X POST http://localhost:3000/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Event: whatsapp.message.received" \
  -H "X-Webhook-Signature: $SIG" \
  -d "$BODY"
```

**Flujo esperado:** bot → IA llama tool `consultar_precios` → devuelve precio del producto.

---

## Caso 4 — Mensaje de un proveedor registrado

**Prerequisito:** el número `+5491199887766` debe existir en `SupplierPhone`.

```sql
-- Desde rails console o psql:
-- SupplierPhone.create!(phone: "+5491199887766", company_name: "Distribuidora Omega")
```

```bash
BODY='{
  "message": {
    "id": "wamid.PROV001",
    "timestamp": "1730093000",
    "type": "text",
    "text": { "body": "Buenos días, les envío la lista de precios actualizada para esta semana" },
    "kapso": {
      "direction": "inbound",
      "status": "received",
      "processing_status": "pending",
      "origin": "cloud_api",
      "phone_number": "+5491199887766",
      "phone_number_id": "123456789012345",
      "has_media": false
    }
  },
  "conversation": {
    "id": "conv_prov001",
    "phone_number": "+5491199887766",
    "status": "active",
    "last_active_at": "2026-04-13T10:10:00Z",
    "created_at": "2026-04-13T10:10:00Z",
    "updated_at": "2026-04-13T10:10:00Z",
    "metadata": {},
    "phone_number_id": "123456789012345"
  },
  "is_new_conversation": true,
  "phone_number_id": "123456789012345"
}'

SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$KAPSO_WEBHOOK_SECRET" | awk '{print $2}')

curl -s -X POST http://localhost:3000/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Event: whatsapp.message.received" \
  -H "X-Webhook-Signature: $SIG" \
  -d "$BODY"
```

**Flujo esperado:** `SupplierPhone.exists?` → `true` → conversación en `supplier` → respuesta de cortesía automática → **no** encola `AiAgentJob`.

---

## Caso 5 — Bot deriva a humano

Mensaje con contexto que debería hacer que la IA invoque `derivar_a_humano` (ej: queja o situación compleja).

```bash
BODY='{
  "message": {
    "id": "wamid.HUMANO001",
    "timestamp": "1730093100",
    "type": "text",
    "text": { "body": "Quiero hablar con alguien de atención al cliente, tuve un problema con el servicio que me hicieron la semana pasada y el auto sigue fallando" },
    "kapso": {
      "direction": "inbound",
      "status": "received",
      "processing_status": "pending",
      "origin": "cloud_api",
      "phone_number": "+5491123456703",
      "phone_number_id": "123456789012345",
      "has_media": false
    }
  },
  "conversation": {
    "id": "conv_humano001",
    "phone_number": "+5491123456703",
    "status": "active",
    "last_active_at": "2026-04-13T10:15:00Z",
    "created_at": "2026-04-13T10:15:00Z",
    "updated_at": "2026-04-13T10:15:00Z",
    "metadata": {},
    "phone_number_id": "123456789012345"
  },
  "is_new_conversation": true,
  "phone_number_id": "123456789012345"
}'

SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$KAPSO_WEBHOOK_SECRET" | awk '{print $2}')

curl -s -X POST http://localhost:3000/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Event: whatsapp.message.received" \
  -H "X-Webhook-Signature: $SIG" \
  -d "$BODY"
```

**Flujo esperado:** bot → IA invoca tool `derivar_a_humano` → conversación pasa a `needs_human` → broadcast `{ status: "needs_human" }` → sin más respuestas automáticas.

---

## Caso extra — Firma inválida (debe devolver 401)

```bash
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: invalida" \
  -d '{"message": {"id": "wamid.TEST"}}'
# Esperado: 401
```

---

## Script helper para generar la firma (bash)

```bash
# Guardar como sign_webhook.sh y hacer chmod +x
#!/bin/bash
# Uso: ./sign_webhook.sh <archivo_body.json>
BODY=$(cat "$1")
SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "${KAPSO_WEBHOOK_SECRET}" | awk '{print $2}')
echo "X-Webhook-Signature: $SIG"

curl -s -X POST http://localhost:3000/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Event: whatsapp.message.received" \
  -H "X-Webhook-Signature: $SIG" \
  -d "$BODY"
```
