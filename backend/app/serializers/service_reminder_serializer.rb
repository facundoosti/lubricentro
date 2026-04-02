class ServiceReminderSerializer < Blueprinter::Base
  identifier :id

  fields :status, :channel, :error_message

  field :sent_at do |obj|
    obj.sent_at&.iso8601
  end

  field :created_at do |obj|
    obj.created_at&.iso8601
  end

  association :customer, blueprint: CustomerSerializer, view: :summary
  association :vehicle,  blueprint: VehicleSerializer,  view: :summary

  field :service_record do |obj|
    {
      id:                   obj.service_record.id,
      next_service_date:    obj.service_record.next_service_date&.iso8601,
      service_date:         obj.service_record.service_date&.iso8601
    }
  end
end
