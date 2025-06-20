require 'rails_helper'

RSpec.describe "Api::V1::Vehicles", type: :request do
  let(:customer) { create(:customer) }
  let(:valid_attributes) { attributes_for(:vehicle, customer_id: customer.id) }
  let(:invalid_attributes) { attributes_for(:vehicle, brand: '', model: '', license_plate: '', year: '', customer_id: nil) }

  describe 'GET /api/v1/vehicles' do
    before do
      create_list(:vehicle, 3, customer: customer)
      get '/api/v1/vehicles'
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
        get '/api/v1/vehicles', params: { customer_id: customer.id }
      end

      it 'filters vehicles by customer' do
        vehicle_customer_ids = json_response[:data][:vehicles].map { |v| v[:customer_id] }
        expect(vehicle_customer_ids).to all(eq(customer.id))
      end
    end

    context 'with search parameter' do
      let!(:searchable_vehicle) { create(:vehicle, license_plate: 'XYZ789', customer: customer) }

      before do
        get '/api/v1/vehicles', params: { search: 'XYZ' }
      end

      it 'filters vehicles by license_plate' do
        vehicle_license_plates = json_response[:data][:vehicles].map { |v| v[:license_plate] }
        expect(vehicle_license_plates).to include('XYZ789')
      end
    end

    context 'with pagination' do
      before do
        create_list(:vehicle, 25, customer: customer)
        get '/api/v1/vehicles', params: { page: 2, per_page: 10 }
      end

      it 'returns correct page' do
        pagination = json_response[:data][:pagination]
        expect(pagination[:current_page]).to eq(2)
        expect(pagination[:per_page]).to eq(10)
      end
    end
  end

  describe 'GET /api/v1/vehicles/:id' do
    let(:vehicle) { create(:vehicle, customer: customer) }

    before do
      get "/api/v1/vehicles/#{vehicle.id}"
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
        get '/api/v1/vehicles/999999'
      end

      it 'returns not found error' do
        expect(response).to have_http_status(:not_found)
        expect(json_response[:success]).to be false
        expect(json_response[:errors]).to include('Vehicle not found')
      end
    end
  end

  describe 'POST /api/v1/vehicles' do
    context 'with valid parameters' do
      it 'creates a new Vehicle' do
        expect {
          post '/api/v1/vehicles', params: { vehicle: valid_attributes }
        }.to change(Vehicle, :count).by(1)
      end

      it 'returns success response' do
        post '/api/v1/vehicles', params: { vehicle: valid_attributes }

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
          post '/api/v1/vehicles', params: { vehicle: invalid_attributes }
        }.not_to change(Vehicle, :count)
      end

      it 'returns error response' do
        post '/api/v1/vehicles', params: { vehicle: invalid_attributes }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response[:success]).to be false
        expect(json_response[:errors]).to be_present
      end
    end

    context 'with duplicate license_plate' do
      let(:existing_vehicle) { create(:vehicle, customer: customer) }

      before { existing_vehicle }

      it 'returns validation error' do
        duplicate_params = valid_attributes.merge(license_plate: existing_vehicle.license_plate)
        post '/api/v1/vehicles', params: { vehicle: duplicate_params }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response[:errors]).to include(match(/license plate.*taken/i))
      end
    end
  end

  describe 'PATCH /api/v1/vehicles/:id' do
    let(:vehicle) { create(:vehicle, customer: customer) }
    let(:new_attributes) { attributes_for(:vehicle, brand: 'Honda', model: 'Civic', year: '2021') }

    context 'with valid parameters' do
      before do
        patch "/api/v1/vehicles/#{vehicle.id}", params: { vehicle: new_attributes }
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
        patch "/api/v1/vehicles/#{vehicle.id}", params: { vehicle: invalid_attributes }
      end

      it 'returns error response' do
        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response[:success]).to be false
      end
    end
  end

  describe 'DELETE /api/v1/vehicles/:id' do
    let!(:vehicle) { create(:vehicle, customer: customer) }

    it 'destroys the vehicle' do
      expect {
        delete "/api/v1/vehicles/#{vehicle.id}"
      }.to change(Vehicle, :count).by(-1)
    end

    it 'returns success response' do
      delete "/api/v1/vehicles/#{vehicle.id}"

      expect(response).to have_http_status(:ok)
      expect(json_response[:success]).to be true
      expect(json_response[:message]).to eq('Vehicle deleted successfully')
    end

    context 'when vehicle not found' do
      before do
        delete '/api/v1/vehicles/999999'
      end

      it 'returns not found error' do
        expect(response).to have_http_status(:not_found)
        expect(json_response[:success]).to be false
      end
    end
  end

  private

  def json_response
    JSON.parse(response.body, symbolize_names: true)
  end
end
