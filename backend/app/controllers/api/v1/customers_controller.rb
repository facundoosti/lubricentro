class Api::V1::CustomersController < ApplicationController
  before_action :set_customer, only: [ :show, :update, :destroy ]

  # GET /api/v1/customers
  def index
    @customers = Customer.all
    @customers = @customers.by_name(params[:search]) if params[:search].present?

    # Paginación con Pagy
    @pagy, @customers = pagy(@customers, items: safe_per_page(params[:per_page]))

    render json: {
      success: true,
      data: {
        customers: CustomerSerializer.render_as_hash(@customers),
        pagination: pagy_metadata(@pagy)
      }
    }
  end

  # GET /api/v1/customers/:id
  def show
    render json: {
      success: true,
      data: CustomerSerializer.render_as_hash(@customer, view: :with_vehicles)
    }
  end

  # POST /api/v1/customers
  def create
    @customer = Customer.new(customer_params)

    if @customer.save
      render json: {
        success: true,
        data: CustomerSerializer.render_as_hash(@customer),
        message: "Customer created successfully"
      }, status: :created
    else
      render json: {
        success: false,
        errors: @customer.errors.full_messages,
        message: "Error creating customer"
      }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/customers/:id
  def update
    if @customer.update(customer_params)
      render json: {
        success: true,
        data: CustomerSerializer.render_as_hash(@customer),
        message: "Customer updated successfully"
      }
    else
      render json: {
        success: false,
        errors: @customer.errors.full_messages,
        message: "Error updating customer"
      }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/customers/:id
  def destroy
    # Verificar si tiene vehículos asociados
    if @customer.vehicles.exists?
      render json: {
        success: false,
        errors: [ "Cannot delete customer with associated vehicles" ],
        message: "Error deleting customer"
      }, status: :unprocessable_entity
      return
    end

    @customer.destroy
    render json: {
      success: true,
      message: "Customer deleted successfully"
    }
  end

  private

  def set_customer
    @customer = Customer.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      errors: [ "Customer not found" ],
      message: "Customer not found"
    }, status: :not_found
  end

  def customer_params
    params.require(:customer).permit(:name, :phone, :email, :address)
  end
end
