# Backend Technical Guide - Sistema Lubricentro

## 📋 **Guía Técnica Completa del Backend**

Este documento contiene todas las guías técnicas y patrones de implementación del backend Rails API.

## 🔧 **Blueprint Serialization**

### **Overview**

Blueprint es una librería de serialización JSON para Ruby que proporciona una API limpia y simple para serializar objetos Ruby a JSON.

### **Installation**

Blueprint está agregado al Gemfile:

```ruby
# JSON serialization with Blueprint
gem "blueprinter", "~> 1.0"
```

### **Serializers Structure**

Todos los serializers están ubicados en `app/serializers/` y siguen un patrón consistente:

```
app/serializers/
├── customer_serializer.rb
├── vehicle_serializer.rb
├── appointment_serializer.rb
├── service_serializer.rb
├── product_serializer.rb
└── service_record_serializer.rb
```

### **CustomerSerializer**

Maneja la serialización de objetos Customer con múltiples vistas:

#### **Default View**
```ruby
CustomerSerializer.render_as_hash(customer)
```

Incluye: `id`, `name`, `phone`, `email`, `address`, `created_at`, `updated_at`

#### **With Vehicles View**
```ruby
CustomerSerializer.render_as_hash(customer, view: :with_vehicles)
```

Incluye todos los campos por defecto más:
- `vehicles`: Array de vehículos asociados (usando `:summary` view)
- `vehicles_count`: Conteo de vehículos asociados

#### **Summary View**
```ruby
CustomerSerializer.render_as_hash(customer, view: :summary)
```

Incluye solo: `id`, `name`, `phone`, `email`

### **VehicleSerializer**

Maneja la serialización de objetos Vehicle con múltiples vistas:

#### **Default View**
```ruby
VehicleSerializer.render_as_hash(vehicle)
```

Incluye: `id`, `brand`, `model`, `license_plate`, `year`, `customer_id`, `customer_name`, `created_at`, `updated_at`

#### **With Customer View**
```ruby
VehicleSerializer.render_as_hash(vehicle, view: :with_customer)
```

Incluye todos los campos por defecto más:
- `customer`: Objeto customer asociado (usando `:summary` view)
- `appointments_count`: Conteo de turnos asociados
- `service_records_count`: Conteo de atenciones asociadas

### **Controller Implementation**

#### **API Response Pattern**

Todos los controllers mantienen el patrón estándar de respuesta API:

```ruby
# Success Response
{
  success: true,
  data: { ... },
  message: "Success message" # optional
}

# Error Response
{
  success: false,
  errors: ["Error message"],
  message: "Error occurred"
}
```

#### **Using Blueprint in Controllers**

```ruby
# Index action
render json: {
  success: true,
  data: {
    customers: CustomerSerializer.render_as_hash(@customers),
    pagination: pagy_metadata(@pagy)
  }
}

# Show action with detailed view
render json: {
  success: true,
  data: CustomerSerializer.render_as_hash(@customer, view: :with_vehicles)
}

# Create/Update actions
render json: {
  success: true,
  data: CustomerSerializer.render_as_hash(@customer),
  message: "Customer created successfully"
}
```

## 📄 **Pagination System**

### **Overview**

El sistema usa la gema `pagy` para paginación eficiente y consistente.

### **Installation**

```ruby
# Gemfile
gem "pagy", "~> 8.0"
```

### **Configuration**

```ruby
# config/initializers/pagy.rb
require 'pagy/extras/metadata'
require 'pagy/extras/overflow'

Pagy::DEFAULT[:items] = 20
Pagy::DEFAULT[:overflow] = :empty
```

### **Controller Implementation**

```ruby
class Api::V1::CustomersController < ApplicationController
  include Pagy::Backend

  def index
    @pagy, @customers = pagy(Customer.all)
    
    render json: {
      success: true,
      data: {
        customers: CustomerSerializer.render_as_hash(@customers),
        pagination: pagy_metadata(@pagy)
      }
    }
  end
end
```

### **Pagination Metadata**

```ruby
# Response structure
{
  success: true,
  data: {
    customers: [...],
    pagination: {
      count: 150,
      page: 1,
      items: 20,
      pages: 8,
      last: 8,
      from: 1,
      to: 20,
      prev: nil,
      next: 2
    }
  }
}
```

### **Frontend Integration**

```javascript
// React Query hook
const useCustomers = (page = 1) => {
  return useQuery(['customers', page], () => 
    api.get(`/customers?page=${page}`)
  );
};

// Pagination component
const Pagination = ({ pagination, onPageChange }) => {
  const { page, pages, prev, next } = pagination;
  
  return (
    <div className="flex items-center justify-between">
      <button 
        onClick={() => onPageChange(prev)}
        disabled={!prev}
      >
        Anterior
      </button>
      
      <span>Página {page} de {pages}</span>
      
      <button 
        onClick={() => onPageChange(next)}
        disabled={!next}
      >
        Siguiente
      </button>
    </div>
  );
};
```

## 🧪 **Testing Strategy**

### **RSpec Configuration**

```ruby
# spec/rails_helper.rb
require 'rspec/rails'
require 'factory_bot_rails'
require 'faker'
require 'shoulda/matchers'

RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods
  config.use_transactional_fixtures = true
end
```

### **Factory Bot Setup**

```ruby
# spec/factories/customers.rb
FactoryBot.define do
  factory :customer do
    name { Faker::Name.name }
    phone { Faker::PhoneNumber.cell_phone }
    email { Faker::Internet.email }
    address { Faker::Address.full_address }
  end
end

# spec/factories/vehicles.rb
FactoryBot.define do
  factory :vehicle do
    brand { Faker::Vehicle.make }
    model { Faker::Vehicle.model }
    license_plate { Faker::Vehicle.license_plate }
    year { rand(1990..2025) }
    association :customer
  end
end
```

