class AiAgentJob < ApplicationJob
  queue_as :ai

  def perform(conversation_id, message_id)
    conversation = Conversation.includes(:messages, :customer).find(conversation_id)
    message      = Message.find(message_id)

    # Guard: only run if still in bot mode (status may have changed)
    return unless conversation.bot?

    response = AiAgentService.new(conversation).process(message.body)

    outbound = conversation.messages.create!(
      direction:   "outbound",
      sender_type: "bot",
      body:        response[:reply]
    )

    conversation.update!(last_message_at: Time.current)

    WhatsAppService.send_message(
      phone: conversation.whatsapp_phone,
      text:  response[:reply]
    )

    ActionCable.server.broadcast("inbox", {
      conversation_id: conversation.id,
      status:          conversation.status,
      new_message:     { id: outbound.id, body: outbound.body, direction: "outbound", sender_type: "bot" }
    })
  end
end
