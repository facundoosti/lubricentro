require 'rails_helper'

RSpec.describe "Api::V1::Settings", type: :request do
  include ApiHelper

  let(:user) { create(:user) }

  describe "GET /api/v1/setting" do
    before { get "/api/v1/setting", headers: auth_headers(user) }

    it "returns 200" do
      expect(response).to have_http_status(:ok)
    end

    it "returns the setting" do
      expect(json_response[:success]).to be true
      expect(json_response[:data]).to include(:id)
    end

    it "returns setting fields" do
      expect(json_response[:data]).to include(
        :lubricentro_name, :phone, :mobile, :address, :cuit, :owner_name
      )
    end
  end

  describe "PATCH /api/v1/setting" do
    let(:valid_params) do
      {
        setting: {
          lubricentro_name: "Mi Lubricentro",
          phone: "011-5555-1234",
          owner_name: "Carlos Lopez",
          cuit: "20-12345678-9"
        }
      }
    end

    context "with valid params" do
      before { patch "/api/v1/setting", params: valid_params, headers: auth_headers(user) }

      it "returns 200" do
        expect(response).to have_http_status(:ok)
      end

      it "updates the setting" do
        expect(Setting.instance.lubricentro_name).to eq("Mi Lubricentro")
        expect(Setting.instance.owner_name).to eq("Carlos Lopez")
      end

      it "returns success response" do
        expect(json_response[:success]).to be true
      end
    end

    context "with invalid params" do
      before do
        patch "/api/v1/setting",
          params: { setting: { lubricentro_name: "A" * 151 } },
          headers: auth_headers(user)
      end

      it "returns 422" do
        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end
end
