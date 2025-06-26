require 'rails_helper'

RSpec.describe 'Api::V1::Appointments', type: :request do
  include ApiHelper
  let(:user) { create(:user) }
  let(:customer) { create(:customer) }
  let(:vehicle) { create(:vehicle, customer: customer) }
  let(:appointment) { create(:appointment, customer: customer, vehicle: vehicle) }
  let(:valid_attributes) do
    {
      scheduled_at: 1.day.from_now,
      status: 'scheduled',
      notes: 'Servicio de aceite y filtro',
      customer_id: customer.id,
      vehicle_id: vehicle.id
    }
  end

  describe 'GET /api/v1/appointments' do
    before do
      create_list(:appointment, 3, customer: customer, vehicle: vehicle)
    end

    it 'returns a list of appointments' do
      get '/api/v1/appointments', headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)

      expect(json_response['success']).to be true
      expect(json_response['data']).to be_an(Array)
      expect(json_response['data'].length).to eq(3)
      expect(json_response['pagination']).to be_present
    end

    context 'with filters' do
      let(:other_customer) { create(:customer) }
      let(:other_vehicle) { create(:vehicle, customer: other_customer) }
      let!(:other_appointment) { create(:appointment, customer: other_customer, vehicle: other_vehicle) }

      it 'filters by customer_id' do
        get '/api/v1/appointments', params: { customer_id: customer.id }, headers: auth_headers(user)

        json_response = JSON.parse(response.body)
        expect(json_response['data'].length).to eq(3)
        expect(json_response['data'].all? { |app| app['customer']['id'] == customer.id }).to be true
      end

      it 'filters by vehicle_id' do
        get '/api/v1/appointments', params: { vehicle_id: vehicle.id }, headers: auth_headers(user)

        json_response = JSON.parse(response.body)
        expect(json_response['data'].length).to eq(3)
        expect(json_response['data'].all? { |app| app['vehicle']['id'] == vehicle.id }).to be true
      end

      it 'filters by status' do
        get '/api/v1/appointments', params: { status: 'scheduled' }, headers: auth_headers(user)

        json_response = JSON.parse(response.body)
        expect(json_response['data'].all? { |app| app['status'] == 'scheduled' }).to be true
      end

      it 'filters by date range' do
        start_date = Date.current
        end_date = 2.days.from_now.to_date

        get '/api/v1/appointments', params: { start_date: start_date, end_date: end_date }, headers: auth_headers(user)

        json_response = JSON.parse(response.body)
        expect(json_response['data']).to be_present
      end
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        get '/api/v1/appointments'
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/v1/appointments/:id' do
    it 'returns the appointment' do
      get "/api/v1/appointments/#{appointment.id}", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)

      expect(json_response['success']).to be true
      expect(json_response['data']['id']).to eq(appointment.id)
      expect(json_response['data']['customer']['id']).to eq(customer.id)
      expect(json_response['data']['vehicle']['id']).to eq(vehicle.id)
    end

    it 'returns 404 for non-existent appointment' do
      get '/api/v1/appointments/999999', headers: auth_headers(user)

      expect(response).to have_http_status(:not_found)
      json_response = JSON.parse(response.body)
      expect(json_response['success']).to be false
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        get "/api/v1/appointments/#{appointment.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'POST /api/v1/appointments' do
    context 'with valid parameters' do
      it 'creates a new appointment' do
        expect {
          post '/api/v1/appointments', params: { appointment: valid_attributes }, headers: auth_headers(user)
        }.to change(Appointment, :count).by(1)

        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)

        expect(json_response['success']).to be true
        expect(json_response['data']['scheduled_at']).to be_present
        expect(json_response['data']['status']).to eq('scheduled')
      end
    end

    context 'with invalid parameters' do
      it 'returns validation errors' do
        invalid_attributes = valid_attributes.merge(scheduled_at: nil)

        post '/api/v1/appointments', params: { appointment: invalid_attributes }, headers: auth_headers(user)

        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)

        expect(json_response['success']).to be false
        expect(json_response['errors']).to be_present
      end

      it 'validates scheduled_at is in the future' do
        invalid_attributes = valid_attributes.merge(scheduled_at: 1.day.ago)

        post '/api/v1/appointments', params: { appointment: invalid_attributes }, headers: auth_headers(user)

        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)

        expect(json_response['success']).to be false
        expect(json_response['errors']).to include('Scheduled at must be in the future')
      end
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        post '/api/v1/appointments', params: { appointment: valid_attributes }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'PATCH /api/v1/appointments/:id' do
    context 'with valid parameters' do
      it 'updates the appointment' do
        new_notes = 'Servicio completo con alineación'

        patch "/api/v1/appointments/#{appointment.id}",
              params: { appointment: { notes: new_notes } },
              headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response['success']).to be true
        expect(json_response['data']['notes']).to eq(new_notes)
      end
    end

    context 'with invalid parameters' do
      it 'returns validation errors' do
        patch "/api/v1/appointments/#{appointment.id}",
              params: { appointment: { status: 'invalid_status' } },
              headers: auth_headers(user)

        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)

        expect(json_response['success']).to be false
        expect(json_response['errors']).to be_present
      end
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        patch "/api/v1/appointments/#{appointment.id}",
              params: { appointment: { notes: 'test' } }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'DELETE /api/v1/appointments/:id' do
    it 'deletes the appointment' do
      appointment_to_delete = create(:appointment, customer: customer, vehicle: vehicle)

      expect {
        delete "/api/v1/appointments/#{appointment_to_delete.id}", headers: auth_headers(user)
      }.to change(Appointment, :count).by(-1)

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['success']).to be true
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        delete "/api/v1/appointments/#{appointment.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/v1/appointments/upcoming' do
    before do
      create(:appointment, :scheduled, customer: customer, vehicle: vehicle, scheduled_at: 1.day.from_now)
      create(:appointment, :confirmed, customer: customer, vehicle: vehicle, scheduled_at: 2.days.from_now)
      completed_appointment = create(:appointment, :completed, customer: customer, vehicle: vehicle, scheduled_at: 1.day.from_now)
      completed_appointment.update_column(:scheduled_at, 1.day.ago)
    end

    it 'returns only upcoming appointments' do
      get '/api/v1/appointments/upcoming', headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)

      expect(json_response['success']).to be true
      expect(json_response['data']).to be_an(Array)
      expect(json_response['data'].length).to eq(2) # scheduled and confirmed
      expect(json_response['data'].all? { |app| app['scheduled_at'] > Time.current.as_json }).to be true
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        get '/api/v1/appointments/upcoming'
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'PATCH /api/v1/appointments/:id/confirm' do
    it 'confirms the appointment' do
      patch "/api/v1/appointments/#{appointment.id}/confirm", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)

      expect(json_response['success']).to be true
      expect(json_response['data']['status']).to eq('confirmed')
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        patch "/api/v1/appointments/#{appointment.id}/confirm"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'PATCH /api/v1/appointments/:id/complete' do
    it 'completes the appointment' do
      patch "/api/v1/appointments/#{appointment.id}/complete", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)

      expect(json_response['success']).to be true
      expect(json_response['data']['status']).to eq('completed')
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        patch "/api/v1/appointments/#{appointment.id}/complete"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'PATCH /api/v1/appointments/:id/cancel' do
    it 'cancels the appointment' do
      patch "/api/v1/appointments/#{appointment.id}/cancel", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)

      expect(json_response['success']).to be true
      expect(json_response['data']['status']).to eq('cancelled')
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        patch "/api/v1/appointments/#{appointment.id}/cancel"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'nested routes' do
    describe 'GET /api/v1/customers/:customer_id/appointments' do
      before do
        create_list(:appointment, 2, customer: customer, vehicle: vehicle)
        other_customer = create(:customer)
        other_vehicle = create(:vehicle, customer: other_customer)
        create(:appointment, customer: other_customer, vehicle: other_vehicle)
      end

      it 'returns appointments for specific customer' do
        get "/api/v1/customers/#{customer.id}/appointments", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response['success']).to be true
        expect(json_response['data'].length).to eq(2) # 2 creados para este customer
        expect(json_response['data'].all? { |app| app['customer']['id'] == customer.id }).to be true
      end
    end

    describe 'GET /api/v1/vehicles/:vehicle_id/appointments' do
      before do
        create_list(:appointment, 2, customer: customer, vehicle: vehicle)
        other_vehicle = create(:vehicle, customer: customer)
        create(:appointment, customer: customer, vehicle: other_vehicle)
      end

      it 'returns appointments for specific vehicle' do
        get "/api/v1/vehicles/#{vehicle.id}/appointments", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response['success']).to be true
        expect(json_response['data'].length).to eq(2) # 2 creados para este vehicle
        expect(json_response['data'].all? { |app| app['vehicle']['id'] == vehicle.id }).to be true
      end
    end
  end
end
