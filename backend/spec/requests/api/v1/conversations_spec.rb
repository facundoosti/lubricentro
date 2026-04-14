require 'rails_helper'

RSpec.describe "Api::V1::Conversations", type: :request do
  include ApiHelper

  let(:user) { create(:user) }

  describe "GET /api/v1/conversations" do
    let!(:bot_conv)   { create(:conversation) }
    let!(:human_conv) { create(:conversation, :needs_human) }

    context "without status filter" do
      before { get "/api/v1/conversations", headers: auth_headers(user) }

      it "returns 200" do
        expect(response).to have_http_status(:ok)
      end

      it "returns all conversations" do
        expect(json_response[:data][:conversations].length).to eq(2)
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

    it "broadcasts the status change" do
      expect(ActionCable.server).to have_received(:broadcast).with(
        "inbox", hash_including(conversation_id: conversation.id, status: "needs_human")
      )
    end
  end

  describe "PATCH /api/v1/conversations/:id/archive" do
    let!(:conversation) { create(:conversation) }

    before do
      allow(ActionCable.server).to receive(:broadcast)
      patch "/api/v1/conversations/#{conversation.id}/archive", headers: auth_headers(user)
    end

    it "returns 200" do
      expect(response).to have_http_status(:ok)
    end

    it "archives the conversation" do
      expect(conversation.reload.status).to eq("archived")
    end

    it "broadcasts the status change" do
      expect(ActionCable.server).to have_received(:broadcast).with(
        "inbox", hash_including(conversation_id: conversation.id, status: "archived")
      )
    end
  end

  describe "PATCH /api/v1/conversations/:id/mark_as_supplier" do
    let!(:conversation) { create(:conversation) }

    before do
      allow(ActionCable.server).to receive(:broadcast)
      patch "/api/v1/conversations/#{conversation.id}/mark_as_supplier", headers: auth_headers(user)
    end

    it "returns 200" do
      expect(response).to have_http_status(:ok)
    end

    it "marks conversation as supplier" do
      expect(conversation.reload.status).to eq("supplier")
    end

    it "creates a SupplierPhone record for the phone" do
      expect(SupplierPhone.find_by(phone: conversation.whatsapp_phone)).to be_present
    end

    it "broadcasts the status change" do
      expect(ActionCable.server).to have_received(:broadcast).with(
        "inbox", hash_including(conversation_id: conversation.id, status: "supplier")
      )
    end

    context "with optional company_name and notes" do
      # Use a fresh conversation — the outer before already called mark_as_supplier
      # on `conversation` without params, so find_or_create_by! would not update it.
      let!(:other_conversation) { create(:conversation) }

      before do
        patch "/api/v1/conversations/#{other_conversation.id}/mark_as_supplier",
          params:  { company_name: "Lubricantes SA", notes: "Proveedor principal" },
          headers: auth_headers(user)
      end

      it "saves company_name on SupplierPhone" do
        sp = SupplierPhone.find_by(phone: other_conversation.whatsapp_phone)
        expect(sp.company_name).to eq("Lubricantes SA")
      end

      it "saves notes on SupplierPhone" do
        sp = SupplierPhone.find_by(phone: other_conversation.whatsapp_phone)
        expect(sp.notes).to eq("Proveedor principal")
      end
    end
  end
end
