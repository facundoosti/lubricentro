require 'rails_helper'

RSpec.describe "Api::V1::Dashboard", type: :request do
  include ApiHelper

  let(:user) { create(:user) }

  describe "GET /api/v1/dashboard/stats" do
    before { get "/api/v1/dashboard/stats", headers: auth_headers(user) }

    it "returns 200" do
      expect(response).to have_http_status(:ok)
    end

    it "returns success response" do
      expect(json_response[:success]).to be true
    end

    it "returns all stat sections" do
      data = json_response[:data]
      expect(data).to include(:metrics, :trends, :goals, :alerts, :recent_activity)
    end

    it "returns metrics with expected keys" do
      metrics = json_response[:data][:metrics]
      expect(metrics).to include(
        :customers, :vehicles, :appointments_today,
        :monthly_revenue, :weekly_revenue, :pending_budgets
      )
    end

    it "returns trends with expected keys" do
      trends = json_response[:data][:trends]
      expect(trends).to include(:monthly_services, :services_by_type, :customer_flow)
    end

    it "returns goals with expected keys" do
      goals = json_response[:data][:goals]
      expect(goals).to include(:revenue_target, :revenue_current, :services_target)
    end

    it "returns alerts as array" do
      expect(json_response[:data][:alerts]).to be_an(Array)
    end

    it "returns recent_activity with today_appointments and recent_services" do
      activity = json_response[:data][:recent_activity]
      expect(activity).to include(:today_appointments, :recent_services)
    end
  end
end
