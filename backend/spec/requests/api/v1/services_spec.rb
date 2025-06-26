require 'rails_helper'

RSpec.describe "Api::V1::Services", type: :request do
  include ApiHelper
  let(:user) { create(:user) }
  let(:valid_attributes) { attributes_for(:service, :oil_change) }

  let(:invalid_attributes) do
    {
      name: "",
      base_price: -100
    }
  end

  let(:valid_headers) do
    { 'Content-Type' => 'application/json' }
  end

  describe "GET /api/v1/services" do
    let!(:services) { create_list(:service, 5) }

    it "returns success response" do
      get api_v1_services_url, headers: valid_headers.merge(auth_headers(user))
      expect(response).to have_http_status(:ok)
    end

    it "returns services data with Blueprint serialization" do
      get api_v1_services_url, headers: valid_headers.merge(auth_headers(user))

      parsed_response = JSON.parse(response.body, symbolize_names: true)

      expect(parsed_response[:success]).to be true
      expect(parsed_response[:data]).to have_key(:services)
      expect(parsed_response[:data][:services]).to be_an(Array)
      expect(parsed_response[:data][:services].count).to eq(5)

      # Verify serialized structure
      service_data = parsed_response[:data][:services].first
      expect(service_data).to have_key(:id)
      expect(service_data).to have_key(:name)
      expect(service_data).to have_key(:description)
      expect(service_data).to have_key(:base_price)
    end

    context "with search parameter" do
      let!(:oil_service) { create(:service, :oil_change) }
      let!(:brake_service) { create(:service, :brake_service) }

      it "filters services by name" do
        get api_v1_services_url, params: { search: "oil" }, headers: valid_headers.merge(auth_headers(user))

        parsed_response = JSON.parse(response.body, symbolize_names: true)
        services_data = parsed_response[:data][:services]

        expect(services_data.count).to eq(1)
        expect(services_data.first[:name]).to eq("Oil Change")
      end
    end

    context "with price range parameters" do
      let!(:cheap_service) { create(:service, :cheap) }
      let!(:expensive_service) { create(:service, :expensive) }

      it "filters services by price range" do
        get api_v1_services_url, params: { min_price: 1000, max_price: 10000 }, headers: valid_headers.merge(auth_headers(user))

        parsed_response = JSON.parse(response.body, symbolize_names: true)
        services_data = parsed_response[:data][:services]

        services_data.each do |service|
          price = service[:base_price].to_i
          expect(price).to be_between(1000, 10000)
        end
      end
    end

    context "with pagination" do
      let!(:services) { create_list(:service, 25) }

      it "paginates results" do
        get api_v1_services_url, params: { page: 1, per_page: 10 }, headers: valid_headers.merge(auth_headers(user))

        parsed_response = JSON.parse(response.body, symbolize_names: true)

        expect(parsed_response[:success]).to be true
        expect(parsed_response[:data][:services].count).to eq(10)
      end

      it "returns second page correctly" do
        get api_v1_services_url, params: { page: 2, per_page: 10 }, headers: valid_headers.merge(auth_headers(user))

        parsed_response = JSON.parse(response.body, symbolize_names: true)

        expect(parsed_response[:success]).to be true
        expect(parsed_response[:data][:services].count).to eq(10)
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        get api_v1_services_url, headers: valid_headers
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/services/:id" do
    let!(:service) { create(:service, :oil_change) }

    context "when service exists" do
      it "returns success response" do
        get api_v1_service_url(service), headers: valid_headers.merge(auth_headers(user))
        expect(response).to have_http_status(:ok)
      end

      it "returns service data" do
        get api_v1_service_url(service), headers: valid_headers.merge(auth_headers(user))

        parsed_response = JSON.parse(response.body, symbolize_names: true)

        expect(parsed_response[:success]).to be true
        expect(parsed_response[:data][:id]).to eq(service.id)
        expect(parsed_response[:data][:name]).to eq(service.name)
        expect(parsed_response[:data][:description]).to eq(service.description)
        expect(parsed_response[:data][:base_price]).to eq(service.base_price.to_s)
      end
    end

    context "when service doesn't exist" do
      it "returns not found status" do
        get api_v1_service_url(999999), headers: valid_headers.merge(auth_headers(user))
        expect(response).to have_http_status(:not_found)
      end

      it "returns error message" do
        get api_v1_service_url(999999), headers: valid_headers.merge(auth_headers(user))

        parsed_response = JSON.parse(response.body, symbolize_names: true)

        expect(parsed_response[:success]).to be false
        expect(parsed_response[:message]).to eq("Service not found")
        expect(parsed_response[:errors]).to include("Service not found")
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        get api_v1_service_url(service), headers: valid_headers
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/v1/services" do
    context "with valid parameters" do
      it "creates a new service" do
        expect {
          post api_v1_services_url,
               params: { service: valid_attributes }.to_json,
               headers: valid_headers.merge(auth_headers(user))
        }.to change(Service, :count).by(1)
      end

      it "returns success status" do
        post api_v1_services_url,
             params: { service: valid_attributes }.to_json,
             headers: valid_headers.merge(auth_headers(user))
        expect(response).to have_http_status(:created)
      end

      it "returns created service data" do
        post api_v1_services_url,
             params: { service: valid_attributes }.to_json,
             headers: valid_headers.merge(auth_headers(user))

        parsed_response = JSON.parse(response.body, symbolize_names: true)

        expect(parsed_response[:success]).to be true
        expect(parsed_response[:data][:name]).to eq(valid_attributes[:name])
        expect(parsed_response[:data][:description]).to eq(valid_attributes[:description])
        expect(parsed_response[:data][:base_price]).to eq("#{valid_attributes[:base_price]}.0")
        expect(parsed_response[:message]).to eq("Service created successfully")
      end
    end

    context "with invalid parameters" do
      it "does not create a new service" do
        expect {
          post api_v1_services_url,
               params: { service: invalid_attributes }.to_json,
               headers: valid_headers.merge(auth_headers(user))
        }.to change(Service, :count).by(0)
      end

      it "returns unprocessable entity status" do
        post api_v1_services_url,
             params: { service: invalid_attributes }.to_json,
             headers: valid_headers.merge(auth_headers(user))
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "returns validation errors" do
        post api_v1_services_url,
             params: { service: invalid_attributes }.to_json,
             headers: valid_headers.merge(auth_headers(user))

        parsed_response = JSON.parse(response.body, symbolize_names: true)

        expect(parsed_response[:success]).to be false
        expect(parsed_response[:errors]).to be_an(Array)
        expect(parsed_response[:errors]).to include("Name can't be blank")
        expect(parsed_response[:errors]).to include("Base price must be greater than 0")
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        post api_v1_services_url,
             params: { service: valid_attributes }.to_json,
             headers: valid_headers
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PATCH /api/v1/services/:id" do
    let!(:service) { create(:service, :oil_change) }
    let(:new_attributes) { { name: "Updated Oil Change", base_price: 15000 } }

    context "with valid parameters" do
      it "updates the service" do
        patch api_v1_service_url(service),
              params: { service: new_attributes }.to_json,
              headers: valid_headers.merge(auth_headers(user))

        service.reload
        expect(service.name).to eq("Updated Oil Change")
        expect(service.base_price).to eq(15000)
      end

      it "returns success response" do
        patch api_v1_service_url(service),
              params: { service: new_attributes }.to_json,
              headers: valid_headers.merge(auth_headers(user))

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body, symbolize_names: true)
        expect(parsed_response[:success]).to be true
        expect(parsed_response[:message]).to eq("Service updated successfully")
      end
    end

    context "with invalid parameters" do
      it "returns error response" do
        patch api_v1_service_url(service),
              params: { service: invalid_attributes }.to_json,
              headers: valid_headers.merge(auth_headers(user))

        expect(response).to have_http_status(:unprocessable_entity)
        parsed_response = JSON.parse(response.body, symbolize_names: true)
        expect(parsed_response[:success]).to be false
        expect(parsed_response[:errors]).to be_present
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        patch api_v1_service_url(service),
              params: { service: new_attributes }.to_json,
              headers: valid_headers
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/services/:id" do
    let!(:service) { create(:service, :oil_change) }

    context "when service can be deleted" do
      it "deletes the service" do
        expect {
          delete api_v1_service_url(service), headers: valid_headers.merge(auth_headers(user))
        }.to change(Service, :count).by(-1)
      end

      it "returns success response" do
        delete api_v1_service_url(service), headers: valid_headers.merge(auth_headers(user))

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body, symbolize_names: true)
        expect(parsed_response[:success]).to be true
        expect(parsed_response[:message]).to eq("Service deleted successfully")
      end
    end

    context "when service has associated records" do
      let!(:service_record) { create(:service_record) }
      let!(:service_record_service) do
        create(:service_record_service, service: service, service_record: service_record)
      end

      it "does not delete the service" do
        expect {
          delete api_v1_service_url(service), headers: valid_headers.merge(auth_headers(user))
        }.not_to change(Service, :count)
      end

      it "returns error response" do
        delete api_v1_service_url(service), headers: valid_headers.merge(auth_headers(user))

        expect(response).to have_http_status(:unprocessable_entity)
        parsed_response = JSON.parse(response.body, symbolize_names: true)
        expect(parsed_response[:success]).to be false
        expect(parsed_response[:errors]).to include("Cannot delete service with associated records")
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        delete api_v1_service_url(service), headers: valid_headers
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
