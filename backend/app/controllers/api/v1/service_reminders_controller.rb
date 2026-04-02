class Api::V1::ServiceRemindersController < ApplicationController
  # GET /api/v1/service_reminders
  def index
    @reminders = ServiceReminder.includes(:customer, :vehicle, :service_record)

    if params[:search].present?
      term = "%#{params[:search]}%"
      @reminders = @reminders.joins(:customer, :vehicle)
        .where(
          "customers.name ILIKE :q OR vehicles.license_plate ILIKE :q",
          q: term
        )
    end

    @reminders = @reminders.where(status: params[:status]) if params[:status].present?

    if params[:start_date].present? && params[:end_date].present?
      @reminders = @reminders.where(created_at: params[:start_date].to_date.beginning_of_day..params[:end_date].to_date.end_of_day)
    end

    @reminders = @reminders.order(created_at: :desc)
    @pagy, @reminders = pagy(@reminders, items: safe_per_page(params[:per_page]))

    serialized = ServiceReminderSerializer.render_as_hash(@reminders)
    render_json({ service_reminders: serialized })
  end

  # GET /api/v1/service_reminders/statistics
  def statistics
    now = Time.current

    render_json({
      sent_this_month: ServiceReminder.sent.where(sent_at: now.beginning_of_month..now.end_of_month).count,
      pending:         ServiceReminder.where(status: "pending").count,
      failed:          ServiceReminder.where(status: "failed").count
    })
  end
end
