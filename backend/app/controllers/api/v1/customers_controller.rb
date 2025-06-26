class Api::V1::CustomersController < ApplicationController
  before_action :set_customer, only: [ :show, :update, :destroy ]

  # GET /api/v1/customers
  def index
    @customers = Customer.all
    @customers = @customers.by_search(params[:search]) if params[:search].present?

    # Paginación con Pagy
    @pagy, @customers = pagy(@customers, items: safe_per_page(params[:per_page]))
    @serializer = CustomerSerializer.render_as_hash(@customers, root: :customers)
    render_json(@serializer)
  end

  # GET /api/v1/customers/:id
  def show
    @serializer = CustomerSerializer.render_as_hash(@customer, view: :with_vehicles)
    render_json(@serializer)
  end

  # POST /api/v1/customers
  def create
    @customer = Customer.new(customer_params)

    if @customer.save
      @serializer = CustomerSerializer.render_as_hash(@customer)
      render_json(@serializer, message: "Customer created successfully", status: :created)
    else
      render_json({ errors: @customer.errors.full_messages }, message: "Error creating customer", status: :unprocessable_entity)
    end
  end

  # PATCH/PUT /api/v1/customers/:id
  def update
    if @customer.update(customer_params)
      @serializer = CustomerSerializer.render_as_hash(@customer)
      render_json(@serializer, message: "Customer updated successfully")
    else
      render_json({ errors: @customer.errors.full_messages }, message: "Error updating customer", status: :unprocessable_entity)
    end
  end

  # DELETE /api/v1/customers/:id
  def destroy
    # Verificar si tiene vehículos asociados
    if @customer.vehicles.exists?
      render_json({ errors: [ "Cannot delete customer with associated vehicles" ] }, message: "Error deleting customer", status: :unprocessable_entity)
      return
    end

    @customer.destroy
    render_json({}, message: "Customer deleted successfully")
  end

  private

  def set_customer
    @customer = Customer.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_json({ errors: [ "Customer not found" ] }, message: "Customer not found", status: :not_found)
  end

  def customer_params
    params.require(:customer).permit(:name, :phone, :email, :address)
  end
end
