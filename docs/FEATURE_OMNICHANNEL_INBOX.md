# Feature: Inbox Omnicanal con Agente IA (WhatsApp)

Bandeja de entrada centralizada para gestionar conversaciones de WhatsApp con triage automático por IA. El agente responde consultas frecuentes, clasifica mensajes de proveedores y escala a humano cuando es necesario.

---

## Objetivo

Eliminar al dueño como cuello de botella en la atención por WhatsApp. El agente IA resuelve el 80% de las consultas repetitivas (precios, disponibilidad, turnos), clasifica proveedores automáticamente y deja al humano solo los casos que lo requieren.

---

## Arquitectura General

```
WhatsApp Cloud API (Meta)
        │
        ▼ Webhook POST /webhooks/whatsapp
   Rails Controller
        │
        ▼ encola
   Solid Queue Job: MessageProcessorJob
        │
        ├── Guarda mensaje en DB
        ├── Identifica conversación / cliente
        └── Llama al Agente IA
                │
                ├── RAG: búsqueda vectorial en productos/servicios (pgvector)
                ├── Tool: clasificar_intencion
                ├── Tool: consultar_precios
                ├── Tool: derivar_a_humano
                └── Tool: agendar_turno
                        │
                        ▼
                WhatsAppService.send_message(...)
                        │
                        ▼ ActionCable
                Actualiza UI React en tiempo real
```

---

## Base de Datos

### Tabla: `conversations`

Una conversación por número de WhatsApp.

```ruby
create_table :conversations do |t|
  t.references :customer, foreign_key: true   # nil si no está registrado aún
  t.string :whatsapp_phone, null: false, index: { unique: true }
  t.string :status, null: false, default: "bot"
  # status: bot | needs_human | supplier | resolved
  t.string :label   # etiqueta libre para la UI
  t.datetime :last_message_at
  t.timestamps
end
```

### Tabla: `messages`

```ruby
create_table :messages do |t|
  t.references :conversation, null: false, foreign_key: true
  t.string :direction, null: false   # inbound | outbound
  t.string :sender_type               # customer | bot | agent
  t.text   :body, null: false
  t.string :whatsapp_message_id       # ID de Meta, para deduplicación
  t.datetime :received_at
  t.timestamps
end

add_index :messages, :whatsapp_message_id, unique: true
```

---

## Backend Rails

### Webhook Controller

```ruby
# app/controllers/webhooks/whatsapp_controller.rb
class Webhooks::WhatsappController < ApplicationController
  skip_before_action :authenticate_user!

  # GET — verificación inicial de Meta
  def verify
    if params["hub.verify_token"] == ENV["WHATSAPP_VERIFY_TOKEN"] &&
       params["hub.mode"] == "subscribe"
      render plain: params["hub.challenge"]
    else
      head :forbidden
    end
  end

  # POST — mensajes entrantes
  def receive
    payload = JSON.parse(request.body.read)
    MessageProcessorJob.perform_later(payload)
    head :ok  # Meta requiere 200 en < 5 segundos
  end
end
```

```ruby
# config/routes.rb
get  "/webhooks/whatsapp", to: "webhooks/whatsapp#verify"
post "/webhooks/whatsapp", to: "webhooks/whatsapp#receive"
```

### Job: `MessageProcessorJob`

```ruby
class MessageProcessorJob < ApplicationJob
  queue_as :inbox

  def perform(payload)
    message_data = extract_message(payload)
    return unless message_data  # ignorar status updates, etc.

    conversation = Conversation.find_or_create_by!(
      whatsapp_phone: message_data[:from]
    ) do |c|
      c.customer = Customer.find_by(phone: message_data[:from])
      c.status   = "bot"
    end

    message = conversation.messages.create!(
      direction:            "inbound",
      sender_type:          "customer",
      body:                 message_data[:text],
      whatsapp_message_id:  message_data[:id],
      received_at:          Time.current
    )

    conversation.update!(last_message_at: Time.current)
    ActionCable.server.broadcast("inbox", conversation_update(conversation))

    AiAgentJob.perform_later(conversation.id, message.id) if conversation.status == "bot"
  end

  private

  def extract_message(payload)
    entry = payload.dig("entry", 0, "changes", 0, "value")
    return unless entry&.dig("messages")

    msg = entry["messages"].first
    return unless msg["type"] == "text"

    { from: msg["from"], text: msg.dig("text", "body"), id: msg["id"] }
  end

  def conversation_update(conversation)
    { conversation_id: conversation.id, status: conversation.status }
  end
end
```

### Job: `AiAgentJob`

