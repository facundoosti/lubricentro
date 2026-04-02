require 'rails_helper'

RSpec.describe "Api::V1::Conversations", type: :request do
  include ApiHelper

  let(:user) { create(:user) }

  describe "GET /api/v1/conversations" do
    let!(:bot_conv)       { create(:conversation) }
    let!(:human_conv)     { create(:conversation, :needs_human) }
    let!(:resolved_conv)  { create(:conversation, :resolved) }

    context "without status filter" do
      before { get "/api/v1/conversations", headers: auth_headers(user) }

      it "returns 200" do
        expect(response).to have_http_status(:ok)
      end

      it "returns all conversations" do
        expect(json_response[:data][:conversations].length).to eq(3)
      end

      it "follows API response pattern" do
        expect(json_response).to include(success: true, data: hash_including(:conversations, :pagination))
      end
    end

    context "with status filter" do
      before { get "/api/v1/conversations", params: { status: "bot" }, headers: auth_headers(user) }

      it "returns only bot conversations" do
        ids = json_response[:data][:conversations].map { |c| c[:id] }
        expect(ids).to include(bot_conv.id)
        expect(ids).not_to include(human_conv.id)
      end
    end
  end

  describe "GET /api/v1/conversations/:id" do
    let!(:conversation) { create(:conversation, :with_messages) }

    context "when conversation exists" do
      before { get "/api/v1/conversations/#{conversation.id}", headers: auth_headers(user) }

      it "returns 200" do
        expect(response).to have_http_status(:ok)
      end

      it "returns conversation with messages" do
        data = json_response[:data][:conversation]
        expect(data[:id]).to eq(conversation.id)
        expect(data[:messages]).to be_an(Array)
      end
    end

    context "when conversation does not exist" do
      before { get "/api/v1/conversations/0", headers: auth_headers(user) }

      it "returns 404" do
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "PATCH /api/v1/conversations/:id/resolve" do
    let!(:conversation) { create(:conversation, :needs_human) }

    before do
      allow(ActionCable.server).to receive(:broadcast)
      patch "/api/v1/conversations/#{conversation.id}/resolve", headers: auth_headers(user)
    end

    it "returns 200" do
      expect(response).to have_http_status(:ok)
    end

    it "marks conversation as resolved" do
      expect(conversation.reload.status).to eq("resolved")
    end

    it "broadcasts status update" do
      expect(ActionCable.server).to have_received(:broadcast).with("inbox", hash_including(conversation_id: conversation.id))
    end

    context "when conversation does not exist" do
      before do
        allow(ActionCable.server).to receive(:broadcast)
        patch "/api/v1/conversations/0/resolve", headers: auth_headers(user)
      end

      it "returns 404" do
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "PATCH /api/v1/conversations/:id/assign_human" do
    let!(:conversation) { create(:conversation) }

    before do
      allow(ActionCable.server).to receive(:broadcast)
      patch "/api/v1/conversations/#{conversation.id}/assign_human", headers: auth_headers(user)
    end

    it "returns 200" do
      expect(response).to have_http_status(:ok)
    end

    it "marks conversation as needs_human" do
      expect(conversation.reload.status).to eq("needs_human")
    end
  end
end
