class Api::V1::ServicesController < ApplicationController
  before_action :set_service, only: [ :show, :update, :destroy ]

  # GET /api/v1/services
  def index
    @services = Service.all
    @services = @services.by_name(params[:search]) if params[:search].present?
    @services = @services.by_price_range(params[:min_price], params[:max_price]) if params[:min_price].present? && params[:max_price].present?

    # Paginación con Pagy
    @pagy, @services = pagy(@services, items: safe_per_page(params[:per_page]))
    @serializer = ServiceSerializer.render_as_hash(@services, root: :services)
    render_json(@serializer)
  end

  # GET /api/v1/services/:id
  def show
    @serializer = ServiceSerializer.render_as_hash(@service)
    render_json(@serializer)
  end

  # POST /api/v1/services
  def create
    @service = Service.new(service_params)

    if @service.save
      @serializer = ServiceSerializer.render_as_hash(@service)
      render_json(@serializer, message: "Service created successfully", status: :created)
    else
      render_json({}, message: "Error creating service", errors: @service.errors.full_messages, status: :unprocessable_entity)
    end
  end

  # PATCH/PUT /api/v1/services/:id
  def update
    if @service.update(service_params)
      @serializer = ServiceSerializer.render_as_hash(@service)
      render_json(@serializer, message: "Service updated successfully")
    else
      render_json({}, message: "Error updating service", errors: @service.errors.full_messages, status: :unprocessable_entity)
    end
  end

  # DELETE /api/v1/services/:id
  def destroy
    # Verificar si tiene service_records asociados (cuando se implemente)
    # if @service.service_records.exists?
    #   render_json({ errors: [ "Cannot delete service with associated service records" ] }, message: "Error deleting service", status: :unprocessable_entity)
    #   return
    # end

    @service.destroy
    render_json({}, message: "Service deleted successfully")
  end

  private

  def set_service
    @service = Service.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_json({}, message: "Service not found", errors: [ "Service not found" ], status: :not_found)
  end

  def service_params
    params.require(:service).permit(:name, :description, :base_price)
  end
end
