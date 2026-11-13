require 'rails_helper'

RSpec.describe "Api::V1::InstallmentPlans", type: :request do
  include ApiHelper

  let(:user) { create(:user) }

  describe "GET /api/v1/installment_plans" do
    it "lista los planes en orden" do
      create(:installment_plan, name: "B", position: 2)
      create(:installment_plan, name: "A", position: 1, active: false)
      get "/api/v1/installment_plans", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      plans = json_response[:data][:installment_plans]
      expect(plans.map { |p| p[:name] }).to eq(%w[A B])
      expect(plans.first).to include(:installments, :surcharge_percentage, :active, :position)
    end

    it "incluye los planes inactivos" do
      create(:installment_plan, name: "Off", active: false)
      get "/api/v1/installment_plans", headers: auth_headers(user)

      plan = json_response[:data][:installment_plans].first
      expect(plan).to include(name: "Off", active: false)
    end

    it "requiere autenticación" do
      get "/api/v1/installment_plans"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/installment_plans/:id" do
    it "devuelve el plan" do
      plan = create(:installment_plan, name: "VISA", installments: 6)
      get "/api/v1/installment_plans/#{plan.id}", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(json_response[:data]).to include(id: plan.id, name: "VISA", installments: 6)
    end

    it "devuelve 404 si no existe" do
      get "/api/v1/installment_plans/0", headers: auth_headers(user)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/installment_plans" do
    it "crea un plan activo" do
      post "/api/v1/installment_plans",
           params: { installment_plan: { name: "VISA", installments: 6, surcharge_percentage: 20 } },
           headers: auth_headers(user)

      expect(response).to have_http_status(:created)
      expect(json_response[:data]).to include(name: "VISA", installments: 6, active: true, surcharge_percentage: "20.0")
    end

    it "rechaza 1 cuota con 422" do
      post "/api/v1/installment_plans",
           params: { installment_plan: { name: "VISA", installments: 1, surcharge_percentage: 0 } },
           headers: auth_headers(user)

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_response[:success]).to be false
    end
  end

  describe "POST /api/v1/installment_plans sin clave raíz" do
    it "responde 400 y no crea nada" do
      expect {
        post "/api/v1/installment_plans", params: { name: "VISA", installments: 6 }, headers: auth_headers(user)
      }.not_to change(InstallmentPlan, :count)
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe "PATCH /api/v1/installment_plans/:id" do
    let(:plan) { create(:installment_plan) }

    it "desactiva el plan" do
      patch "/api/v1/installment_plans/#{plan.id}", params: { installment_plan: { active: false } }, headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(plan.reload.active).to be false
    end

    it "rechaza un recargo negativo" do
      patch "/api/v1/installment_plans/#{plan.id}", params: { installment_plan: { surcharge_percentage: -1 } }, headers: auth_headers(user)
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "devuelve 404 si no existe" do
      patch "/api/v1/installment_plans/0", params: { installment_plan: { active: false } }, headers: auth_headers(user)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "DELETE /api/v1/installment_plans/:id" do
    it "borra el plan" do
      plan = create(:installment_plan)
      expect {
        delete "/api/v1/installment_plans/#{plan.id}", headers: auth_headers(user)
      }.to change(InstallmentPlan, :count).by(-1)
    end

    it "devuelve 404 si no existe" do
      delete "/api/v1/installment_plans/0", headers: auth_headers(user)
      expect(response).to have_http_status(:not_found)
    end
  end
end
