# Sistema de Presupuestos - Backend Rails API

## 📋 **Descripción General**

El sistema de presupuestos permite crear y gestionar cotizaciones para clientes del lubricentro, incluyendo productos y servicios con cálculo automático de totales.

## 🏗️ **Arquitectura del Sistema**

### **Modelos Principales**

#### **Quote (Presupuesto)**
```ruby
class Quote < ApplicationRecord
  belongs_to :customer
  belongs_to :vehicle
  
  has_many :quote_services, dependent: :destroy
  has_many :quote_products, dependent: :destroy
  has_many :services, through: :quote_services
  has_many :products, through: :quote_products
  
  validates :quote_number, presence: true, uniqueness: true
  validates :issue_date, presence: true
  validates :expiry_date, presence: true
  validates :status, presence: true, inclusion: { in: %w[draft sent approved rejected expired converted] }
  validates :total_amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  
  scope :active, -> { where.not(status: %w[expired converted]) }
  scope :by_status, ->(status) { where(status: status) }
  scope :expired, -> { where('expiry_date < ?', Date.current) }
  
  before_save :calculate_total_amount
  after_save :check_expiration
  
  private
  
  def calculate_total_amount
    services_total = quote_services.sum(&:total_price)
    products_total = quote_products.sum(&:total_price)
    self.total_amount = services_total + products_total
  end
  
  def check_expiration
    if expiry_date < Date.current && status != 'converted'
      update_column(:status, 'expired')
    end
  end
end
```

#### **QuoteService (Servicios del Presupuesto)**
```ruby
class QuoteService < ApplicationRecord
  belongs_to :quote
  belongs_to :service
  
  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :total_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  
  before_save :calculate_total_price
  
  private
  
  def calculate_total_price
    self.total_price = quantity * unit_price
  end
end
```

#### **QuoteProduct (Productos del Presupuesto)**
```ruby
class QuoteProduct < ApplicationRecord
  belongs_to :quote
  belongs_to :product
  
  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :total_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  
  before_save :calculate_total_price
  
  private
  
  def calculate_total_price
    self.total_price = quantity * unit_price
  end
end
```

### **Migraciones de Base de Datos**

#### **Create Quotes Table**
```ruby
class CreateQuotes < ActiveRecord::Migration[8.0]
  def change
    create_table :quotes do |t|
      t.string :quote_number, null: false
      t.date :issue_date, null: false
      t.date :expiry_date, null: false
      t.string :status, default: 'draft', null: false
      t.decimal :total_amount, precision: 10, scale: 2, default: 0.0
      t.text :notes
      t.references :customer, null: false, foreign_key: true
      t.references :vehicle, null: false, foreign_key: true
      
      t.timestamps
    end
    
    add_index :quotes, :quote_number, unique: true
    add_index :quotes, :status
    add_index :quotes, :issue_date
    add_index :quotes, :expiry_date
  end
end
```

#### **Create Quote Services Table**
```ruby
class CreateQuoteServices < ActiveRecord::Migration[8.0]
  def change
    create_table :quote_services do |t|
      t.references :quote, null: false, foreign_key: true
      t.references :service, null: false, foreign_key: true
      t.integer :quantity, null: false, default: 1
      t.decimal :unit_price, precision: 10, scale: 2, null: false
      t.decimal :total_price, precision: 10, scale: 2, null: false
      
      t.timestamps
    end
    
    add_index :quote_services, [:quote_id, :service_id], unique: true
  end
end
```

#### **Create Quote Products Table**
```ruby
class CreateQuoteProducts < ActiveRecord::Migration[8.0]
  def change
    create_table :quote_products do |t|
      t.references :quote, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.integer :quantity, null: false, default: 1
      t.decimal :unit_price, precision: 10, scale: 2, null: false
      t.decimal :total_price, precision: 10, scale: 2, null: false
      
      t.timestamps
    end
    
    add_index :quote_products, [:quote_id, :product_id], unique: true
  end
end
```

## 🎮 **Controller Implementation**

