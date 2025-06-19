class Api::V1::VehiclesController < ApplicationController
  before_action :set_vehicle, only: [ :show, :update, :destroy ]

  # GET /api/v1/vehicles
  def index
    @vehicles = Vehicle.includes(:customer)

    # Filtros
    @vehicles = @vehicles.by_customer(params[:customer_id]) if params[:customer_id].present?
    @vehicles = @vehicles.by_brand(params[:brand]) if params[:brand].present?

    # Búsqueda por license_plate o brand/model
    if params[:search].present?
      search_term = "%#{params[:search]}%"
      @vehicles = @vehicles.where(
        "license_plate LIKE ? OR brand LIKE ? OR model LIKE ?",
        search_term, search_term, search_term
      )
    end

    # Paginación con Pagy
    @pagy, @vehicles = pagy(@vehicles, items: safe_per_page(params[:per_page]))

    render json: {
      success: true,
      data: {
        vehicles: VehicleSerializer.render_as_hash(@vehicles),
        pagination: pagy_metadata(@pagy)
      }
    }
  end

  # GET /api/v1/vehicles/:id
  def show
    render json: {
      success: true,
      data: VehicleSerializer.render_as_hash(@vehicle, view: :with_customer)
    }
  end

  # POST /api/v1/vehicles
  def create
    @vehicle = Vehicle.new(vehicle_params)

    if @vehicle.save
      render json: {
        success: true,
        data: VehicleSerializer.render_as_hash(@vehicle),
        message: "Vehicle created successfully"
      }, status: :created
    else
      render json: {
        success: false,
        errors: @vehicle.errors.full_messages,
        message: "Error creating vehicle"
      }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/vehicles/:id
  def update
    if @vehicle.update(vehicle_params)
      render json: {
        success: true,
        data: VehicleSerializer.render_as_hash(@vehicle),
        message: "Vehicle updated successfully"
      }
    else
      render json: {
        success: false,
        errors: @vehicle.errors.full_messages,
        message: "Error updating vehicle"
      }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/vehicles/:id
  def destroy
    # TODO: Verificar si tiene turnos o atenciones asociadas
    # if @vehicle.appointments.exists? || @vehicle.service_records.exists?
    #   render json: {
    #     success: false,
    #     errors: ["Cannot delete vehicle with associated appointments or service records"],
    #     message: "Error deleting vehicle"
    #   }, status: :unprocessable_entity
    #   return
    # end

    @vehicle.destroy
    render json: {
      success: true,
      message: "Vehicle deleted successfully"
    }
  end

  private

  def set_vehicle
    @vehicle = Vehicle.includes(:customer).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      errors: [ "Vehicle not found" ],
      message: "Vehicle not found"
    }, status: :not_found
  end

  def vehicle_params
    params.require(:vehicle).permit(:brand, :model, :license_plate, :year, :customer_id)
  end
end
