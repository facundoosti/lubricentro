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
