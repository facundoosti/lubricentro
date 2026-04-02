class Api::V1::ConversationsController < ApplicationController
  before_action :set_conversation, only: [ :show, :update, :resolve, :assign_human ]

  # GET /api/v1/conversations
  def index
    @conversations = Conversation.includes(:customer, :messages)
                                 .by_status(params[:status])
                                 .recent

    @pagy, @conversations = pagy(@conversations, items: safe_per_page(params[:per_page]))
    data = ConversationSerializer.render_as_hash(@conversations, root: :conversations)
    render_json(data)
  end

  # GET /api/v1/conversations/:id
  def show
    data = ConversationSerializer.render_as_hash(@conversation, view: :with_messages, root: :conversation)
    render_json(data)
  end

  # PATCH /api/v1/conversations/:id/resolve
  def resolve
    @conversation.update!(status: "resolved")
    broadcast_status_update(@conversation)
    data = ConversationSerializer.render_as_hash(@conversation, root: :conversation)
    render_json(data, message: "Conversación marcada como resuelta")
  end

  # PATCH /api/v1/conversations/:id/assign_human
  def assign_human
    @conversation.update!(status: "needs_human")
    broadcast_status_update(@conversation)
    data = ConversationSerializer.render_as_hash(@conversation, root: :conversation)
    render_json(data, message: "Conversación derivada a agente humano")
  end

  private

  def set_conversation
    @conversation = Conversation.includes(:customer, :messages).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_json({ errors: [ "Conversación no encontrada" ] }, message: "No encontrada", status: :not_found)
  end

  def broadcast_status_update(conversation)
    ActionCable.server.broadcast("inbox", {
      conversation_id: conversation.id,
      status:          conversation.status
    })
  end
end
