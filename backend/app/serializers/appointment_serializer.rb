# == Schema Information
#
# Table name: appointments
#
#  id           :bigint           not null, primary key
#  notes        :text
#  scheduled_at :datetime         not null
#  status       :string           default("scheduled"), not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  customer_id  :bigint           not null
#  vehicle_id   :bigint           not null
#
# Indexes
#
#  index_appointments_on_customer_id                   (customer_id)
#  index_appointments_on_customer_id_and_scheduled_at  (customer_id,scheduled_at)
#  index_appointments_on_scheduled_at                  (scheduled_at)
#  index_appointments_on_status                        (status)
#  index_appointments_on_vehicle_id                    (vehicle_id)
#  index_appointments_on_vehicle_id_and_scheduled_at   (vehicle_id,scheduled_at)
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => customers.id)
#  fk_rails_...  (vehicle_id => vehicles.id)
#
class AppointmentSerializer < Blueprinter::Base
  identifier :id

  view :default do
    fields :scheduled_at, :status, :notes, :created_at, :updated_at
    association :customer, blueprint: CustomerSerializer, view: :summary
    association :vehicle, blueprint: VehicleSerializer, view: :summary
  end

  view :summary do
    fields :scheduled_at, :status
    exclude :created_at
    exclude :updated_at
    exclude :notes
    association :customer, blueprint: CustomerSerializer, view: :summary
    association :vehicle, blueprint: VehicleSerializer, view: :summary
  end

  view :with_details do
    fields :scheduled_at, :status, :notes, :created_at, :updated_at
    association :customer, blueprint: CustomerSerializer, view: :default
    association :vehicle, blueprint: VehicleSerializer, view: :default
  end

  view :formatted do
    fields :scheduled_at, :status, :notes
    exclude :created_at
    exclude :updated_at
    field :display_status do |appointment|
      appointment.display_status
    end
    field :formatted_date do |appointment|
      appointment.scheduled_at.strftime("%d/%m/%Y %H:%M")
    end
    field :can_be_cancelled do |appointment|
      appointment.can_be_cancelled?
    end
    field :can_be_confirmed do |appointment|
      appointment.can_be_confirmed?
    end
    field :can_be_completed do |appointment|
      appointment.can_be_completed?
    end
    field :is_overdue do |appointment|
      appointment.is_overdue?
    end
    field :service_record_id do |appointment|
      appointment.service_record&.id
    end
    field :has_service_record do |appointment|
      appointment.service_record.present?
    end
    association :customer, blueprint: CustomerSerializer, view: :summary
    association :vehicle, blueprint: VehicleSerializer, view: :summary
  end
end
