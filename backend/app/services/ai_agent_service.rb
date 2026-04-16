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
      - Si el mensaje parece ser de un proveedor, usá classify_intent.
      - Si el cliente pregunta qué turnos hay o cuándo puede venir, usá check_available_slots con la fecha en formato YYYY-MM-DD.
      - Si el cliente quiere sacar un turno, primero consultá los disponibles con check_available_slots y luego usá schedule_appointment con fecha y hora exacta (YYYY-MM-DD HH:MM).
      - Si no podés resolver la consulta, usá escalate_to_human.

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

    parse_llm_response(response.dig("choices", 0, "message"))
  rescue => e
    Rails.logger.error("[AiAgentService] LLM call failed: #{e.message}")
    { content: "Hubo un problema al procesar tu consulta. Un agente te va a contactar a la brevedad." }
  end

  def parse_llm_response(choice)
    tool_calls = choice["tool_calls"]
    return { content: choice["content"] } unless tool_calls.present?

    parsed_calls = tool_calls.map do |tc|
      {
        name:      tc.dig("function", "name"),
        arguments: JSON.parse(tc.dig("function", "arguments")).symbolize_keys
      }
    end
    { tool_calls: parsed_calls }
  end

  def handle_tool_calls(response)
    return nil unless response[:tool_calls]

    response[:tool_calls].lazy.filter_map { |tc| ToolRegistry.dispatch(tc, @conversation) }.first
  end

  def relevant_context(query)
    ContextRetrievalService.call(query)
  end

  def build_history
    @conversation.messages.chronological.last(10).map do |m|
      { role: m.llm_role, content: m.body }
    end
  end

  def client
    @client ||= OpenAI::Client.new(
      uri_base:      ENV.fetch("AI_API_URL"),
      access_token:  ENV.fetch("AI_API_KEY"),
      extra_headers: {
        "HTTP-Referer" => "https://lubricentro.app",
        "X-Title"      => "Lubricentro"
      }
    )
  end

end
