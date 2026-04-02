# == Schema Information
#
# Table name: service_reminders
#
#  id                :bigint           not null, primary key
#  channel           :string           default("whatsapp"), not null
#  error_message     :text
#  sent_at           :datetime
#  status            :string           default("pending"), not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  customer_id       :bigint           not null
#  service_record_id :bigint           not null
#  vehicle_id        :bigint           not null
#
# Indexes
#
#  index_service_reminders_on_customer_id                (customer_id)
#  index_service_reminders_on_service_record_id          (service_record_id)
#  index_service_reminders_on_vehicle_id                 (vehicle_id)
#  index_service_reminders_on_vehicle_id_and_created_at  (vehicle_id,created_at)
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => customers.id)
#  fk_rails_...  (service_record_id => service_records.id)
#  fk_rails_...  (vehicle_id => vehicles.id)
#
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
