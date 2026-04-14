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

      Reglas para usar las tools:
      - Si el mensaje parece ser de un proveedor, usá clasificar_intencion.
      - Si el cliente pregunta qué turnos hay o cuándo puede venir, usá consultar_turnos_disponibles con la fecha en formato YYYY-MM-DD.
      - Si el cliente quiere sacar un turno, primero consultá los disponibles con consultar_turnos_disponibles y luego usá agendar_turno con fecha y hora exacta (YYYY-MM-DD HH:MM).
      - Si no podés resolver la consulta, usá derivar_a_humano.

      Información de productos y servicios disponibles:
      #{context}
    PROMPT
  end

  def call_llm(messages)
    response = client.chat(
      parameters: {
        model:       ENV.fetch("AI_MODEL", nil),
        messages:    messages,
        tools:       ToolRegistry.definitions,
        tool_choice: "auto"
      }
    )

    choice     = response.dig("choices", 0, "message")
    tool_calls = choice["tool_calls"]

    if tool_calls.present?
      parsed_calls = tool_calls.map do |tc|
        {
          name:      tc.dig("function", "name"),
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
      result = ToolRegistry.dispatch(tool_call, @conversation)
      return result if result
    end

    nil
  end

  def relevant_context(query)
    ContextRetrievalService.call(query)
  end

  def build_history
    @conversation.messages.chronological.last(10).map do |m|
      role = m.sender_type == "customer" ? "user" : "assistant"
      { role: role, content: m.body }
    end
  end

  def client
    @client ||= OpenAI::Client.new(
      uri_base:     ENV.fetch("AI_API_URL"),
      access_token: ENV.fetch("AI_API_KEY")
    )
  end

end
