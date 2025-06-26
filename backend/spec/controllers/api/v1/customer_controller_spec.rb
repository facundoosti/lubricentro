require 'rails_helper'

RSpec.describe Api::V1::CustomersController, type: :controller do
  include ApiHelper
  let(:user) { create(:user) }
  let(:valid_attributes) { attributes_for(:customer) }
  let(:invalid_attributes) { attributes_for(:customer, name: '') }

  describe 'GET #index' do
    before do
      create_list(:customer, 3)
      request.headers.merge!(auth_headers(user))
      get :index
    end

    it 'returns successful response' do
      expect(response).to have_http_status(:ok)
    end

    it 'returns all customers' do
      expect(json_response[:data][:customers].length).to eq(3)
    end

    it 'follows API response pattern' do
      expect(json_response).to include(
        success: true,
        data: hash_including(:customers, :pagination)
      )
    end

    it 'includes pagination metadata' do
      pagination = json_response[:data][:pagination]
      expect(pagination).to include(
        :current_page, :per_page, :total_count, :total_pages
      )
    end

    context 'with search parameter' do
      let!(:searchable_customer) { create(:customer, name: 'María González') }

      before do
        request.headers.merge!(auth_headers(user))
        get :index, params: { search: 'María' }
      end

      it 'filters customers by name' do
        customer_names = json_response[:data][:customers].map { |c| c[:name] }
        expect(customer_names).to include('María González')
      end
    end

    context 'with pagination' do
      before do
        create_list(:customer, 25)
        request.headers.merge!(auth_headers(user))
        get :index, params: { page: 2, per_page: 10 }
      end

      it 'returns correct page' do
        pagination = json_response[:data][:pagination]
        expect(pagination[:current_page]).to eq(2)
        expect(pagination[:per_page]).to eq(10)
      end
    end
  end

  describe 'GET #show' do
    let(:customer) { create(:customer) }
    let!(:vehicle) { create(:vehicle, customer: customer) }

    before do
      request.headers.merge!(auth_headers(user))
      get :show, params: { id: customer.id }
    end

    it 'returns successful response' do
      expect(response).to have_http_status(:ok)
    end

    it 'returns customer with vehicles' do
      customer_data = json_response[:data]
      expect(customer_data).to include(
        :id, :name, :email, :phone, :address, :vehicles, :vehicles_count
      )
    end

    context 'when customer not found' do
      before do
        request.headers.merge!(auth_headers(user))
        get :show, params: { id: 999999 }
      end

      it 'returns not found error' do
        expect(response).to have_http_status(:not_found)
        expect(json_response[:success]).to be false
        expect(json_response[:errors]).to include('Customer not found')
      end
    end
  end

  describe 'POST #create' do
    context 'with valid parameters' do
      it 'creates a new Customer' do
        expect {
          request.headers.merge!(auth_headers(user))
          post :create, params: { customer: valid_attributes }
        }.to change(Customer, :count).by(1)
      end

      it 'returns success response' do
        request.headers.merge!(auth_headers(user))
        post :create, params: { customer: valid_attributes }

        expect(response).to have_http_status(:created)
        expect(json_response[:success]).to be true
        expect(json_response[:message]).to eq('Customer created successfully')
        expect(json_response[:data][:name]).to eq(valid_attributes[:name])
      end
    end

    context 'with invalid parameters' do
      it 'does not create a new Customer' do
        expect {
          request.headers.merge!(auth_headers(user))
          post :create, params: { customer: invalid_attributes }
        }.not_to change(Customer, :count)
      end

      it 'returns error response' do
        request.headers.merge!(auth_headers(user))
        post :create, params: { customer: invalid_attributes }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response[:success]).to be false
        expect(json_response[:errors]).to be_present
      end
    end

    context 'with duplicate email' do
      let(:existing_customer) { create(:customer) }

      before { existing_customer }

      it 'returns validation error' do
        duplicate_params = valid_attributes.merge(email: existing_customer.email)
        request.headers.merge!(auth_headers(user))
        post :create, params: { customer: duplicate_params }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response[:errors]).to include(match(/email.*taken/i))
      end
    end
  end

  describe 'PATCH #update' do
    let(:customer) { create(:customer) }
    let(:new_attributes) { { name: 'Nombre Actualizado', phone: '987654321' } }

    context 'with valid parameters' do
      before do
        request.headers.merge!(auth_headers(user))
        patch :update, params: { id: customer.id, customer: new_attributes }
      end

      it 'updates the customer' do
        customer.reload
        expect(customer.name).to eq('Nombre Actualizado')
        expect(customer.phone).to eq('987654321')
      end

      it 'returns success response' do
        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
        expect(json_response[:message]).to eq('Customer updated successfully')
      end
    end

    context 'with invalid parameters' do
      before do
        request.headers.merge!(auth_headers(user))
        patch :update, params: { id: customer.id, customer: invalid_attributes }
      end

      it 'returns error response' do
        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response[:success]).to be false
      end
    end
  end

  describe 'DELETE #destroy' do
    context 'customer without associations' do
      let!(:customer) { create(:customer) }

      it 'destroys the customer' do
        expect {
          request.headers.merge!(auth_headers(user))
          delete :destroy, params: { id: customer.id }
        }.to change(Customer, :count).by(-1)
      end

      it 'returns success response' do
        request.headers.merge!(auth_headers(user))
        delete :destroy, params: { id: customer.id }

        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
        expect(json_response[:message]).to eq('Customer deleted successfully')
      end
    end

    context 'customer with vehicles' do
      let!(:customer) { create(:customer) }
      let!(:vehicle) { create(:vehicle, customer: customer) }

      it 'does not destroy the customer' do
        request.headers.merge!(auth_headers(user))
        expect {
          delete :destroy, params: { id: customer.id }
        }.not_to change(Customer, :count)
      end

      it 'returns error response' do
        request.headers.merge!(auth_headers(user))
        delete :destroy, params: { id: customer.id }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response[:success]).to be false
        expect(json_response[:errors]).to include(match(/associated vehicles/i))
      end
    end
  end
end
