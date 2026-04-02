require 'rails_helper'

RSpec.describe "Api::V1::ServiceReminders", type: :request do
  include ApiHelper

  let(:user) { create(:user) }

  describe "GET /api/v1/service_reminders" do
    let!(:pending_reminder) { create(:service_reminder) }
    let!(:sent_reminder)    { create(:service_reminder, :sent) }
    let!(:failed_reminder)  { create(:service_reminder, :failed) }

    context "without filters" do
      before { get "/api/v1/service_reminders", headers: auth_headers(user) }

      it "returns 200" do
        expect(response).to have_http_status(:ok)
      end

      it "returns all reminders" do
        expect(json_response[:data][:service_reminders].length).to eq(3)
      end

      it "follows API response pattern" do
        expect(json_response).to include(success: true)
      end
    end

    context "with status filter" do
      before { get "/api/v1/service_reminders", params: { status: "pending" }, headers: auth_headers(user) }

      it "returns only pending reminders" do
        ids = json_response[:data][:service_reminders].map { |r| r[:id] }
        expect(ids).to include(pending_reminder.id)
        expect(ids).not_to include(sent_reminder.id)
      end
    end

    context "with search filter" do
      let(:customer) { create(:customer, name: "Juan Gomez") }
      let(:vehicle)  { create(:vehicle, customer: customer, license_plate: "AA001BB") }
      let(:sr)       { create(:service_record, customer: customer, vehicle: vehicle) }
      let!(:target)  { create(:service_reminder, customer: customer, vehicle: vehicle, service_record: sr) }

      it "finds by customer name" do
        get "/api/v1/service_reminders", params: { search: "Juan" }, headers: auth_headers(user)
        ids = json_response[:data][:service_reminders].map { |r| r[:id] }
        expect(ids).to include(target.id)
      end

      it "finds by license plate" do
        get "/api/v1/service_reminders", params: { search: "AA001BB" }, headers: auth_headers(user)
        ids = json_response[:data][:service_reminders].map { |r| r[:id] }
        expect(ids).to include(target.id)
      end
    end

    context "with date range filter" do
      before do
        get "/api/v1/service_reminders",
          params: { start_date: 1.week.ago.to_date.iso8601, end_date: Date.current.iso8601 },
          headers: auth_headers(user)
      end

      it "returns reminders in range" do
        expect(json_response[:data][:service_reminders].length).to be >= 1
      end
    end
  end

  describe "GET /api/v1/service_reminders/statistics" do
    before do
      create(:service_reminder, :sent)
      create(:service_reminder)
      create(:service_reminder, :failed)
      get "/api/v1/service_reminders/statistics", headers: auth_headers(user)
    end

    it "returns 200" do
      expect(response).to have_http_status(:ok)
    end

    it "returns statistics" do
      data = json_response[:data]
      expect(data).to include(:sent_this_month, :pending, :failed)
    end

    it "counts correctly" do
      data = json_response[:data]
      expect(data[:pending]).to eq(1)
      expect(data[:failed]).to eq(1)
    end
  end
end
