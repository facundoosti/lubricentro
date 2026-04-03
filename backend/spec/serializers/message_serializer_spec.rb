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
require 'rails_helper'

RSpec.describe MessageSerializer, type: :serializer do
  let(:message) { create(:message, direction: "inbound", sender_type: "customer") }

  subject(:result) { MessageSerializer.render_as_hash(message) }

  it 'includes all fields' do
    expect(result).to include(
      :id, :direction, :sender_type, :body,
      :whatsapp_message_id, :received_at, :created_at
    )
  end

  it 'returns correct direction' do
    expect(result[:direction]).to eq("inbound")
  end

  it 'returns correct sender_type' do
    expect(result[:sender_type]).to eq("customer")
  end
end