### **QuotesController**
```ruby
class Api::V1::QuotesController < ApplicationController
  before_action :set_quote, only: [:show, :update, :destroy, :convert_to_service_record]
  
  def index
    @pagy, @quotes = pagy(Quote.includes(:customer, :vehicle, :quote_services, :quote_products))
    
    render json: {
      success: true,
      data: {
        quotes: QuoteSerializer.render_as_hash(@quotes),
        pagination: pagy_metadata(@pagy)
      }
    }
  end
  
  def show
    render json: {
      success: true,
      data: QuoteSerializer.render_as_hash(@quote, view: :detailed)
    }
  end
  
  def create
    @quote = Quote.new(quote_params)
    
    if @quote.save
      render json: {
        success: true,
        data: QuoteSerializer.render_as_hash(@quote),
        message: 'Presupuesto creado exitosamente'
      }, status: :created
    else
      render json: {
        success: false,
        errors: @quote.errors.full_messages,
        message: 'Error al crear el presupuesto'
      }, status: :unprocessable_entity
    end
  end
  
  def update
    if @quote.update(quote_params)
      render json: {
        success: true,
        data: QuoteSerializer.render_as_hash(@quote),
        message: 'Presupuesto actualizado exitosamente'
      }
    else
      render json: {
        success: false,
        errors: @quote.errors.full_messages,
        message: 'Error al actualizar el presupuesto'
      }, status: :unprocessable_entity
    end
  end
  
  def destroy
    if @quote.destroy
      render json: {
        success: true,
        message: 'Presupuesto eliminado exitosamente'
      }
    else
      render json: {
        success: false,
        message: 'Error al eliminar el presupuesto'
      }, status: :unprocessable_entity
    end
  end
  
  def convert_to_service_record
    service_record = @quote.convert_to_service_record
    
    if service_record.persisted?
      render json: {
        success: true,
        data: ServiceRecordSerializer.render_as_hash(service_record),
        message: 'Presupuesto convertido a atención exitosamente'
      }
    else
      render json: {
        success: false,
        errors: service_record.errors.full_messages,
        message: 'Error al convertir el presupuesto'
      }, status: :unprocessable_entity
    end
  end
  
  private
  
  def set_quote
    @quote = Quote.find(params[:id])
  end
  
  def quote_params
    params.require(:quote).permit(
      :customer_id, :vehicle_id, :issue_date, :expiry_date, 
      :status, :notes,
      quote_services_attributes: [:service_id, :quantity, :unit_price],
      quote_products_attributes: [:product_id, :quantity, :unit_price]
    )
  end
end
```

### **Quote Services Controller**
```ruby
class Api::V1::QuoteServicesController < ApplicationController
  before_action :set_quote
  
  def create
    @quote_service = @quote.quote_services.build(quote_service_params)
    
    if @quote_service.save
      render json: {
        success: true,
        data: QuoteServiceSerializer.render_as_hash(@quote_service),
        message: 'Servicio agregado al presupuesto'
      }
    else
      render json: {
        success: false,
        errors: @quote_service.errors.full_messages,
        message: 'Error al agregar el servicio'
      }, status: :unprocessable_entity
    end
  end
  
  def update
    @quote_service = @quote.quote_services.find(params[:id])
    
    if @quote_service.update(quote_service_params)
      render json: {
        success: true,
        data: QuoteServiceSerializer.render_as_hash(@quote_service),
        message: 'Servicio actualizado exitosamente'
      }
    else
      render json: {
        success: false,
        errors: @quote_service.errors.full_messages,
        message: 'Error al actualizar el servicio'
      }, status: :unprocessable_entity
    end
  end
  
  def destroy
    @quote_service = @quote.quote_services.find(params[:id])
    
    if @quote_service.destroy
      render json: {
        success: true,
        message: 'Servicio eliminado del presupuesto'
      }
    else
      render json: {
        success: false,
        message: 'Error al eliminar el servicio'
      }, status: :unprocessable_entity
    end
  end
  
  private
  
  def set_quote
    @quote = Quote.find(params[:quote_id])
  end
  
  def quote_service_params
    params.require(:quote_service).permit(:service_id, :quantity, :unit_price)
  end
end
```

### **Quote Products Controller**
```ruby
class Api::V1::QuoteProductsController < ApplicationController
  before_action :set_quote
  
  def create
    @quote_product = @quote.quote_products.build(quote_product_params)
    
    if @quote_product.save
      render json: {
        success: true,
        data: QuoteProductSerializer.render_as_hash(@quote_product),
        message: 'Producto agregado al presupuesto'
      }
    else
      render json: {
        success: false,
        errors: @quote_product.errors.full_messages,
        message: 'Error al agregar el producto'
      }, status: :unprocessable_entity
    end
  end
  
  def update
    @quote_product = @quote.quote_products.find(params[:id])
    
    if @quote_product.update(quote_product_params)
      render json: {
        success: true,
        data: QuoteProductSerializer.render_as_hash(@quote_product),
        message: 'Producto actualizado exitosamente'
      }
    else
      render json: {
        success: false,
        errors: @quote_product.errors.full_messages,
        message: 'Error al actualizar el producto'
      }, status: :unprocessable_entity
    end
  end
  
  def destroy
    @quote_product = @quote.quote_products.find(params[:id])
    
    if @quote_product.destroy
      render json: {
        success: true,
        message: 'Producto eliminado del presupuesto'
      }
    else
      render json: {
        success: false,
        message: 'Error al eliminar el producto'
      }, status: :unprocessable_entity
    end
  end
  
  private
  
  def set_quote
    @quote = Quote.find(params[:quote_id])
  end
  
  def quote_product_params
    params.require(:quote_product).permit(:product_id, :quantity, :unit_price)
  end
end
```

