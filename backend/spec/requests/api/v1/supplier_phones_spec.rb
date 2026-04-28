require 'rails_helper'

RSpec.describe "Api::V1::SupplierPhones", type: :request do
  include ApiHelper
  let(:user) { create(:user) }
  let(:valid_attributes) { { phone: "+5491188887777", company_name: "Empresa Test", notes: "Notas" } }
  let(:invalid_attributes) { { phone: "" } }

  describe "GET /api/v1/supplier_phones" do
    let!(:supplier_phones) { create_list(:supplier_phone, 3) }

    before { get "/api/v1/supplier_phones", headers: auth_headers(user) }

    it "returns a successful response" do
      expect(response).to have_http_status(:ok)
    end

    it "returns all supplier phones" do
      expect(json_response[:data][:supplier_phones].size).to eq(3)
    end

    it "follows the API response pattern" do
      expect(json_response[:success]).to be true
    end

    context "without authentication" do
      it "returns unauthorized" do
        get "/api/v1/supplier_phones"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/supplier_phones/:id" do
    let!(:supplier_phone) { create(:supplier_phone) }

    before { get "/api/v1/supplier_phones/#{supplier_phone.id}", headers: auth_headers(user) }

    it "returns a successful response" do
      expect(response).to have_http_status(:ok)
    end

    it "returns the supplier phone data" do
      expect(json_response[:data][:supplier_phone][:id]).to eq(supplier_phone.id)
      expect(json_response[:data][:supplier_phone][:phone]).to eq(supplier_phone.phone)
    end

    context "when not found" do
      before { get "/api/v1/supplier_phones/999999", headers: auth_headers(user) }

      it "returns not found" do
        expect(response).to have_http_status(:not_found)
        expect(json_response[:success]).to be false
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        get "/api/v1/supplier_phones/#{supplier_phone.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/v1/supplier_phones" do
    context "with valid parameters" do
      it "creates a new SupplierPhone" do
        expect {
          post "/api/v1/supplier_phones", params: { supplier_phone: valid_attributes }, headers: auth_headers(user)
        }.to change(SupplierPhone, :count).by(1)
      end

      it "returns created status" do
        post "/api/v1/supplier_phones", params: { supplier_phone: valid_attributes }, headers: auth_headers(user)
        expect(response).to have_http_status(:created)
        expect(json_response[:data][:supplier_phone][:phone]).to eq("+5491188887777")
      end
    end

    context "with invalid parameters" do
      it "does not create a supplier phone" do
        expect {
          post "/api/v1/supplier_phones", params: { supplier_phone: invalid_attributes }, headers: auth_headers(user)
        }.not_to change(SupplierPhone, :count)
      end

      it "returns unprocessable_content" do
        post "/api/v1/supplier_phones", params: { supplier_phone: invalid_attributes }, headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:success]).to be false
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        post "/api/v1/supplier_phones", params: { supplier_phone: valid_attributes }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PATCH /api/v1/supplier_phones/:id" do
    let!(:supplier_phone) { create(:supplier_phone) }

    context "with valid parameters" do
      it "updates the supplier phone" do
        patch "/api/v1/supplier_phones/#{supplier_phone.id}",
              params: { supplier_phone: { company_name: "Empresa Actualizada" } },
              headers: auth_headers(user)

        supplier_phone.reload
        expect(supplier_phone.company_name).to eq("Empresa Actualizada")
        expect(response).to have_http_status(:ok)
      end
    end

    context "with invalid parameters" do
      it "returns unprocessable_content" do
        patch "/api/v1/supplier_phones/#{supplier_phone.id}",
              params: { supplier_phone: invalid_attributes },
              headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        patch "/api/v1/supplier_phones/#{supplier_phone.id}", params: { supplier_phone: { company_name: "test" } }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/supplier_phones/:id" do
    let!(:supplier_phone) { create(:supplier_phone) }

    it "destroys the supplier phone" do
      expect {
        delete "/api/v1/supplier_phones/#{supplier_phone.id}", headers: auth_headers(user)
      }.to change(SupplierPhone, :count).by(-1)

      expect(response).to have_http_status(:ok)
      expect(json_response[:success]).to be true
    end

    context "without authentication" do
      it "returns unauthorized" do
        delete "/api/v1/supplier_phones/#{supplier_phone.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
