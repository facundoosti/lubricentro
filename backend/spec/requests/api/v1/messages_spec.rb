require 'rails_helper'

RSpec.describe "Api::V1::Messages", type: :request do
  include ApiHelper

  let(:user)         { create(:user) }
  let(:conversation) { create(:conversation) }

  before do
    allow(WhatsAppService).to receive(:send_message)
    allow(ActionCable.server).to receive(:broadcast)
  end

  describe "POST /api/v1/conversations/:conversation_id/messages" do
    context "with valid body" do
      let(:valid_params) { { message: { body: "Hola, ¿en qué podemos ayudarte?" } } }

      before do
        post "/api/v1/conversations/#{conversation.id}/messages",
          params: valid_params,
          headers: auth_headers(user)
      end

      it "returns 201" do
        expect(response).to have_http_status(:created)
      end

      it "creates a message" do
        expect(conversation.messages.count).to eq(1)
      end

      it "returns the message" do
        data = json_response[:data][:message]
        expect(data[:body]).to eq("Hola, ¿en qué podemos ayudarte?")
        expect(data[:direction]).to eq("outbound")
        expect(data[:sender_type]).to eq("agent")
      end

      it "calls WhatsAppService" do
        expect(WhatsAppService).to have_received(:send_message)
      end

      it "broadcasts to inbox channel with new_message payload" do
        expect(ActionCable.server).to have_received(:broadcast).with(
          "inbox",
          hash_including(
            conversation_id: conversation.id,
            new_message:     hash_including(direction: "outbound", sender_type: "agent")
          )
        )
      end

      it "updates last_message_at on the conversation" do
        expect(conversation.reload.last_message_at).to be_present
      end
    end

    context "with empty body" do
      before do
        post "/api/v1/conversations/#{conversation.id}/messages",
          params: { message: { body: "" } },
          headers: auth_headers(user)
      end

      it "returns 422" do
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "when conversation does not exist" do
      before do
        post "/api/v1/conversations/0/messages",
          params: { message: { body: "hello" } },
          headers: auth_headers(user)
      end

      it "returns 404" do
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