```ruby
class AiAgentJob < ApplicationJob
  queue_as :ai

  def perform(conversation_id, message_id)
    conversation = Conversation.includes(:messages, :customer).find(conversation_id)
    message      = Message.find(message_id)

    response = AiAgentService.new(conversation).process(message.body)

    outbound = conversation.messages.create!(
      direction:   "outbound",
      sender_type: "bot",
      body:        response[:reply]
    )

    WhatsAppService.send_message(
      phone: conversation.whatsapp_phone,
      text:  response[:reply]
    )

    ActionCable.server.broadcast("inbox", {
      conversation_id: conversation.id,
      new_message:     { body: outbound.body, direction: "outbound" }
    })
  end
end
```

---

## Agente IA: `AiAgentService`

### RAG con pgvector

Antes de llamar al LLM, se realiza una búsqueda semántica para enriquecer el contexto.

```ruby
# Migración
add_column :products, :embedding, :vector, limit: 1536
add_column :services, :embedding, :vector, limit: 1536

# Scope de búsqueda semántica
def relevant_context(query)
  embedding = EmbeddingService.generate(query)

  products = Product.order(Arel.sql("embedding <-> '#{embedding}'")).limit(3)
  services = Service.order(Arel.sql("embedding <-> '#{embedding}'")).limit(3)

  format_context(products, services)
end
```

### Tools / Skills del Agente

El LLM recibe estas funciones como `tools` (function calling).

| Tool                   | Descripción                                                         |
|------------------------|---------------------------------------------------------------------|
| `clasificar_intencion` | Detecta si el remitente es cliente o proveedor                      |
| `consultar_precios`    | Devuelve precio y descripción de un producto/servicio               |
| `derivar_a_humano`     | Cambia `conversation.status` a `needs_human` y avisa en la UI      |
| `agendar_turno`        | Crea un registro de turno tentativo y confirma por WhatsApp         |

```ruby
TOOLS = [
  {
    name: "clasificar_intencion",
    description: "Clasifica si el mensaje es de un cliente o un proveedor.",
    parameters: {
      type: "object",
      properties: {
        tipo: { type: "string", enum: ["cliente", "proveedor"] }
      },
      required: ["tipo"]
    }
  },
  {
    name: "derivar_a_humano",
    description: "Deriva la conversación a atención humana. Usar ante quejas, preguntas complejas o pedidos de hablar con el dueño.",
    parameters: {
      type: "object",
      properties: {
        motivo: { type: "string" }
      },
      required: ["motivo"]
    }
  },
  {
    name: "consultar_precios",
    description: "Consulta precio y disponibilidad de un producto o servicio.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" }
      },
      required: ["query"]
    }
  },
  {
    name: "agendar_turno",
    description: "Registra un turno tentativo para el cliente.",
    parameters: {
      type: "object",
      properties: {
        fecha_preferida: { type: "string" },
        vehiculo:        { type: "string" }
      },
      required: ["fecha_preferida"]
    }
  }
]
```

### Clase Principal

```ruby
class AiAgentService
  def initialize(conversation)
    @conversation = conversation
    @history      = build_history
  end

  def process(user_message)
    context = relevant_context(user_message)

    messages = [
      { role: "system", content: system_prompt(context) },
      *@history,
      { role: "user", content: user_message }
    ]

    response = call_llm(messages)
    handle_tool_calls(response) || { reply: response[:content] }
  end

  private

  def system_prompt(context)
    <<~PROMPT
      Sos el asistente virtual de un lubricentro automotriz en Argentina.
      Respondés de manera cordial, breve y en español rioplatense.
      Si el cliente es un proveedor, usá la tool clasificar_intencion.
      Si no podés resolver la consulta, usá derivar_a_humano.

      Información de productos y servicios disponibles:
      #{context}
    PROMPT
  end

  def handle_tool_calls(response)
    return nil unless response[:tool_calls]

    response[:tool_calls].each do |tool_call|
      case tool_call[:name]
      when "derivar_a_humano"
        @conversation.update!(status: "needs_human")
        ActionCable.server.broadcast("inbox", {
          conversation_id: @conversation.id,
          status: "needs_human"
        })
        return { reply: "Entendido, te comunico con una persona ahora mismo. Un momento." }

      when "clasificar_intencion"
        tipo = tool_call.dig(:arguments, :tipo)
        if tipo == "proveedor"
          @conversation.update!(status: "supplier")
          return { reply: "Gracias. Tu mensaje fue recibido y lo revisamos a la brevedad." }
        end

      when "agendar_turno"
        # Lógica de creación de turno (Fase 2)
        return { reply: "Perfecto, te anotamos. Te confirmamos el turno en breve." }
      end
    end

    nil
  end

  def relevant_context(query)
    embedding = EmbeddingService.generate(query)

    products = Product.order(Arel.sql("embedding <-> '#{embedding}'")).limit(3)
              .map { |p| "- #{p.name}: $#{p.price}" }.join("\n")

    services = Service.order(Arel.sql("embedding <-> '#{embedding}'")).limit(3)
              .map { |s| "- #{s.name}: $#{s.price}" }.join("\n")

    "Productos:\n#{products}\n\nServicios:\n#{services}"
  end

  def build_history
    @conversation.messages.order(:created_at).last(10).map do |m|
      role = m.sender_type == "customer" ? "user" : "assistant"
      { role: role, content: m.body }
    end
  end

  def call_llm(messages)
    # Implementar con cliente de OpenAI / Gemini / Claude según preferencia
    raise NotImplementedError
  end
end
```

