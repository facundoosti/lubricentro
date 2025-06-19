require 'rails_helper'

RSpec.describe "Api::V1::Customers", type: :request do
  let(:valid_attributes) { attributes_for(:customer) }
  let(:invalid_attributes) { attributes_for(:customer, name: '', phone: '', email: 'invalid_email', address: '') }

  describe 'GET /api/v1/customers' do
    context 'with basic response' do
      before do
        create_list(:customer, 3)
        get '/api/v1/customers'
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
    end

    context 'with pagy pagination' do
      let!(:customers) { create_list(:customer, 25) }

      context 'with default parameters' do
        before { get '/api/v1/customers' }

        it 'returns paginated results' do
          data = json_response[:data]
          expect(data[:customers].size).to eq(20) # Default per_page
          expect(data[:pagination][:current_page]).to eq(1)
          expect(data[:pagination][:total_count]).to eq(25)
          expect(data[:pagination][:total_pages]).to eq(2)
        end

        it 'includes all pagination metadata' do
          pagination = json_response[:data][:pagination]
          expect(pagination).to include(
            :current_page, :per_page, :total_count, :total_pages,
            :prev_page, :next_page, :first_page, :last_page
          )
        end
      end

      context 'with custom per_page' do
        before { get '/api/v1/customers', params: { per_page: 10 } }

        it 'respects per_page parameter' do
          data = json_response[:data]
          expect(data[:customers].size).to eq(10)
          expect(data[:pagination][:per_page]).to eq(10)
          expect(data[:pagination][:total_pages]).to eq(3)
        end
      end

      context 'with page parameter' do
        before { get '/api/v1/customers', params: { page: 2, per_page: 10 } }

        it 'returns correct page' do
          data = json_response[:data]
          expect(data[:customers].size).to eq(10)
          expect(data[:pagination][:current_page]).to eq(2)
          expect(data[:pagination][:prev_page]).to eq(1)
          expect(data[:pagination][:next_page]).to eq(3)
        end
      end

      context 'when requesting page beyond total' do
        before { get '/api/v1/customers', params: { page: 10, per_page: 10 } }

        it 'returns successful response even with invalid page' do
          expect(response).to have_http_status(:ok)
        end

        it 'includes pagination metadata' do
          data = json_response[:data]
          expect(data[:pagination]).to include(
            :current_page, :per_page, :total_count, :total_pages
          )
        end
      end

      context 'with per_page exceeding max_items' do
        before { get '/api/v1/customers', params: { per_page: 150 } }

        it 'limits to max_items (100)' do
          data = json_response[:data]
          expect(data[:pagination][:per_page]).to eq(100)
        end
      end
    end

    context 'with search parameter' do
      let!(:searchable_customer) { create(:customer, name: 'Jane Smith') }
      let!(:other_customers) { create_list(:customer, 3) }

      before do
        get '/api/v1/customers', params: { search: 'Jane' }
      end

      it 'filters customers by name' do
        customer_names = json_response[:data][:customers].map { |c| c[:name] }
        expect(customer_names).to include('Jane Smith')
        expect(customer_names.length).to eq(1)
      end

      it 'includes pagination for search results' do
        pagination = json_response[:data][:pagination]
        expect(pagination[:total_count]).to eq(1)
      end
    end
  end

  describe 'GET /api/v1/customers/:id' do
    let(:customer) { create(:customer_with_vehicles) }

    before do
      get "/api/v1/customers/#{customer.id}"
    end

    it 'returns successful response' do
      expect(response).to have_http_status(:ok)
    end

    it 'returns customer with vehicles' do
      customer_data = json_response[:data]
      expect(customer_data).to include(
        :id, :name, :phone, :email, :address, :vehicles, :vehicles_count
      )
    end

    context 'when customer not found' do
      before do
        get '/api/v1/customers/999999'
      end

      it 'returns not found error' do
        expect(response).to have_http_status(:not_found)
        expect(json_response[:success]).to be false
        expect(json_response[:errors]).to include('Customer not found')
      end
    end
  end

  describe 'POST /api/v1/customers' do
    context 'with valid parameters' do
      it 'creates a new Customer' do
        expect {
          post '/api/v1/customers', params: { customer: valid_attributes }
        }.to change(Customer, :count).by(1)
      end

      it 'returns success response' do
        post '/api/v1/customers', params: { customer: valid_attributes }

        expect(response).to have_http_status(:created)
        expect(json_response[:success]).to be true
        expect(json_response[:message]).to eq('Customer created successfully')
        expect(json_response[:data][:name]).to eq(valid_attributes[:name])
      end
    end

    context 'with invalid parameters' do
      it 'does not create a new Customer' do
        expect {
          post '/api/v1/customers', params: { customer: invalid_attributes }
        }.not_to change(Customer, :count)
      end

      it 'returns error response' do
        post '/api/v1/customers', params: { customer: invalid_attributes }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response[:success]).to be false
        expect(json_response[:errors]).to be_present
      end
    end
  end

  describe 'PATCH /api/v1/customers/:id' do
    let(:customer) { create(:customer) }
    let(:new_attributes) { { name: 'Updated Name', phone: '999-888-7777' } }

    context 'with valid parameters' do
      before do
        patch "/api/v1/customers/#{customer.id}", params: { customer: new_attributes }
      end

      it 'updates the customer' do
        customer.reload
        expect(customer.name).to eq('Updated Name')
        expect(customer.phone).to eq('999-888-7777')
      end

      it 'returns success response' do
        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
        expect(json_response[:message]).to eq('Customer updated successfully')
      end
    end

    context 'with invalid parameters' do
      before do
        patch "/api/v1/customers/#{customer.id}", params: { customer: invalid_attributes }
      end

      it 'returns error response' do
        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response[:success]).to be false
      end
    end
  end

  describe 'DELETE /api/v1/customers/:id' do
    let!(:customer) { create(:customer) }

    context 'when customer has no vehicles' do
      it 'destroys the customer' do
        expect {
          delete "/api/v1/customers/#{customer.id}"
        }.to change(Customer, :count).by(-1)
      end

      it 'returns success response' do
        delete "/api/v1/customers/#{customer.id}"

        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
        expect(json_response[:message]).to eq('Customer deleted successfully')
      end
    end

    context 'when customer has vehicles' do
      let!(:customer_with_vehicles) { create(:customer_with_vehicles) }

      it 'does not destroy the customer' do
        expect {
          delete "/api/v1/customers/#{customer_with_vehicles.id}"
        }.not_to change(Customer, :count)
      end

      it 'returns error response' do
        delete "/api/v1/customers/#{customer_with_vehicles.id}"

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response[:success]).to be false
        expect(json_response[:errors]).to include('Cannot delete customer with associated vehicles')
      end
    end

    context 'when customer not found' do
      before do
        delete '/api/v1/customers/999999'
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
