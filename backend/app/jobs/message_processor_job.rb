class MessageProcessorJob < ApplicationJob
  queue_as :inbox

  def perform(payload)
    message_data = extract_message(payload)
    return unless message_data

    conversation = Conversation.find_or_create_by!(
      whatsapp_phone: message_data[:from]
    ) do |c|
      c.customer = Customer.find_by(phone: message_data[:from])
      c.status   = "bot"
    end

    # Idempotency: skip if we already processed this WhatsApp message
    return if message_data[:id].present? &&
              Message.exists?(whatsapp_message_id: message_data[:id])

    message = conversation.messages.create!(
      direction:           "inbound",
      sender_type:         "customer",
      body:                message_data[:text],
      whatsapp_message_id: message_data[:id],
      received_at:         Time.current
    )

    conversation.update!(last_message_at: Time.current)

    ActionCable.server.broadcast("inbox", {
      conversation_id: conversation.id,
      status:          conversation.status,
      new_message:     { id: message.id, body: message.body, direction: "inbound", sender_type: "customer" }
    })

    AiAgentJob.perform_later(conversation.id, message.id) if conversation.bot?
  end

  private

  def extract_message(payload)
    entry = payload.dig("entry", 0, "changes", 0, "value")
    return unless entry&.dig("messages")

    msg = entry["messages"].first
    return unless msg["type"] == "text"

    { from: msg["from"], text: msg.dig("text", "body"), id: msg["id"] }
  end
end
