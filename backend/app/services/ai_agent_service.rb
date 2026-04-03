class AiAgentService
  TOOLS = [
    {
      type: "function",
      function: {
        name: "clasificar_intencion",
        description: "Clasifica si el mensaje es de un cliente o un proveedor.",
        parameters: {
          type: "object",
          properties: {
            tipo: { type: "string", enum: [ "cliente", "proveedor" ] }
          },
          required: [ "tipo" ]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "derivar_a_humano",
        description: "Deriva la conversación a atención humana. Usar ante quejas, preguntas complejas o pedidos de hablar con el dueño.",
        parameters: {
          type: "object",
          properties: {
            motivo: { type: "string" }
          },
          required: [ "motivo" ]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "consultar_precios",
        description: "Consulta precio y disponibilidad de un producto o servicio.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string" }
          },
          required: [ "query" ]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "agendar_turno",
        description: "Registra un turno tentativo para el cliente.",
        parameters: {
          type: "object",
          properties: {
            fecha_preferida: { type: "string" },
            vehiculo: { type: "string" }
          },
          required: [ "fecha_preferida" ]
        }
      }
    }
  ].freeze

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

  def call_llm(messages)
    response = client.chat(
      parameters: {
        model: ENV.fetch("AI_MODEL", nil),
        messages: messages,
        tools: TOOLS,
        tool_choice: "auto"
      }
    )

    choice = response.dig("choices", 0, "message")
    tool_calls = choice["tool_calls"]

    if tool_calls.present?
      parsed_calls = tool_calls.map do |tc|
        {
          name: tc.dig("function", "name"),
          arguments: JSON.parse(tc.dig("function", "arguments")).symbolize_keys
        }
      end
      { tool_calls: parsed_calls }
    else
      { content: choice["content"] }
    end
  rescue => e
    Rails.logger.error("[AiAgentService] LLM call failed: #{e.message}")
    { content: "Hubo un problema al procesar tu consulta. Un agente te va a contactar a la brevedad." }
  end

  def handle_tool_calls(response)
    return nil unless response[:tool_calls]

    response[:tool_calls].each do |tool_call|
      case tool_call[:name]
      when "derivar_a_humano"
        @conversation.update!(status: "needs_human")
        broadcast_status_update
        return { reply: "Entendido, te comunico con una persona ahora mismo. Un momento." }

      when "clasificar_intencion"
        if tool_call.dig(:arguments, :tipo) == "proveedor"
          @conversation.update!(status: "supplier")
          broadcast_status_update
          return { reply: "Gracias. Tu mensaje fue recibido y lo revisamos a la brevedad." }
        end

      when "agendar_turno"
        # Fase 2: crear turno en la BD
        return { reply: "Perfecto, te anotamos. Te confirmamos el turno en breve." }
      end
    end

    nil
  end

  def relevant_context(query)
    # pgvector RAG — only available on PostgreSQL
    return fallback_context unless postgresql?

    embedding = EmbeddingService.generate(query)
    return fallback_context unless embedding

    products = Product.order(Arel.sql("embedding <-> '#{embedding}'")).limit(3)
               .map { |p| "- #{p.name}: #{p.formatted_price}" }.join("\n")

    services = Service.order(Arel.sql("embedding <-> '#{embedding}'")).limit(3)
               .map { |s| "- #{s.name}: #{s.formatted_price}" }.join("\n")

    "Productos:\n#{products}\n\nServicios:\n#{services}"
  end

  def fallback_context
    products = Product.limit(5).map { |p| "- #{p.name}: $#{p.formatted_price}" }.join("\n")
    services = Service.limit(5).map { |s| "- #{s.name}: $#{s.formatted_price}" }.join("\n")
    "Productos:\n#{products}\n\nServicios:\n#{services}"
  end

  def build_history
    @conversation.messages.chronological.last(10).map do |m|
      role = m.sender_type == "customer" ? "user" : "assistant"
      { role: role, content: m.body }
    end
  end

  def broadcast_status_update
    ActionCable.server.broadcast("inbox", {
      conversation_id: @conversation.id,
      status: @conversation.status
    })
  end

  def client
    @client ||= OpenAI::Client.new(
      uri_base: ENV.fetch("AI_API_URL"),
      access_token: ENV.fetch("AI_API_KEY"))
  end

  def postgresql?
    ActiveRecord::Base.connection.adapter_name == "PostgreSQL"
  end
end
