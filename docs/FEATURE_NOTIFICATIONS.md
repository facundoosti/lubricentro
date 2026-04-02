# Feature: Motor de Notificaciones Proactivas (Service Reminders)

Envío automático de recordatorios por WhatsApp cuando el vehículo de un cliente se acerca a su próximo service.

---

## Objetivo

Eliminar la dependencia de que el cliente recuerde cuándo llevar el auto. El sistema calcula la fecha estimada del próximo service al registrar una atención y notifica automáticamente al cliente días antes.

---

## Lógica de Negocio

### Estimación del Próximo Service

Al crear un `ServiceRecord`, el sistema persiste `next_service_estimated_date`. El cálculo se basa en:

- Si el intervalo se conoce (km), se estima el tiempo en base al kilometraje promedio anual del vehículo.
- Fallback: intervalo por defecto configurable (ej. 6 meses).

```
next_service_estimated_date = service_date + interval_months
```

El campo ya existe en `ServiceRecord`. No se requiere migración adicional.

### Criterio de Notificación

Un vehículo es candidato a recordatorio si:

1. `next_service_estimated_date` está a N días o menos (configurable, por defecto 7).
2. No existe un `ServiceRecord` más reciente que la `next_service_estimated_date` de la atención anterior (evita notificar a quien ya vino).
3. El cliente tiene número de teléfono registrado.
4. No recibió un recordatorio en los últimos 30 días para el mismo vehículo (deduplicación).

---

## Arquitectura

### Modelo: `ServiceReminder`

Tabla de auditoría para evitar duplicados y tener historial.

```ruby
# Migración
create_table :service_reminders do |t|
  t.references :service_record, null: false, foreign_key: true
  t.references :customer,       null: false, foreign_key: true
  t.references :vehicle,        null: false, foreign_key: true
  t.string  :status,   null: false, default: "pending"  # pending | sent | failed
  t.string  :channel,  null: false, default: "whatsapp"
  t.datetime :sent_at
  t.text :error_message
  t.timestamps
end
```

### Job: `ServiceReminderJob`

Cron diario ejecutado por **Solid Queue** (sin Redis, usa PostgreSQL).

```ruby
# config/recurring.yml (Solid Queue recurring jobs)
service_reminder:
  class: ServiceReminderJob
  schedule: "0 10 * * *"   # todos los días a las 10:00 AM
  queue: notifications
```

```ruby
class ServiceReminderJob < ApplicationJob
  queue_as :notifications

  def perform
    candidates = ServiceRecord
      .joins(:customer, :vehicle)
      .where("next_service_estimated_date <= ?", Date.current + 7.days)
      .where("next_service_estimated_date >= ?", Date.current)
      .where.not(
        id: ServiceRecord.select(:id).where(
          "service_date > service_records.next_service_estimated_date"
        )
      )
      .where.missing(:sent_reminders_within_30_days)

    candidates.each do |service_record|
      WhatsAppReminderJob.perform_later(service_record.id)
    end
  end
end
```

### Job: `WhatsAppReminderJob`

Envía el mensaje y registra el resultado en `ServiceReminder`.

```ruby
class WhatsAppReminderJob < ApplicationJob
  queue_as :notifications

  def perform(service_record_id)
    service_record = ServiceRecord.find(service_record_id)
    reminder = ServiceReminder.create!(
      service_record: service_record,
      customer: service_record.customer,
      vehicle: service_record.vehicle,
      status: "pending"
    )

    result = WhatsAppService.send_reminder_template(
      phone:    service_record.customer.phone,
      name:     service_record.customer.name,
      vehicle:  "#{service_record.vehicle.brand} #{service_record.vehicle.model}",
      due_date: service_record.next_service_estimated_date.strftime("%d/%m/%Y")
    )

    reminder.update!(status: "sent", sent_at: Time.current)
  rescue => e
    reminder&.update!(status: "failed", error_message: e.message)
    raise  # Solid Queue reintentará según la política del job
  end
end
```

### Servicio: `WhatsAppService`

Wrapper para la API oficial de WhatsApp Cloud (Meta).

```ruby
class WhatsAppService
  TEMPLATE_NAME = "service_reminder_v1"  # template preaprobado en Meta

  def self.send_reminder_template(phone:, name:, vehicle:, due_date:)
    response = Faraday.post(
      "https://graph.facebook.com/v19.0/#{ENV['WHATSAPP_PHONE_NUMBER_ID']}/messages",
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: TEMPLATE_NAME,
          language: { code: "es_AR" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: name },
                { type: "text", text: vehicle },
                { type: "text", text: due_date }
              ]
            }
          ]
        }
      }.to_json,
      {
        "Authorization" => "Bearer #{ENV['WHATSAPP_ACCESS_TOKEN']}",
        "Content-Type"  => "application/json"
      }
    )

    raise "WhatsApp API error: #{response.body}" unless response.success?
    JSON.parse(response.body)
  end
end
```

---

## Template de WhatsApp (Meta)

El template debe aprobarse en el Meta Business Suite antes del lanzamiento.

```
Nombre del template: service_reminder_v1
Idioma: es_AR
Categoría: UTILITY

Cuerpo del mensaje:
Hola {{1}}, tu {{2}} está próximo a su service ({{3}}).
¿Querés que te agendemos un turno? Respondé este mensaje y te atendemos.
```

Variables:
- `{{1}}` → nombre del cliente
- `{{2}}` → marca + modelo del vehículo
- `{{3}}` → fecha estimada del próximo service

---

## Variables de Entorno Requeridas

```
WHATSAPP_PHONE_NUMBER_ID=...   # ID del número de WhatsApp Business
WHATSAPP_ACCESS_TOKEN=...      # Token de acceso de la Meta App
```

---

## Configuración de Solid Queue

Solid Queue usa PostgreSQL, sin Redis. Ya incluido en Rails 8 por defecto.

```yaml
# config/recurring.yml
service_reminder:
  class: ServiceReminderJob
  schedule: "0 10 * * *"
  queue: notifications
  description: "Envía recordatorios de service a clientes con vencimiento próximo"
```

```ruby
# config/application.rb
config.active_job.queue_adapter = :solid_queue
```

---

## Pruebas Locales

1. Crear un `ServiceRecord` con `next_service_estimated_date = Date.current + 5.days`.
2. Ejecutar el job manualmente: `ServiceReminderJob.perform_now`
3. Verificar que se creó un `ServiceReminder` con `status: "sent"`.
4. Para pruebas de WhatsApp, usar el número de prueba del Meta Developer App con Ngrok.

---

## Migraciones Necesarias

1. `create_service_reminders` — tabla de auditoría (ver arriba).
2. Ninguna migración adicional en `service_records` (el campo `next_service_estimated_date` ya existe).
