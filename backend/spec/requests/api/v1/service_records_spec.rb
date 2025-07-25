require 'rails_helper'

RSpec.describe "Api::V1::ServiceRecords", type: :request do
  include ApiHelper
  let(:user) { create(:user) }
  let(:customer) { create(:customer) }
  let(:vehicle) { create(:vehicle, customer: customer) }
  let(:service_record) { create(:service_record, customer: customer, vehicle: vehicle) }
  let(:valid_attributes) { attributes_for(:service_record, customer_id: customer.id, vehicle_id: vehicle.id) }
  let(:invalid_attributes) { { service_date: nil, total_amount: nil, mileage: nil } }

  describe "GET /api/v1/service_records" do
    before do
      create_list(:service_record, 3, customer: customer, vehicle: vehicle)
    end

    it "returns a successful response" do
      get "/api/v1/service_records", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
    end

    it "returns all service records" do
      get "/api/v1/service_records", headers: auth_headers(user)
      json_response = JSON.parse(response.body)
      expect(json_response["success"]).to be true
      expect(json_response["data"]["service_records"].length).to eq(3)
    end

    it "follows API response pattern" do
      get "/api/v1/service_records", headers: auth_headers(user)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key("success")
      expect(json_response).to have_key("data")
    end

    context "with customer_id filter" do
      let(:other_customer) { create(:customer) }
      let(:other_vehicle) { create(:vehicle, customer: other_customer) }

      before do
        create(:service_record, customer: other_customer, vehicle: other_vehicle)
      end

      it "filters by customer_id" do
        get "/api/v1/service_records", params: { customer_id: customer.id }, headers: auth_headers(user)
        json_response = JSON.parse(response.body)
        expect(json_response["data"]["service_records"].length).to eq(3)
      end
    end

    context "with vehicle_id filter" do
      let(:other_vehicle) { create(:vehicle, customer: customer) }

      before do
        create(:service_record, customer: customer, vehicle: other_vehicle)
      end

      it "filters by vehicle_id" do
        get "/api/v1/service_records", params: { vehicle_id: vehicle.id }, headers: auth_headers(user)
        json_response = JSON.parse(response.body)
        expect(json_response["data"]["service_records"].length).to eq(3)
      end
    end

    context "with date range filter" do
      it "filters by date range" do
        start_date = 1.week.ago.to_date
        end_date = 1.week.from_now.to_date
        get "/api/v1/service_records", params: { start_date: start_date, end_date: end_date }, headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        get "/api/v1/service_records"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/service_records/:id" do
    it "returns a successful response" do
      get "/api/v1/service_records/#{service_record.id}", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
    end

    it "returns the service record data" do
      get "/api/v1/service_records/#{service_record.id}", headers: auth_headers(user)
      json_response = JSON.parse(response.body)
      expect(json_response["success"]).to be true
      expect(json_response["data"]["id"]).to eq(service_record.id)
    end

    context "when service record not found" do
      it "returns not found error" do
        get "/api/v1/service_records/999999", headers: auth_headers(user)
        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response["success"]).to be false
        expect(json_response["message"]).to eq("Service record not found")
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        get "/api/v1/service_records/#{service_record.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/v1/service_records" do
    context "with valid parameters" do
      it "creates a new ServiceRecord" do
        expect {
          post "/api/v1/service_records", params: { service_record: valid_attributes }, headers: auth_headers(user)
        }.to change(ServiceRecord, :count).by(1)
      end

      it "returns a created response" do
        post "/api/v1/service_records", params: { service_record: valid_attributes }, headers: auth_headers(user)
        expect(response).to have_http_status(:created)
      end

      it "returns success response" do
        post "/api/v1/service_records", params: { service_record: valid_attributes }, headers: auth_headers(user)
        json_response = JSON.parse(response.body)
        expect(json_response["success"]).to be true
        expect(json_response["message"]).to eq("Service record created successfully")
      end
    end

    context "with invalid parameters" do
      it "does not create a new ServiceRecord" do
        expect {
          post "/api/v1/service_records", params: { service_record: invalid_attributes }, headers: auth_headers(user)
        }.not_to change(ServiceRecord, :count)
      end

      it "returns an unprocessable entity response" do
        post "/api/v1/service_records", params: { service_record: invalid_attributes }, headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "returns error response" do
        post "/api/v1/service_records", params: { service_record: invalid_attributes }, headers: auth_headers(user)
        json_response = JSON.parse(response.body)
        expect(json_response["success"]).to be false
        expect(json_response["message"]).to eq("Failed to create service record")
      end
    end

    context "with customer_id parameter" do
      let(:other_customer) { create(:customer) }

      it "sets the customer when customer_id is provided" do
        post "/api/v1/service_records", params: {
          service_record: valid_attributes.merge(customer_id: other_customer.id),
          customer_id: other_customer.id
        }, headers: auth_headers(user)
        expect(response).to have_http_status(:created)
      end

      context "when customer not found" do
        it "returns not found error" do
          post "/api/v1/service_records", params: {
            service_record: valid_attributes,
            customer_id: 999999
          }, headers: auth_headers(user)
          expect(response).to have_http_status(:not_found)
          json_response = JSON.parse(response.body)
          expect(json_response["message"]).to eq("Customer not found")
        end
      end
    end

    context "with vehicle_id parameter" do
      let(:other_vehicle) { create(:vehicle, customer: customer) }

      it "sets the vehicle when vehicle_id is provided" do
        post "/api/v1/service_records", params: {
          service_record: valid_attributes.merge(vehicle_id: other_vehicle.id),
          vehicle_id: other_vehicle.id
        }, headers: auth_headers(user)
        expect(response).to have_http_status(:created)
      end

      context "when vehicle not found" do
        it "returns not found error" do
          post "/api/v1/service_records", params: {
            service_record: valid_attributes,
            vehicle_id: 999999
          }, headers: auth_headers(user)
          expect(response).to have_http_status(:not_found)
          json_response = JSON.parse(response.body)
          expect(json_response["message"]).to eq("Vehicle not found")
        end
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        post "/api/v1/service_records", params: { service_record: valid_attributes }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PATCH/PUT /api/v1/service_records/:id" do
    context "with valid parameters" do
      let(:new_attributes) { { notes: "Updated notes", total_amount: 150.50 } }

      it "updates the requested service record" do
        patch "/api/v1/service_records/#{service_record.id}", params: { service_record: new_attributes }, headers: auth_headers(user)
        service_record.reload
        expect(service_record.notes).to eq("Updated notes")
        expect(service_record.total_amount).to eq(150.50)
      end

      it "returns a successful response" do
        patch "/api/v1/service_records/#{service_record.id}", params: { service_record: new_attributes }, headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response["success"]).to be true
        expect(json_response["message"]).to eq("Service record updated successfully")
      end
    end

    context "with invalid parameters" do
      it "returns error response" do
        patch "/api/v1/service_records/#{service_record.id}", params: { service_record: invalid_attributes }, headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response["success"]).to be false
        expect(json_response["errors"]).to be_present
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        patch "/api/v1/service_records/#{service_record.id}", params: { service_record: { notes: "test" } }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/service_records/:id" do
    let!(:service_record_to_delete) { create(:service_record, customer: customer, vehicle: vehicle) }

    it "destroys the requested service record" do
      expect {
        delete "/api/v1/service_records/#{service_record_to_delete.id}", headers: auth_headers(user)
      }.to change(ServiceRecord, :count).by(-1)
    end

    it "returns a successful response" do
      delete "/api/v1/service_records/#{service_record_to_delete.id}", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response["success"]).to be true
      expect(json_response["message"]).to eq("Service record deleted successfully")
    end

    context "without authentication" do
      it "returns unauthorized" do
        delete "/api/v1/service_records/#{service_record_to_delete.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/service_records/overdue" do
    before do
      @overdue_record = create(:service_record, :overdue, customer: customer, vehicle: vehicle)
      @upcoming_record = create(:service_record, :upcoming, customer: customer, vehicle: vehicle)
    end

    it "returns only overdue service records" do
      get "/api/v1/service_records/overdue", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response["success"]).to be true
      expect(json_response["data"]).to be_an(Array)
      expect(@overdue_record.next_service_date).not_to eq(@upcoming_record.next_service_date)
      overdue_count = ServiceRecord.where("next_service_date < ?", Date.current).count
      expect(json_response["data"].length).to eq(overdue_count)
    end

    context "without authentication" do
      it "returns unauthorized" do
        get "/api/v1/service_records/overdue"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/service_records/upcoming" do
    before do
      @overdue_record = create(:service_record, :overdue, customer: customer, vehicle: vehicle)
      @upcoming_record = create(:service_record, :upcoming, customer: customer, vehicle: vehicle)
    end

    it "returns only upcoming service records" do
      get "/api/v1/service_records/upcoming", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response["success"]).to be true
      expect(json_response["data"]).to be_an(Array)
      expect(@overdue_record.next_service_date).not_to eq(@upcoming_record.next_service_date)
      upcoming_count = ServiceRecord.where("next_service_date BETWEEN ? AND ?", Date.current, Date.current + 1.month).count
      expect(json_response["data"].length).to eq(upcoming_count)
    end

    context "without authentication" do
      it "returns unauthorized" do
        get "/api/v1/service_records/upcoming"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/service_records/statistics" do
    before do
      create_list(:service_record, 5, customer: customer, vehicle: vehicle)
    end

    it "returns service record statistics" do
      get "/api/v1/service_records/statistics", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response["success"]).to be true
      expect(json_response["data"]).to have_key("total_records")
      expect(json_response["data"]).to have_key("total_amount")
    end

    context "without authentication" do
      it "returns unauthorized" do
        get "/api/v1/service_records/statistics"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "nested routes" do
    describe "GET /api/v1/customers/:customer_id/service_records" do
      before do
        create_list(:service_record, 2, customer: customer, vehicle: vehicle)
        other_customer = create(:customer)
        other_vehicle = create(:vehicle, customer: other_customer)
        create(:service_record, customer: other_customer, vehicle: other_vehicle)
      end

      it "returns service records for specific customer" do
        get "/api/v1/customers/#{customer.id}/service_records", headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response["data"].length).to eq(2)
      end
    end

    describe "GET /api/v1/vehicles/:vehicle_id/service_records" do
      before do
        create_list(:service_record, 2, customer: customer, vehicle: vehicle)
        other_vehicle = create(:vehicle, customer: customer)
        create(:service_record, customer: customer, vehicle: other_vehicle)
      end

      it "returns service records for specific vehicle" do
        get "/api/v1/vehicles/#{vehicle.id}/service_records", headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response["data"].length).to eq(2)
      end
    end
  end
end