## 📊 **Serializers**

### **QuoteSerializer**
```ruby
class QuoteSerializer < Blueprinter::Base
  identifier :id
  
  fields :quote_number, :issue_date, :expiry_date, :status, 
         :total_amount, :notes, :created_at, :updated_at
  
  association :customer, blueprint: CustomerSerializer, view: :summary
  association :vehicle, blueprint: VehicleSerializer, view: :summary
  
  association :quote_services, blueprint: QuoteServiceSerializer
  association :quote_products, blueprint: QuoteProductSerializer
  
  view :detailed do
    association :customer, blueprint: CustomerSerializer, view: :with_vehicles
    association :vehicle, blueprint: VehicleSerializer, view: :with_customer
  end
  
  view :summary do
    fields :quote_number, :issue_date, :expiry_date, :status, :total_amount
    association :customer, blueprint: CustomerSerializer, view: :summary
  end
end
```

### **QuoteServiceSerializer**
```ruby
class QuoteServiceSerializer < Blueprinter::Base
  identifier :id
  
  fields :quantity, :unit_price, :total_price, :created_at, :updated_at
  
  association :service, blueprint: ServiceSerializer, view: :summary
end
```

### **QuoteProductSerializer**
```ruby
class QuoteProductSerializer < Blueprinter::Base
  identifier :id
  
  fields :quantity, :unit_price, :total_price, :created_at, :updated_at
  
  association :product, blueprint: ProductSerializer, view: :summary
end
```

## 🔄 **Service Objects**

### **QuoteConversionService**
```ruby
class QuoteConversionService
  def initialize(quote)
    @quote = quote
  end
  
  def convert_to_service_record
    return false unless @quote.approved?
    
    ActiveRecord::Base.transaction do
      service_record = create_service_record
      create_service_record_services(service_record)
      create_service_record_products(service_record)
      
      @quote.update!(status: 'converted')
      service_record
    end
  rescue => e
    Rails.logger.error "Error converting quote #{@quote.id}: #{e.message}"
    false
  end
  
  private
  
  def create_service_record
    ServiceRecord.create!(
      customer: @quote.customer,
      vehicle: @quote.vehicle,
      service_date: Date.current,
      total_amount: @quote.total_amount,
      notes: "Convertido desde presupuesto #{@quote.quote_number}",
      next_service_date: calculate_next_service_date
    )
  end
  
  def create_service_record_services(service_record)
    @quote.quote_services.each do |quote_service|
      ServiceRecordService.create!(
        service_record: service_record,
        service: quote_service.service,
        quantity: quote_service.quantity,
        unit_price: quote_service.unit_price,
        total_price: quote_service.total_price
      )
    end
  end
  
  def create_service_record_products(service_record)
    @quote.quote_products.each do |quote_product|
      ServiceRecordProduct.create!(
        service_record: service_record,
        product: quote_product.product,
        quantity: quote_product.quantity,
        unit_price: quote_product.unit_price,
        total_price: quote_product.total_price
      )
    end
  end
  
  def calculate_next_service_date
    # Lógica para calcular próxima fecha de servicio
    # Basada en el tipo de servicios incluidos
    Date.current + 6.months
  end
end
```

### **QuoteNumberGeneratorService**
```ruby
class QuoteNumberGeneratorService
  def self.generate
    year = Date.current.year
    last_quote = Quote.where("quote_number LIKE ?", "Q#{year}%")
                      .order(:quote_number)
                      .last
    
    if last_quote
      last_number = last_quote.quote_number.split('-').last.to_i
      new_number = last_number + 1
    else
      new_number = 1
    end
    
    "Q#{year}-#{new_number.to_s.rjust(4, '0')}"
  end
end
```

## 🧪 **Testing Strategy**

