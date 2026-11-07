class Api::V1::VehiclesController < ApplicationController
  before_action :set_vehicle, only: [ :show, :update, :destroy ]

  # GET /api/v1/vehicles
  def index
    @vehicles = Vehicle.includes(:customer, :image_attachment)

    # Filtros
    @vehicles = @vehicles.by_customer(params[:customer_id]) if params[:customer_id].present?
    @vehicles = @vehicles.by_brand(params[:brand]) if params[:brand].present?
    @vehicles = @vehicles.by_license_plate(params[:license_plate]) if params[:license_plate].present?

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

    @serializer = VehicleSerializer.render_as_hash(@vehicles, root: :vehicles, **index_view_options)
    render_json(@serializer)
  end

  # GET /api/v1/vehicles/:id
  def show
    @serializer = VehicleSerializer.render_as_hash(@vehicle, view: :with_customer)
    render_json(@serializer)
  end

  # GET /api/v1/vehicles/lookup?plate=ABC123
  def lookup
    plate = params[:plate].to_s.strip

    if plate.length < 6
      render_json({ errors: [ "Plate must be at least 6 characters" ] }, message: "Invalid plate", status: :bad_request)
      return
    end

    result = VehicleLookupService.new(plate).call

    case result[:status]
    when "found"
      render_json({ vehicle: result }, message: "Vehicle found")
    when "not_found"
      render_json({ vehicle: nil }, message: "Vehicle not found", status: :not_found)
    else
      render_json({ errors: [ result[:message] ] }, message: "Lookup failed", status: :service_unavailable)
    end
  end

  # POST /api/v1/vehicles
  def create
    @vehicle = Vehicle.new(vehicle_params)

    if @vehicle.save
      @serializer = VehicleSerializer.render_as_hash(@vehicle, view: :with_customer)
      render_json(@serializer, message: "Vehicle created successfully", status: :created)
    else
      render_json({ errors: @vehicle.errors.full_messages }, message: "Error creating vehicle", status: :unprocessable_content)
    end
  end

  # PATCH/PUT /api/v1/vehicles/:id
  def update
    if @vehicle.update(vehicle_params)
      @serializer = VehicleSerializer.render_as_hash(@vehicle, view: :with_customer)
      render_json(@serializer, message: "Vehicle updated successfully")
    else
      render_json({ errors: @vehicle.errors.full_messages }, message: "Error updating vehicle", status: :unprocessable_content)
    end
  end

  # DELETE /api/v1/vehicles/:id
  def destroy
    # TODO: Verificar si tiene turnos o atenciones asociadas
    # if @vehicle.appointments.exists? || @vehicle.service_records.exists?
    #   render_json({ errors: ["Cannot delete vehicle with associated appointments or service records"] }, message: "Error deleting vehicle", status: :unprocessable_content)
    #   return
    # end

    @vehicle.destroy
    render_json({}, message: "Vehicle deleted successfully")
  end

  private

  # Por patente: datos del dueño. Por cliente: último service de cada vehículo (precargado, sin N+1).
  # view=with_customer o license_plate tienen prioridad sobre with_last_service (customer_id)
  def index_view_options
    if params[:view] == "with_customer" || params[:license_plate].present?
      { view: :with_customer }
    elsif params[:customer_id].present?
      { view: :with_last_service, last_services: Vehicle.last_services_for(@vehicles.map(&:id)) }
    else
      {}
    end
  end

  def set_vehicle
    @vehicle = Vehicle.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_json({ errors: [ "Vehicle not found" ] }, message: "Vehicle not found", status: :not_found)
  end

  def vehicle_params
    params.require(:vehicle).permit(:brand, :model, :license_plate, :year, :customer_id, :image)
  end
end
