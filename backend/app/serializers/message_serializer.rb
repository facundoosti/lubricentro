# == Schema Information
#
# Table name: messages
#
#  id                  :bigint           not null, primary key
#  body                :text             not null
#  direction           :string           not null
#  received_at         :datetime
#  sender_type         :string
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  conversation_id     :bigint           not null
#  whatsapp_message_id :string
#
# Indexes
#
#  index_messages_on_conversation_id      (conversation_id)
#  index_messages_on_whatsapp_message_id  (whatsapp_message_id) UNIQUE WHERE (whatsapp_message_id IS NOT NULL)
#
# Foreign Keys
#
#  fk_rails_...  (conversation_id => conversations.id)
#
class MessageSerializer < Blueprinter::Base
  identifier :id

  fields :direction, :sender_type, :body, :whatsapp_message_id, :received_at, :created_at
end
