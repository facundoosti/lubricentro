# == Schema Information
#
# Table name: conversations
#
#  id              :bigint           not null, primary key
#  label           :string
#  last_message_at :datetime
#  status          :string           default("bot"), not null
#  whatsapp_phone  :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  customer_id     :bigint
#
# Indexes
#
#  index_conversations_on_customer_id     (customer_id)
#  index_conversations_on_status          (status)
#  index_conversations_on_whatsapp_phone  (whatsapp_phone) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => customers.id)
#
class ConversationSerializer < Blueprinter::Base
  identifier :id

  fields :whatsapp_phone, :status, :label, :last_message_at, :created_at, :updated_at

  field :customer_name do |conversation|
    conversation.customer&.name
  end

  field :customer_id do |conversation|
    conversation.customer_id
  end

  field :last_message do |conversation|
    last = conversation.messages.max_by(&:created_at)
    last&.body&.truncate(60)
  end

  view :with_messages do
    association :messages, blueprint: MessageSerializer
  end
end
