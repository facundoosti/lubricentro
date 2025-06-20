class Api::V1::AppointmentsController < ApplicationController
  before_action :set_appointment, only: [ :show, :update, :destroy, :confirm, :complete, :cancel ]

  # GET /api/v1/appointments
  def index
    @appointments = Appointment.includes(:customer, :vehicle)

    # Filtros
    @appointments = @appointments.by_customer(params[:customer_id]) if params[:customer_id].present?
    @appointments = @appointments.by_vehicle(params[:vehicle_id]) if params[:vehicle_id].present?
    @appointments = @appointments.where(status: params[:status]) if params[:status].present?

    # Filtro por rango de fechas
    if params[:start_date].present? && params[:end_date].present?
      @appointments = @appointments.by_date_range(
        Date.parse(params[:start_date]),
        Date.parse(params[:end_date])
      )
    end

    # Ordenamiento
    @appointments = @appointments.order(scheduled_at: :asc)

    # Paginación
    @pagy, @appointments = pagy(@appointments, items: params[:per_page] || 20)

    render json: {
      success: true,
      data: AppointmentSerializer.render_as_hash(@appointments, view: :formatted),
      pagination: pagy_metadata(@pagy),
      message: "Appointments retrieved successfully"
    }
  end

  # GET /api/v1/appointments/:id
  def show
    render json: {
      success: true,
      data: AppointmentSerializer.render_as_hash(@appointment, view: :with_details),
      message: "Appointment retrieved successfully"
    }
  end

  # POST /api/v1/appointments
  def create
    @appointment = Appointment.new(appointment_params)

    if @appointment.save
      render json: {
        success: true,
        data: AppointmentSerializer.render_as_hash(@appointment, view: :formatted),
        message: "Appointment created successfully"
      }, status: :created
    else
      render json: {
        success: false,
        errors: @appointment.errors.full_messages,
        message: "Failed to create appointment"
      }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/appointments/:id
  def update
    if @appointment.update(appointment_params)
      render json: {
        success: true,
        data: AppointmentSerializer.render_as_hash(@appointment, view: :formatted),
        message: "Appointment updated successfully"
      }
    else
      render json: {
        success: false,
        errors: @appointment.errors.full_messages,
        message: "Failed to update appointment"
      }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/appointments/:id
  def destroy
    if @appointment.destroy
      render json: {
        success: true,
        message: "Appointment deleted successfully"
      }
    else
      render json: {
        success: false,
        errors: @appointment.errors.full_messages,
        message: "Failed to delete appointment"
      }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/appointments/upcoming
  def upcoming
    @appointments = Appointment.includes(:customer, :vehicle).upcoming
    @pagy, @appointments = pagy(@appointments, items: params[:per_page] || 10)

    render json: {
      success: true,
      data: AppointmentSerializer.render_as_hash(@appointments, view: :formatted),
      pagination: pagy_metadata(@pagy),
      message: "Upcoming appointments retrieved successfully"
    }
  end

  # PATCH /api/v1/appointments/:id/confirm
  def confirm
    if @appointment.can_be_confirmed?
      @appointment.update(status: "confirmed")
      render json: {
        success: true,
        data: AppointmentSerializer.render_as_hash(@appointment, view: :formatted),
        message: "Appointment confirmed successfully"
      }
    else
      render json: {
        success: false,
        errors: [ "Appointment cannot be confirmed" ],
        message: "Failed to confirm appointment"
      }, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/appointments/:id/complete
  def complete
    if @appointment.can_be_completed?
      @appointment.update(status: "completed")
      render json: {
        success: true,
        data: AppointmentSerializer.render_as_hash(@appointment, view: :formatted),
        message: "Appointment completed successfully"
      }
    else
      render json: {
        success: false,
        errors: [ "Appointment cannot be completed" ],
        message: "Failed to complete appointment"
      }, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/appointments/:id/cancel
  def cancel
    if @appointment.can_be_cancelled?
      @appointment.update(status: "cancelled")
      render json: {
        success: true,
        data: AppointmentSerializer.render_as_hash(@appointment, view: :formatted),
        message: "Appointment cancelled successfully"
      }
    else
      render json: {
        success: false,
        errors: [ "Appointment cannot be cancelled" ],
        message: "Failed to cancel appointment"
      }, status: :unprocessable_entity
    end
  end

  private

  def set_appointment
    @appointment = Appointment.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      errors: [ "Appointment not found" ],
      message: "Appointment not found"
    }, status: :not_found
  end

  def appointment_params
    params.require(:appointment).permit(:scheduled_at, :status, :notes, :customer_id, :vehicle_id)
  end
end
