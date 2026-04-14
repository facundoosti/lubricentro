class MessageProcessorJob < ApplicationJob
  queue_as :inbox

  def perform(payload)
    direction = payload.dig("message", "kapso", "direction")
    status    = payload.dig("message", "kapso", "status")

    if direction == "inbound" && payload.dig("message", "type") == "text"
      handle_message_received(payload)
    elsif direction == "outbound"
      case status
      when "failed"    then handle_message_failed(payload)
      when "delivered" then handle_message_delivered(payload)
      when "read"      then handle_message_read(payload)
      end
    end
  end

  private

  SUPPLIER_DEFAULT_REPLY = "Gracias por comunicarte. Tu mensaje fue recibido y lo revisaremos a la brevedad."

  # whatsapp.message.received — inbound text
  def handle_message_received(payload)
    message_data = extract_message(payload)
    return unless message_data

    is_supplier = SupplierPhone.exists?(phone: message_data[:from])

    conversation = Conversation.find_or_create_by!(
      whatsapp_phone: message_data[:from]
    ) do |c|
      c.customer = Customer.find_by(phone: message_data[:from])
      c.status   = is_supplier ? "supplier" : "bot"
    end

    # Upgrade existing conversations when phone was added to supplier_phones later
    if is_supplier && !conversation.supplier?
      conversation.update!(status: "supplier")
    end

    # Reactivate archived conversations when a new message arrives
    if !is_supplier && conversation.archived?
      conversation.update!(status: "bot")
    end

    # Idempotency: skip if already processed
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

    if conversation.supplier?
      send_supplier_default_reply(conversation)
    elsif conversation.bot?
      AiAgentJob.perform_later(conversation.id, message.id)
    end
  end

  # whatsapp.message.failed — outbound message could not be delivered
  def handle_message_failed(payload)
    wamid         = payload.dig("message", "id")
    phone         = payload.dig("conversation", "phone_number")
    errors        = payload.dig("message", "kapso", "statuses")&.last&.dig("errors") || []
    error_summary = errors.map { |e| "#{e["code"]}: #{e["title"]}" }.join(", ")

    Rails.logger.error("[MessageProcessorJob] Outbound message failed — wamid=#{wamid} phone=#{phone} errors=#{error_summary}")

    conversation = Conversation.find_by(whatsapp_phone: phone)
    return unless conversation
    return if conversation.needs_human? # already escalated

    conversation.update!(status: "needs_human")

    ActionCable.server.broadcast("inbox", {
      conversation_id: conversation.id,
      status:          "needs_human",
      alert:           { type: "message_failed", wamid: wamid, errors: error_summary }
    })
  end

  # whatsapp.message.delivered — outbound message reached recipient's device
  def handle_message_delivered(payload)
    wamid = payload.dig("message", "id")
    message = Message.find_by(whatsapp_message_id: wamid)
    return unless message
    return if message.delivered_at # already stamped

    message.update!(delivered_at: Time.current)

    ActionCable.server.broadcast("inbox", {
      conversation_id: message.conversation_id,
      message_status:  { id: message.id, wamid: wamid, status: "delivered" }
    })
  end

  # whatsapp.message.read — recipient opened the message
  def handle_message_read(payload)
    wamid = payload.dig("message", "id")
    message = Message.find_by(whatsapp_message_id: wamid)
    return unless message
    return if message.read_at # already stamped

    message.update!(delivered_at: message.delivered_at || Time.current, read_at: Time.current)

    ActionCable.server.broadcast("inbox", {
      conversation_id: message.conversation_id,
      message_status:  { id: message.id, wamid: wamid, status: "read" }
    })
  end

  def send_supplier_default_reply(conversation)
    # Create the record first so it always appears in the UI
    reply = conversation.messages.create!(
      direction:   "outbound",
      sender_type: "bot",
      body:        SUPPLIER_DEFAULT_REPLY,
      received_at: Time.current
    )

    conversation.update!(last_message_at: Time.current)

    ActionCable.server.broadcast("inbox", {
      conversation_id: conversation.id,
      status:          conversation.status,
      new_message:     { id: reply.id, body: reply.body, direction: "outbound", sender_type: "bot" }
    })

    # Send via WhatsApp after — failure here doesn't affect UI visibility
    WhatsAppService.send_message(phone: conversation.whatsapp_phone, text: SUPPLIER_DEFAULT_REPLY)
  rescue => e
    Rails.logger.error("[MessageProcessorJob] Failed to send supplier reply to #{conversation.whatsapp_phone}: #{e.message}")
  end

  def extract_message(payload)
    msg  = payload["message"]
    conv = payload["conversation"]
    return unless msg && conv

    {
      from: conv["phone_number"],
      text: msg.dig("text", "body"),
      id:   msg["id"]
    }
  end
end
