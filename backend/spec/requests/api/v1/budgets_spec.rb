require 'rails_helper'

RSpec.describe "Api::V1::Budgets", type: :request do
  include ApiHelper

  let(:user)     { create(:user) }
  let(:customer) { create(:customer) }
  let(:vehicle)  { create(:vehicle, customer: customer) }

  let(:valid_attributes) do
    {
      budgets: {
        customer_id: customer.id,
        vehicle_id: vehicle.id,
        date: Date.current.iso8601,
        status: "draft",
        notes: "Test budget",
        card_surcharge_percentage: 0,
        items_attributes: [
          { description: "Cambio de aceite", quantity: 1, unit_price: 500 }
        ]
      }
    }
  end

  describe "GET /api/v1/budgets" do
    let!(:budgets) { create_list(:budget, 3, customer: customer, vehicle: vehicle) }

    before { get "/api/v1/budgets", headers: auth_headers(user) }

    it "returns 200" do
      expect(response).to have_http_status(:ok)
    end

    it "returns all budgets" do
      expect(json_response[:data][:budgets].length).to eq(3)
    end

    it "follows API response pattern" do
      expect(json_response).to include(success: true, data: hash_including(:budgets, :pagination))
    end
  end

  describe "GET /api/v1/budgets with filters" do
    let!(:draft_budget)   { create(:budget, status: "draft",   customer: customer, vehicle: vehicle) }
    let!(:sent_budget)    { create(:budget, status: "sent",    customer: customer, vehicle: vehicle) }

    it "filters by status" do
      get "/api/v1/budgets", params: { status: "draft" }, headers: auth_headers(user)
      ids = json_response[:data][:budgets].map { |b| b[:id] }
      expect(ids).to include(draft_budget.id)
      expect(ids).not_to include(sent_budget.id)
    end

    it "searches by vehicle_description" do
      create(:budget, vehicle_description: "Ford Ranger ABC123", customer: customer, vehicle: vehicle)
      get "/api/v1/budgets", params: { search: "Ford" }, headers: auth_headers(user)
      expect(json_response[:data][:budgets].length).to eq(1)
    end
  end

  describe "GET /api/v1/budgets/:id" do
    let!(:budget) { create(:budget, :with_items, customer: customer, vehicle: vehicle) }

    context "when budget exists" do
      before { get "/api/v1/budgets/#{budget.id}", headers: auth_headers(user) }

      it "returns 200" do
        expect(response).to have_http_status(:ok)
      end

      it "returns the budget with items" do
        data = json_response[:data]
        expect(data[:id]).to eq(budget.id)
        expect(data[:items]).to be_an(Array)
      end
    end

    context "when budget does not exist" do
      before { get "/api/v1/budgets/0", headers: auth_headers(user) }

      it "returns 404" do
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "POST /api/v1/budgets" do
    context "with valid attributes" do
      before { post "/api/v1/budgets", params: valid_attributes, headers: auth_headers(user) }

      it "returns 201" do
        expect(response).to have_http_status(:created)
      end

      it "creates the budget" do
        expect(Budget.count).to eq(1)
      end

      it "returns the created budget" do
        expect(json_response[:data][:status]).to eq("draft")
      end
    end

    context "with invalid attributes" do
      before do
        post "/api/v1/budgets",
          params: { budgets: { date: nil, status: "invalid_status" } },
          headers: auth_headers(user)
      end

      it "returns 422" do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "PATCH /api/v1/budgets/:id" do
    let!(:budget) { create(:budget, status: "draft", customer: customer, vehicle: vehicle) }

    context "with valid attributes" do
      before do
        patch "/api/v1/budgets/#{budget.id}",
          params: { budgets: { notes: "Updated notes" } },
          headers: auth_headers(user)
      end

      it "returns 200" do
        expect(response).to have_http_status(:ok)
      end

      it "updates the budget" do
        expect(budget.reload.notes).to eq("Updated notes")
      end
    end

    context "with invalid attributes" do
      before do
        patch "/api/v1/budgets/#{budget.id}",
          params: { budgets: { status: "invalid" } },
          headers: auth_headers(user)
      end

      it "returns 422" do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "when budget does not exist" do
      before do
        patch "/api/v1/budgets/0",
          params: { budgets: { notes: "x" } },
          headers: auth_headers(user)
      end

      it "returns 404" do
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/v1/budgets/:id" do
    let!(:budget) { create(:budget, customer: customer, vehicle: vehicle) }

    context "when budget exists" do
      before { delete "/api/v1/budgets/#{budget.id}", headers: auth_headers(user) }

      it "returns 200" do
        expect(response).to have_http_status(:ok)
      end

      it "destroys the budget" do
        expect(Budget.find_by(id: budget.id)).to be_nil
      end
    end

    context "when budget does not exist" do
      before { delete "/api/v1/budgets/0", headers: auth_headers(user) }

      it "returns 404" do
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