---

## Frontend React: Panel de Inbox

### Componentes

```
InboxPage
├── ConversationList          # sidebar con lista de conversaciones
│   ├── ConversationItem      # nombre, último mensaje, status badge
│   └── StatusFilter          # tabs: Todos | Bot | Humano | Proveedores | Resueltos
└── ConversationDetail        # panel derecho
    ├── MessageThread         # historial de mensajes
    ├── MessageInput          # campo de respuesta manual
    └── ConversationActions   # botones: Derivar a Humano | Marcar Resuelto | Asignar Etiqueta
```

### Conexión en Tiempo Real (ActionCable)

```javascript
// hooks/useInboxCable.js
import { createConsumer } from "@rails/actioncable"

const consumer = createConsumer(import.meta.env.VITE_CABLE_URL)

export function useInboxCable(onUpdate) {
  useEffect(() => {
    const subscription = consumer.subscriptions.create("InboxChannel", {
      received(data) { onUpdate(data) }
    })
    return () => subscription.unsubscribe()
  }, [])
}
```

```ruby
# app/channels/inbox_channel.rb
class InboxChannel < ApplicationCable::Channel
  def subscribed
    stream_from "inbox"
  end
end
```

### Estados de Conversación (UI)

| Status         | Badge UI              | Comportamiento                              |
|----------------|-----------------------|---------------------------------------------|
| `bot`          | 🤖 Bot atendiendo     | El agente responde automáticamente          |
| `needs_human`  | 🙋 Requiere atención  | Notificación en sidebar, input habilitado   |
| `supplier`     | 📦 Proveedor          | Clasificado automáticamente, sin bot        |
| `resolved`     | ✅ Resuelto            | Solo lectura                                |

---

## Servicio de Embeddings: `EmbeddingService`

```ruby
class EmbeddingService
  def self.generate(text)
    # Llamada a API de embeddings (OpenAI text-embedding-3-small o similar)
    # Retorna un array de 1536 floats
    raise NotImplementedError
  end

  # Regenerar embeddings del catálogo (correr al crear/actualizar productos/servicios)
  def self.reindex_catalog!
    Product.find_each do |product|
      embedding = generate("#{product.name} #{product.description}")
      product.update_column(:embedding, embedding)
    end
    Service.find_each do |service|
      embedding = generate("#{service.name} #{service.description}")
      service.update_column(:embedding, embedding)
    end
  end
end
```

Activar en callbacks de `Product` y `Service`:

```ruby
after_save :reindex_embedding, if: :saved_change_to_name?

def reindex_embedding
  EmbeddingService.reindex_catalog! # o encolarlo en un job
end
```

---

## Variables de Entorno Requeridas

```
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_VERIFY_TOKEN=...     # token propio para verificar el webhook
OPENAI_API_KEY=...            # o la clave del LLM elegido
VITE_CABLE_URL=...            # ws://localhost:3000/cable en desarrollo
```

---

## Configuración de Solid Queue

```yaml
# config/recurring.yml (si se necesita mantenimiento periódico de embeddings)
reindex_embeddings:
  class: ReindexEmbeddingsJob
  schedule: "0 3 * * 0"   # domingos a las 3 AM
  queue: ai
```

---

## Pasos para Arrancar

1. **Meta Developer App:** Crear app, configurar número de prueba de WhatsApp, verificar webhook con Ngrok apuntando a `/webhooks/whatsapp`.
2. **pgvector:** Habilitar extensión en PostgreSQL (`CREATE EXTENSION vector;`) y correr migraciones de embeddings.
3. **Reindexar catálogo:** Correr `EmbeddingService.reindex_catalog!` desde la consola de Rails con los productos/servicios existentes.
4. **ActionCable:** Verificar que `InboxChannel` transmite correctamente desde el frontend de desarrollo.
5. **LLM:** Implementar `AiAgentService#call_llm` con la API del modelo elegido (OpenAI, Gemini, Claude).

---

## Migraciones Necesarias

1. `create_conversations`
2. `create_messages`
3. `add_embedding_to_products` (vector, limit: 1536)
4. `add_embedding_to_services` (vector, limit: 1536)
5. `enable_pgvector` (`CREATE EXTENSION IF NOT EXISTS vector`)
