require 'rails_helper'

RSpec.describe ConversationSerializer, type: :serializer do
  let(:customer)     { create(:customer) }
  let(:conversation) { create(:conversation, :with_messages, customer: customer) }

  describe 'default view' do
    subject(:result) { ConversationSerializer.render_as_hash(conversation) }

    it 'includes core fields' do
      expect(result).to include(
        :id, :whatsapp_phone, :status, :label, :last_message_at,
        :customer_name, :customer_id, :last_message
      )
    end

    it 'returns customer_name' do
      expect(result[:customer_name]).to eq(customer.name)
    end

    it 'returns last_message truncated to 60 chars' do
      expect(result[:last_message].length).to be <= 60
    end

    it 'returns nil last_message for conversation without messages' do
      empty_conversation = create(:conversation)
      result = ConversationSerializer.render_as_hash(empty_conversation)
      expect(result[:last_message]).to be_nil
    end
  end

  describe ':with_messages view' do
    subject(:result) { ConversationSerializer.render_as_hash(conversation, view: :with_messages) }

    it 'includes messages array' do
      expect(result[:messages]).to be_an(Array)
      expect(result[:messages].length).to eq(2)
    end

    it 'includes message fields' do
      expect(result[:messages].first).to include(:id, :body, :direction, :sender_type)
    end
  end
end
