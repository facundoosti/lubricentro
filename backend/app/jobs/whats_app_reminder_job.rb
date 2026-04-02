class WhatsAppReminderJob < ApplicationJob
  queue_as :notifications

  retry_on StandardError, wait: 5.minutes, attempts: 3

  def perform(service_record_id)
    service_record = ServiceRecord.find(service_record_id)
    customer = service_record.customer
    vehicle  = service_record.vehicle

    reminder = ServiceReminder.create!(
      service_record: service_record,
      customer: customer,
      vehicle: vehicle,
      status: "pending"
    )

    WhatsAppService.send_reminder_template(
      phone:    customer.phone,
      name:     customer.name,
      vehicle:  "#{vehicle.brand} #{vehicle.model}",
      due_date: service_record.next_service_date.strftime("%d/%m/%Y")
    )

    reminder.update!(status: "sent", sent_at: Time.current)
  rescue => e
    reminder&.update!(status: "failed", error_message: e.message)
    raise
  end
end
