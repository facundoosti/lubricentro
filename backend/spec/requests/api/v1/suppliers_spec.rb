require 'rails_helper'

RSpec.describe "Api::V1::Suppliers", type: :request do
  include ApiHelper
  let(:user) { create(:user) }
  let(:valid_attributes) { { name: "Proveedor Test", email: "proveedor@test.com", phone: "1234567890" } }
  let(:invalid_attributes) { { name: "" } }

  describe "GET /api/v1/suppliers" do
    let!(:suppliers) { create_list(:supplier, 3) }

    before { get "/api/v1/suppliers", headers: auth_headers(user) }

    it "returns a successful response" do
      expect(response).to have_http_status(:ok)
    end

    it "returns all suppliers" do
      expect(json_response[:data][:suppliers].size).to eq(3)
    end

    it "follows the API response pattern" do
      expect(json_response[:success]).to be true
      expect(json_response[:data]).to have_key(:suppliers)
      expect(json_response[:data]).to have_key(:pagination)
    end

    context "with search filter" do
      let!(:matching) { create(:supplier, name: "TotalEnergies SA") }

      before { get "/api/v1/suppliers", params: { search: "TotalEnergies" }, headers: auth_headers(user) }

      it "returns only matching suppliers" do
        names = json_response[:data][:suppliers].map { |s| s[:name] }
        expect(names).to include("TotalEnergies SA")
        expect(names).not_to include(suppliers.first[:name])
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        get "/api/v1/suppliers"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/suppliers/:id" do
    let(:supplier) { create(:supplier, :with_contact) }

    before { get "/api/v1/suppliers/#{supplier.id}", headers: auth_headers(user) }

    it "returns a successful response" do
      expect(response).to have_http_status(:ok)
    end

    it "returns the supplier data" do
      expect(json_response[:data][:id]).to eq(supplier.id)
      expect(json_response[:data][:name]).to eq(supplier.name)
    end

    context "when supplier does not exist" do
      before { get "/api/v1/suppliers/999999", headers: auth_headers(user) }

      it "returns not found" do
        expect(response).to have_http_status(:not_found)
        expect(json_response[:success]).to be false
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        get "/api/v1/suppliers/#{supplier.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/v1/suppliers" do
    context "with valid parameters" do
      it "creates a new Supplier" do
        expect {
          post "/api/v1/suppliers", params: { supplier: valid_attributes }, headers: auth_headers(user)
        }.to change(Supplier, :count).by(1)
      end

      it "returns created status with supplier data" do
        post "/api/v1/suppliers", params: { supplier: valid_attributes }, headers: auth_headers(user)
        expect(response).to have_http_status(:created)
        expect(json_response[:data][:name]).to eq("Proveedor Test")
      end
    end

    context "with invalid parameters" do
      it "does not create a supplier" do
        expect {
          post "/api/v1/suppliers", params: { supplier: invalid_attributes }, headers: auth_headers(user)
        }.not_to change(Supplier, :count)
      end

      it "returns unprocessable_content" do
        post "/api/v1/suppliers", params: { supplier: invalid_attributes }, headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:success]).to be false
        expect(json_response[:errors]).to be_present
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        post "/api/v1/suppliers", params: { supplier: valid_attributes }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PATCH /api/v1/suppliers/:id" do
    let!(:supplier) { create(:supplier) }

    context "with valid parameters" do
      it "updates the supplier" do
        patch "/api/v1/suppliers/#{supplier.id}", params: { supplier: { name: "Nuevo Nombre" } }, headers: auth_headers(user)
        supplier.reload
        expect(supplier.name).to eq("Nuevo Nombre")
        expect(response).to have_http_status(:ok)
      end
    end

    context "with invalid parameters" do
      it "returns unprocessable_content" do
        patch "/api/v1/suppliers/#{supplier.id}", params: { supplier: invalid_attributes }, headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        patch "/api/v1/suppliers/#{supplier.id}", params: { supplier: { name: "test" } }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/suppliers/:id" do
    let!(:supplier) { create(:supplier) }

    context "when supplier has no products" do
      it "destroys the supplier" do
        expect {
          delete "/api/v1/suppliers/#{supplier.id}", headers: auth_headers(user)
        }.to change(Supplier, :count).by(-1)

        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
      end
    end

    context "when supplier has associated products" do
      before { create(:product, supplier: supplier) }

      it "returns error and does not destroy" do
        expect {
          delete "/api/v1/suppliers/#{supplier.id}", headers: auth_headers(user)
        }.not_to change(Supplier, :count)

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        delete "/api/v1/suppliers/#{supplier.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
