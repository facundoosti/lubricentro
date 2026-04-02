class Api::V1::MessagesController < ApplicationController
  before_action :set_conversation

  # POST /api/v1/conversations/:conversation_id/messages
  # Used by agents to send manual replies
  def create
    message = @conversation.messages.build(
      direction:   "outbound",
      sender_type: "agent",
      body:        message_params[:body]
    )

    if message.save
      @conversation.update!(last_message_at: Time.current)

      WhatsAppService.send_message(
        phone: @conversation.whatsapp_phone,
        text:  message.body
      )

      ActionCable.server.broadcast("inbox", {
        conversation_id: @conversation.id,
        new_message:     { id: message.id, body: message.body, direction: "outbound", sender_type: "agent" }
      })

      data = MessageSerializer.render_as_hash(message, root: :message)
      render_json(data, message: "Mensaje enviado", status: :created)
    else
      render_json({ errors: message.errors.full_messages }, message: "Error al enviar el mensaje", status: :unprocessable_entity)
    end
  end

  private

  def set_conversation
    @conversation = Conversation.find(params[:conversation_id])
  rescue ActiveRecord::RecordNotFound
    render_json({ errors: [ "Conversación no encontrada" ] }, message: "No encontrada", status: :not_found)
  end

  def message_params
    params.require(:message).permit(:body)
  end
end
