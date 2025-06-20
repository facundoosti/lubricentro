class Api::V1::ServiceRecordsController < ApplicationController
  before_action :set_service_record, only: [ :show, :update, :destroy ]
  before_action :set_customer, only: [ :index, :create ]
  before_action :set_vehicle, only: [ :index, :create ]

  # GET /api/v1/service_records
  def index
    @service_records = ServiceRecord.all
    @service_records = @service_records.by_customer(params[:customer_id]) if params[:customer_id].present?
    @service_records = @service_records.by_vehicle(params[:vehicle_id]) if params[:vehicle_id].present?
    @service_records = @service_records.by_date_range(params[:start_date], params[:end_date]) if params[:start_date].present? && params[:end_date].present?
    @service_records = @service_records.recent

    render json: {
      success: true,
      data: ServiceRecordSerializer.render_as_hash(@service_records, view: :summary),
      message: "Service records retrieved successfully"
    }
  end

  # GET /api/v1/service_records/:id
  def show
    render json: {
      success: true,
      data: ServiceRecordSerializer.render_as_hash(@service_record, view: :with_details),
      message: "Service record retrieved successfully"
    }
  end

  # POST /api/v1/service_records
  def create
    @service_record = ServiceRecord.new(service_record_params)

    if @service_record.save
      render json: {
        success: true,
        data: ServiceRecordSerializer.render_as_hash(@service_record, view: :with_details),
        message: "Service record created successfully"
      }, status: :created
    else
      render json: {
        success: false,
        errors: @service_record.errors.full_messages,
        message: "Failed to create service record"
      }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/service_records/:id
  def update
    if @service_record.update(service_record_params)
      render json: {
        success: true,
        data: ServiceRecordSerializer.render_as_hash(@service_record, view: :with_details),
        message: "Service record updated successfully"
      }
    else
      render json: {
        success: false,
        errors: @service_record.errors.full_messages,
        message: "Failed to update service record"
      }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/service_records/:id
  def destroy
    @service_record.destroy
    render json: {
      success: true,
      message: "Service record deleted successfully"
    }
  end

  # GET /api/v1/service_records/overdue
  def overdue
    @service_records = ServiceRecord.where("next_service_date < ?", Date.current).recent

    render json: {
      success: true,
      data: ServiceRecordSerializer.render_as_hash(@service_records, view: :summary),
      message: "Overdue service records retrieved successfully"
    }
  end

  # GET /api/v1/service_records/upcoming
  def upcoming
    @service_records = ServiceRecord.where("next_service_date BETWEEN ? AND ?", Date.current, Date.current + 1.month).recent

    render json: {
      success: true,
      data: ServiceRecordSerializer.render_as_hash(@service_records, view: :summary),
      message: "Upcoming service records retrieved successfully"
    }
  end

  # GET /api/v1/service_records/statistics
  def statistics
    total_records = ServiceRecord.count
    total_amount = ServiceRecord.sum(:total_amount)
    overdue_count = ServiceRecord.where("next_service_date < ?", Date.current).count
    upcoming_count = ServiceRecord.where("next_service_date BETWEEN ? AND ?", Date.current, Date.current + 1.month).count

    render json: {
      success: true,
      data: {
        total_records: total_records,
        total_amount: total_amount,
        formatted_total_amount: ActionController::Base.helpers.number_to_currency(total_amount, unit: "$", separator: ",", delimiter: "."),
        overdue_count: overdue_count,
        upcoming_count: upcoming_count
      },
      message: "Statistics retrieved successfully"
    }
  end

  private

  def set_service_record
    @service_record = ServiceRecord.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      errors: [ "Service record not found" ],
      message: "Service record not found"
    }, status: :not_found
  end

  def set_customer
    @customer = Customer.find(params[:customer_id]) if params[:customer_id].present?
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      errors: [ "Customer not found" ],
      message: "Customer not found"
    }, status: :not_found
  end

  def set_vehicle
    @vehicle = Vehicle.find(params[:vehicle_id]) if params[:vehicle_id].present?
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      errors: [ "Vehicle not found" ],
      message: "Vehicle not found"
    }, status: :not_found
  end

  def service_record_params
    params.require(:service_record).permit(:service_date, :total_amount, :notes, :mileage, :next_service_date, :customer_id, :vehicle_id)
  end
end
