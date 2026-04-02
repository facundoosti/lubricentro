class ServiceReminderJob < ApplicationJob
  queue_as :notifications

  def perform(days_ahead: 7)
    candidates = ServiceRecord.pending_reminders(days_ahead)

    Rails.logger.info("[ServiceReminderJob] Found #{candidates.count} candidates for reminder")

    candidates.each do |service_record|
      WhatsAppReminderJob.perform_later(service_record.id)
    end
  end
end
