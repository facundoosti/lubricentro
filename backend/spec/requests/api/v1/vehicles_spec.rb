require 'rails_helper'

RSpec.describe "Api::V1::Vehicles", type: :request do
  include ApiHelper
  let(:user) { create(:user) }
  let(:customer) { create(:customer) }
  let(:valid_attributes) { attributes_for(:vehicle, customer_id: customer.id) }
  let(:invalid_attributes) { attributes_for(:vehicle, brand: '', model: '', license_plate: '', year: '', customer_id: nil) }

  describe 'GET /api/v1/vehicles' do
    before do
      create_list(:vehicle, 3, customer: customer)
      get '/api/v1/vehicles', headers: auth_headers(user)
    end

    it 'returns successful response' do
      expect(response).to have_http_status(:ok)
    end

    it 'returns all vehicles' do
      expect(json_response[:data][:vehicles].length).to eq(3)
    end

    it 'follows API response pattern' do
      expect(json_response).to include(
        success: true,
        data: hash_including(:vehicles, :pagination)
      )
    end

    it 'includes pagination metadata' do
      pagination = json_response[:data][:pagination]
      expect(pagination).to include(
        :current_page, :per_page, :total_count, :total_pages
      )
    end

    it 'includes customer name in vehicle data' do
      vehicle_data = json_response[:data][:vehicles].first
      expect(vehicle_data).to include(:customer_name)
    end

    context 'with customer_id filter' do
      let(:other_customer) { create(:customer) }
      let!(:other_vehicle) { create(:vehicle, customer: other_customer) }

      before do
        get '/api/v1/vehicles', params: { customer_id: customer.id }, headers: auth_headers(user)
      end

      it 'filters vehicles by customer' do
        vehicle_customer_ids = json_response[:data][:vehicles].map { |v| v[:customer_id] }
        expect(vehicle_customer_ids).to all(eq(customer.id))
      end
    end

    context 'with customer_id filter and service records' do
      let(:vehicle) { create(:vehicle, customer: customer) }

      before do
        create(:service_record, vehicle: vehicle, customer: customer, service_date: Date.new(2026, 3, 10), mileage: 45_000)
        create(:service_record, vehicle: vehicle, customer: customer, service_date: Date.new(2026, 8, 15), mileage: 52_000)
        get '/api/v1/vehicles', params: { customer_id: customer.id }, headers: auth_headers(user)
      end

      it 'includes the last service date and mileage' do
        data = json_response[:data][:vehicles].find { |v| v[:id] == vehicle.id }
        expect(data).to include(last_service_date: '2026-08-15', last_mileage: 52_000)
      end

      it 'returns nulls for vehicles without service records' do
        data = json_response[:data][:vehicles].find { |v| v[:id] != vehicle.id }
        expect(data).to include(last_service_date: nil, last_mileage: nil)
      end
    end

    context 'with customer_id filter (N+1)' do
      def query_count
        count = 0
        counter = ->(*, payload) { count += 1 unless payload[:name] == 'SCHEMA' || payload[:cached] }
        ActiveSupport::Notifications.subscribed(counter, 'sql.active_record') do
          get '/api/v1/vehicles', params: { customer_id: customer.id }, headers: auth_headers(user)
        end
        count
      end

      def add_vehicle_with_services
        vehicle = create(:vehicle, customer: customer)
        create_list(:service_record, 2, vehicle: vehicle, customer: customer)
      end

      it 'does not grow the number of queries with the number of vehicles' do
        add_vehicle_with_services
        query_count # calienta caches de autenticación
        baseline = query_count
        4.times { add_vehicle_with_services }
        expect(query_count).to eq(baseline)
      end
    end

    context 'with license_plate filter' do
      let(:owner) { create(:customer, name: 'María Gómez') }
      let!(:vehicle) { create(:vehicle, license_plate: 'AB123CD', customer: owner) }

      before do
        create(:vehicle, license_plate: 'AB123CE', customer: customer)
        get '/api/v1/vehicles', params: { license_plate: 'ab 123 cd' }, headers: auth_headers(user)
      end

      it 'returns only the exact plate with its owner' do
        vehicles = json_response[:data][:vehicles]
        expect(vehicles.map { |v| v[:id] }).to eq([ vehicle.id ])
        expect(vehicles.first[:customer]).to include(id: owner.id, name: 'María Gómez')
      end
    end

    context 'with search parameter' do
      let!(:searchable_vehicle) { create(:vehicle, license_plate: 'XYZ789', customer: customer) }

      before do
        get '/api/v1/vehicles', params: { search: 'XYZ' }, headers: auth_headers(user)
      end

      it 'filters vehicles by license_plate' do
        vehicle_license_plates = json_response[:data][:vehicles].map { |v| v[:license_plate] }
        expect(vehicle_license_plates).to include('XYZ789')
      end
    end

    context 'with pagination' do
      before do
        create_list(:vehicle, 25, customer: customer)
        get '/api/v1/vehicles', params: { page: 2, per_page: 10 }, headers: auth_headers(user)
      end

      it 'returns correct page' do
        pagination = json_response[:data][:pagination]
        expect(pagination[:current_page]).to eq(2)
        expect(pagination[:per_page]).to eq(10)
      end
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        get '/api/v1/vehicles'
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/v1/vehicles/:id' do
    let(:vehicle) { create(:vehicle, customer: customer) }

    before do
      get "/api/v1/vehicles/#{vehicle.id}", headers: auth_headers(user)
    end

    it 'returns successful response' do
      expect(response).to have_http_status(:ok)
    end

    it 'returns vehicle with customer details' do
      vehicle_data = json_response[:data]
      expect(vehicle_data).to include(
        :id, :brand, :model, :license_plate, :year, :customer_id, :customer
      )
      expect(vehicle_data[:customer]).to include(:id, :name, :phone, :email)
    end

    context 'when vehicle not found' do
      before do
        get '/api/v1/vehicles/999999', headers: auth_headers(user)
      end

      it 'returns not found error' do
        expect(response).to have_http_status(:not_found)
        expect(json_response[:success]).to be false
        expect(json_response[:errors]).to include('Vehicle not found')
      end
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        get "/api/v1/vehicles/#{vehicle.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'POST /api/v1/vehicles' do
    context 'with valid parameters' do
      it 'creates a new Vehicle' do
        expect {
          post '/api/v1/vehicles', params: { vehicle: valid_attributes }, headers: auth_headers(user)
        }.to change(Vehicle, :count).by(1)
      end

      it 'returns success response' do
        post '/api/v1/vehicles', params: { vehicle: valid_attributes }, headers: auth_headers(user)

        expect(response).to have_http_status(:created)
        expect(json_response[:success]).to be true
        expect(json_response[:message]).to eq('Vehicle created successfully')
        expect(json_response[:data][:brand]).to eq(valid_attributes[:brand])
        expect(json_response[:data][:license_plate]).to eq(valid_attributes[:license_plate])
      end
    end

    context 'with invalid parameters' do
      it 'does not create a new Vehicle' do
        expect {
          post '/api/v1/vehicles', params: { vehicle: invalid_attributes }, headers: auth_headers(user)
        }.not_to change(Vehicle, :count)
      end

      it 'returns error response' do
        post '/api/v1/vehicles', params: { vehicle: invalid_attributes }, headers: auth_headers(user)

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:success]).to be false
        expect(json_response[:errors]).to be_present
      end
    end

    context 'with a year out of range' do
      it 'returns 422 with a year error' do
        post '/api/v1/vehicles', params: { vehicle: valid_attributes.merge(year: '1900') }, headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors].join).to match(/Year/)
      end
    end

    context 'with duplicate license_plate' do
      let(:existing_vehicle) { create(:vehicle, customer: customer) }

      before { existing_vehicle }

      it 'returns validation error' do
        duplicate_params = valid_attributes.merge(license_plate: existing_vehicle.license_plate)
        post '/api/v1/vehicles', params: { vehicle: duplicate_params }, headers: auth_headers(user)

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to include(match(/license plate.*taken/i))
      end
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        post '/api/v1/vehicles', params: { vehicle: valid_attributes }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'PATCH /api/v1/vehicles/:id' do
    let(:vehicle) { create(:vehicle, customer: customer) }
    let(:new_attributes) { attributes_for(:vehicle, brand: 'Honda', model: 'Civic', year: '2021') }

    context 'with valid parameters' do
      before do
        patch "/api/v1/vehicles/#{vehicle.id}", params: { vehicle: new_attributes }, headers: auth_headers(user)
      end

      it 'updates the vehicle' do
        vehicle.reload
        expect(vehicle.brand).to eq('Honda')
        expect(vehicle.model).to eq('Civic')
        expect(vehicle.year).to eq('2021')
      end

      it 'returns success response' do
        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
        expect(json_response[:message]).to eq('Vehicle updated successfully')
      end
    end

    context 'with invalid parameters' do
      before do
        patch "/api/v1/vehicles/#{vehicle.id}", params: { vehicle: invalid_attributes }, headers: auth_headers(user)
      end

      it 'returns error response' do
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:success]).to be false
      end
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        patch "/api/v1/vehicles/#{vehicle.id}", params: { vehicle: new_attributes }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'DELETE /api/v1/vehicles/:id' do
    let!(:vehicle) { create(:vehicle, customer: customer) }

    it 'destroys the vehicle' do
      expect {
        delete "/api/v1/vehicles/#{vehicle.id}", headers: auth_headers(user)
      }.to change(Vehicle, :count).by(-1)
    end

    it 'returns success response' do
      delete "/api/v1/vehicles/#{vehicle.id}", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      expect(json_response[:success]).to be true
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        delete "/api/v1/vehicles/#{vehicle.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/v1/vehicles/lookup' do
    let(:plate) { "ABC123" }

    context 'when vehicle is found' do
      before do
        allow(VehicleLookupService).to receive(:new).and_return(
          instance_double(VehicleLookupService, call: { status: "found", make: "Toyota", model: "Corolla", year: 2020, plate: plate, province: "Buenos Aires" })
        )
        get "/api/v1/vehicles/lookup", params: { plate: plate }, headers: auth_headers(user)
      end

      it 'returns ok with vehicle data' do
        expect(response).to have_http_status(:ok)
        expect(json_response[:data][:vehicle][:make]).to eq("Toyota")
      end
    end

    context 'when vehicle is not found' do
      before do
        allow(VehicleLookupService).to receive(:new).and_return(
          instance_double(VehicleLookupService, call: { status: "not_found" })
        )
        get "/api/v1/vehicles/lookup", params: { plate: plate }, headers: auth_headers(user)
      end

      it 'returns not_found' do
        expect(response).to have_http_status(:not_found)
      end
    end

    context 'when the lookup service returns an error' do
      before do
        allow(VehicleLookupService).to receive(:new).and_return(
          instance_double(VehicleLookupService, call: { status: "error", message: "API key inválida" })
        )
        get "/api/v1/vehicles/lookup", params: { plate: plate }, headers: auth_headers(user)
      end

      it 'returns service_unavailable' do
        expect(response).to have_http_status(:service_unavailable)
      end
    end

    context 'when plate is too short' do
      before { get "/api/v1/vehicles/lookup", params: { plate: "AB1" }, headers: auth_headers(user) }

      it 'returns bad_request' do
        expect(response).to have_http_status(:bad_request)
      end
    end

    context 'with view=with_customer filter' do
      before { create_list(:vehicle, 2, customer: customer) }

      it 'returns vehicles with customer data' do
        get '/api/v1/vehicles', params: { view: 'with_customer' }, headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
        expect(json_response[:data][:vehicles].first).to include(:customer)
      end
    end

    context 'with brand filter' do
      let!(:honda_vehicle) { create(:vehicle, brand: 'Honda', customer: customer) }

      before { get '/api/v1/vehicles', params: { brand: 'Honda' }, headers: auth_headers(user) }

      it 'filters by brand' do
        brands = json_response[:data][:vehicles].map { |v| v[:brand] }
        expect(brands).to all(eq('Honda'))
      end
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        get "/api/v1/vehicles/lookup", params: { plate: plate }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  private

  def json_response
    JSON.parse(response.body, symbolize_names: true)
  end
end
