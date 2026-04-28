require 'rails_helper'

RSpec.describe 'Api::V1::Auth', type: :request do
  describe 'POST /api/v1/auth/register' do
    let(:valid_params) do
      {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          password_confirmation: 'password123'
        }
      }
    end

    context 'with valid parameters' do
      it 'creates a new user and returns token' do
        expect {
          post '/api/v1/auth/register', params: valid_params
        }.to change(User, :count).by(1)

        expect(response).to have_http_status(:ok)

        json_response = JSON.parse(response.body)
        expect(json_response['success']).to be true
        expect(json_response['message']).to eq('Usuario creado exitosamente')

        # Verificar datos del usuario
        expect(json_response['data']['user']['name']).to eq('John Doe')
        expect(json_response['data']['user']['email']).to eq('john@example.com')
        expect(json_response['data']['user']['id']).to be_present

        # Verificar token
        expect(json_response['data']['token']).to be_present
        expect(json_response['data']['token_type']).to eq('Bearer')
        expect(json_response['data']['expires_in']).to be_present
      end
    end

    context 'with invalid email' do
      it 'returns error for duplicate email' do
        # Crear usuario primero
        User.create!(name: 'Existing User', email: 'john@example.com', password: 'password123')

        expect {
          post '/api/v1/auth/register', params: valid_params
        }.not_to change(User, :count)

        expect(response).to have_http_status(:unprocessable_content)

        json_response = JSON.parse(response.body)
        expect(json_response['success']).to be false
        expect(json_response['errors']).to include('Email has already been taken')
      end

      it 'returns error for invalid email format' do
        invalid_params = valid_params.deep_merge(user: { email: 'invalid-email' })

        expect {
          post '/api/v1/auth/register', params: invalid_params
        }.not_to change(User, :count)

        expect(response).to have_http_status(:unprocessable_content)

        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Email is invalid')
      end
    end

    context 'with invalid password' do
      it 'returns error for short password' do
        short_password_params = valid_params.deep_merge(user: {
          password: '123',
          password_confirmation: '123'
        })

        expect {
          post '/api/v1/auth/register', params: short_password_params
        }.not_to change(User, :count)

        expect(response).to have_http_status(:unprocessable_content)

        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Password is too short (minimum is 6 characters)')
      end

      it 'returns error for password mismatch' do
        mismatch_params = valid_params.deep_merge(user: { password_confirmation: 'different' })

        expect {
          post '/api/v1/auth/register', params: mismatch_params
        }.not_to change(User, :count)

        expect(response).to have_http_status(:unprocessable_content)

        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include("Password confirmation doesn't match Password")
      end
    end

    context 'with missing required fields' do
      it 'returns error for missing name' do
        no_name_params = valid_params.deep_merge(user: { name: nil })

        expect {
          post '/api/v1/auth/register', params: no_name_params
        }.not_to change(User, :count)

        expect(response).to have_http_status(:unprocessable_content)

        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include("Name can't be blank")
      end

      it 'returns error for missing email' do
        no_email_params = valid_params.deep_merge(user: { email: nil })

        expect {
          post '/api/v1/auth/register', params: no_email_params
        }.not_to change(User, :count)

        expect(response).to have_http_status(:unprocessable_content)

        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include("Email can't be blank")
      end
    end
  end

  describe 'POST /api/v1/auth/login' do
    let!(:user) { create(:user, email: 'login@example.com', password: 'secret123', password_confirmation: 'secret123') }

    context 'with valid credentials' do
      it 'returns a token and user data' do
        post '/api/v1/auth/login', params: { auth: { email: 'login@example.com', password: 'secret123' } }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response['success']).to be true
        expect(json_response['message']).to eq('Login exitoso')
        expect(json_response['data']['user']['email']).to eq('login@example.com')
        expect(json_response['data']['token']).to be_present
        expect(json_response['data']['token_type']).to eq('Bearer')
      end
    end

    context 'with wrong password' do
      it 'returns unauthorized' do
        post '/api/v1/auth/login', params: { auth: { email: 'login@example.com', password: 'wrongpass' } }

        expect(response).to have_http_status(:unauthorized)
        json_response = JSON.parse(response.body)

        expect(json_response['success']).to be false
        expect(json_response['errors']).to include('Email o contraseña incorrectos')
      end
    end

    context 'with non-existent email' do
      it 'returns unauthorized' do
        post '/api/v1/auth/login', params: { auth: { email: 'nobody@example.com', password: 'secret123' } }

        expect(response).to have_http_status(:unauthorized)
        json_response = JSON.parse(response.body)
        expect(json_response['success']).to be false
      end
    end
  end

  describe 'GET /api/v1/auth/verify' do
    include ApiHelper
    let(:user) { create(:user) }

    context 'with a valid token' do
      it 'returns user data' do
        get '/api/v1/auth/verify', headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response['success']).to be true
        expect(json_response['message']).to eq('Token válido')
        expect(json_response['data']['user']['id']).to eq(user.id)
      end
    end

    context 'without a token' do
      it 'returns unauthorized' do
        get '/api/v1/auth/verify'
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