### **Controller Testing**

```ruby
# spec/controllers/api/v1/customers_controller_spec.rb
RSpec.describe Api::V1::CustomersController, type: :controller do
  let(:user) { create(:user) }
  let(:valid_attributes) { attributes_for(:customer) }

  before { sign_in user }

  describe 'GET #index' do
    it 'returns a success response' do
      get :index
      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
    end

    it 'includes pagination metadata' do
      get :index
      expect(json_response['data']['pagination']).to be_present
    end
  end

  describe 'POST #create' do
    context 'with valid params' do
      it 'creates a new customer' do
        expect {
          post :create, params: { customer: valid_attributes }
        }.to change(Customer, :count).by(1)
      end

      it 'returns success response' do
        post :create, params: { customer: valid_attributes }
        expect(response).to have_http_status(:created)
        expect(json_response['success']).to be true
      end
    end
  end
end
```

### **Model Testing**

```ruby
# spec/models/customer_spec.rb
RSpec.describe Customer, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:phone) }
    it { should validate_uniqueness_of(:email).case_insensitive }
  end

  describe 'associations' do
    it { should have_many(:vehicles) }
    it { should have_many(:appointments) }
    it { should have_many(:service_records) }
  end

  describe 'scopes' do
    let!(:customer1) { create(:customer, name: 'Juan Pérez') }
    let!(:customer2) { create(:customer, name: 'María García') }

    it 'filters by name' do
      expect(Customer.search_by_name('Juan')).to include(customer1)
      expect(Customer.search_by_name('Juan')).not_to include(customer2)
    end
  end
end
```

### **Serializer Testing**

```ruby
# spec/serializers/customer_serializer_spec.rb
RSpec.describe CustomerSerializer, type: :serializer do
  let(:customer) { create(:customer) }
  let(:serialized_customer) { CustomerSerializer.render_as_hash(customer) }

  describe 'default view' do
    it 'includes basic customer fields' do
      expect(serialized_customer).to include(
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address
      )
    end
  end

  describe 'with_vehicles view' do
    let(:serialized_customer) { 
      CustomerSerializer.render_as_hash(customer, view: :with_vehicles) 
    }

    it 'includes vehicles count' do
      expect(serialized_customer).to include(:vehicles_count)
    end
  end
end
```

## 🗄️ **Database Cleaner**

### **Configuration**

```ruby
# spec/support/database_cleaner.rb
RSpec.configure do |config|
  config.before(:suite) do
    DatabaseCleaner.clean_with(:truncation)
  end

  config.before(:each) do
    DatabaseCleaner.strategy = :transaction
  end

  config.before(:each, js: true) do
    DatabaseCleaner.strategy = :truncation
  end

  config.before(:each) do
    DatabaseCleaner.start
  end

  config.after(:each) do
    DatabaseCleaner.clean
  end
end
```

### **Usage**

```ruby
# Automático en cada test
RSpec.describe Customer, type: :model do
  it 'creates a customer' do
    customer = create(:customer)
    expect(customer).to be_persisted
  end
end
```

## 🔐 **Authentication & Authorization**

### **JWT Implementation**

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  include JwtAuthentication

  before_action :authenticate_user!
  
  private

  def current_user
    @current_user ||= User.find_by(id: decoded_token[:user_id]) if decoded_token
  end

  def authenticate_user!
    unless current_user
      render json: { 
        success: false, 
        message: 'Unauthorized' 
      }, status: :unauthorized
    end
  end
end
```

### **JWT Helper**

```ruby
# app/controllers/concerns/jwt_authentication.rb
module JwtAuthentication
  extend ActiveSupport::Concern

  private

  def decoded_token
    header = request.headers['Authorization']
    token = header.split(' ').last if header
    
    begin
      JWT.decode(token, Rails.application.credentials.jwt_secret, true, 
                 algorithm: 'HS256')[0]
    rescue JWT::DecodeError
      nil
    end
  end
end
```

## 📊 **Performance Optimization**

### **Database Queries**

```ruby
# Eager loading para evitar N+1 queries
def index
  @pagy, @customers = pagy(
    Customer.includes(:vehicles, :appointments, :service_records)
  )
end

# Scopes para queries complejas
class Customer < ApplicationRecord
  scope :with_vehicles, -> { includes(:vehicles) }
  scope :search_by_name, ->(name) { where('name ILIKE ?', "%#{name}%") }
  scope :active, -> { where(active: true) }
end
```

### **Caching Strategy**

```ruby
# Fragment caching para serializers
class CustomerSerializer < Blueprinter::Base
  identifier :id
  
  fields :name, :phone, :email, :address
  
  association :vehicles, blueprint: VehicleSerializer do |customer|
    customer.vehicles.cache_key
  end
end
```

## 🚀 **Deployment Configuration**

### **Environment Variables**

```ruby
# config/application.rb
config.api_only = true
config.middleware.use ActionDispatch::Cookies
config.middleware.use ActionDispatch::Session::CookieStore

# CORS configuration
config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV['CORS_ORIGIN'] || 'http://localhost:5173'
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

### **Production Settings**

```ruby
# config/environments/production.rb
Rails.application.configure do
  config.cache_classes = true
  config.eager_load = true
  config.consider_all_requests_local = false
  config.public_file_server.enabled = ENV['RAILS_SERVE_STATIC_FILES'].present?
  
  # Force all access to the app over SSL
  config.force_ssl = true
  
  # Use a real cache store in production
  config.cache_store = :redis_cache_store, { url: ENV['REDIS_URL'] }
end
```

---

**Última actualización**: Junio 2025
**Versión**: 2.0 - Guía técnica consolidada