### **Model Specs**
```ruby
# spec/models/quote_spec.rb
RSpec.describe Quote, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:quote_number) }
    it { should validate_presence_of(:issue_date) }
    it { should validate_presence_of(:expiry_date) }
    it { should validate_presence_of(:status) }
    it { should validate_inclusion_of(:status).in_array(%w[draft sent approved rejected expired converted]) }
  end
  
  describe 'associations' do
    it { should belong_to(:customer) }
    it { should belong_to(:vehicle) }
    it { should have_many(:quote_services).dependent(:destroy) }
    it { should have_many(:quote_products).dependent(:destroy) }
  end
  
  describe 'scopes' do
    let!(:draft_quote) { create(:quote, status: 'draft') }
    let!(:approved_quote) { create(:quote, status: 'approved') }
    let!(:expired_quote) { create(:quote, status: 'expired') }
    
    it 'filters active quotes' do
      expect(Quote.active).to include(draft_quote, approved_quote)
      expect(Quote.active).not_to include(expired_quote)
    end
  end
  
  describe 'callbacks' do
    it 'calculates total amount before save' do
      quote = build(:quote)
      quote.quote_services.build(quantity: 2, unit_price: 100)
      quote.quote_products.build(quantity: 1, unit_price: 50)
      
      quote.save
      expect(quote.total_amount).to eq(250)
    end
  end
end
```

### **Controller Specs**
```ruby
# spec/controllers/api/v1/quotes_controller_spec.rb
RSpec.describe Api::V1::QuotesController, type: :controller do
  let(:user) { create(:user) }
  let(:customer) { create(:customer) }
  let(:vehicle) { create(:vehicle, customer: customer) }
  let(:valid_attributes) { attributes_for(:quote, customer_id: customer.id, vehicle_id: vehicle.id) }
  
  before { sign_in user }
  
  describe 'GET #index' do
    it 'returns a success response' do
      get :index
      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
    end
  end
  
  describe 'POST #create' do
    context 'with valid params' do
      it 'creates a new quote' do
        expect {
          post :create, params: { quote: valid_attributes }
        }.to change(Quote, :count).by(1)
      end
    end
  end
  
  describe 'PUT #update' do
    let(:quote) { create(:quote, customer: customer, vehicle: vehicle) }
    
    it 'updates the quote' do
      put :update, params: { id: quote.id, quote: { notes: 'Updated notes' } }
      expect(quote.reload.notes).to eq('Updated notes')
    end
  end
end
```

## 🚀 **API Endpoints**

### **Quotes**
- `GET /api/v1/quotes` - Listar presupuestos
- `GET /api/v1/quotes/:id` - Mostrar presupuesto
- `POST /api/v1/quotes` - Crear presupuesto
- `PUT /api/v1/quotes/:id` - Actualizar presupuesto
- `DELETE /api/v1/quotes/:id` - Eliminar presupuesto
- `POST /api/v1/quotes/:id/convert_to_service_record` - Convertir a atención

### **Quote Services**
- `POST /api/v1/quotes/:quote_id/quote_services` - Agregar servicio
- `PUT /api/v1/quotes/:quote_id/quote_services/:id` - Actualizar servicio
- `DELETE /api/v1/quotes/:quote_id/quote_services/:id` - Eliminar servicio

### **Quote Products**
- `POST /api/v1/quotes/:quote_id/quote_products` - Agregar producto
- `PUT /api/v1/quotes/:quote_id/quote_products/:id` - Actualizar producto
- `DELETE /api/v1/quotes/:quote_id/quote_products/:id` - Eliminar producto

## 📈 **Estados y Transiciones**

### **Diagrama de Estados**
```
draft → sent → approved → converted
  ↓        ↓        ↓
expired  expired  expired
  ↓
rejected
```

### **Reglas de Transición**
- **draft**: Solo editable, no se puede enviar
- **sent**: No editable, solo cambio de estado
- **approved**: No editable, solo conversión
- **rejected**: No editable, solo visualización
- **expired**: Automático por fecha de vencimiento
- **converted**: No editable, solo visualización

## 🔧 **Configuración y Variables de Entorno**

### **Configuración de Presupuestos**
```ruby
# config/initializers/quotes.rb
Rails.application.config.quotes = {
  default_expiry_days: 30,
  auto_expire_enabled: true,
  number_prefix: 'Q',
  max_items_per_quote: 50
}
```

### **Variables de Entorno**
```env
# Configuración de presupuestos
QUOTE_DEFAULT_EXPIRY_DAYS=30
QUOTE_AUTO_EXPIRE_ENABLED=true
QUOTE_NUMBER_PREFIX=Q
QUOTE_MAX_ITEMS=50
```

---

**Última actualización**: Diciembre 2025
**Versión**: 1.0 - Sistema de Presupuestos implementado
**Estado**: ✅ COMPLETADO - Backend funcional
