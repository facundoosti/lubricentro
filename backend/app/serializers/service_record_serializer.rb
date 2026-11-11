# == Schema Information
#
# Table name: service_records
#
#  id                :bigint           not null, primary key
#  mileage           :integer
#  next_service_date :date
#  notes             :text
#  service_date      :date
#  total_amount      :decimal(, )      default(0.0)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  appointment_id    :bigint
#  budget_id         :bigint
#  customer_id       :bigint           not null
#  vehicle_id        :bigint           not null
#
# Indexes
#
#  index_service_records_on_appointment_id  (appointment_id) UNIQUE
#  index_service_records_on_budget_id       (budget_id)
#  index_service_records_on_customer_id     (customer_id)
#  index_service_records_on_vehicle_id      (vehicle_id)
#
# Foreign Keys
#
#  fk_rails_...  (appointment_id => appointments.id)
#  fk_rails_...  (budget_id => budgets.id) ON DELETE => nullify
#  fk_rails_...  (customer_id => customers.id)
#  fk_rails_...  (vehicle_id => vehicles.id)
#
class ServiceRecordSerializer < Blueprinter::Base
  identifier :id

  field :service_date do |obj|
    obj.service_date&.iso8601
  end
  field :next_service_date do |obj|
    obj.next_service_date&.iso8601
  end

  field :photos_urls do |record|
    ActiveStorageUrlHelper.urls_for(record.photos)
  end

  view :default do
    field :total_amount
    field :notes
    field :mileage
    field :customer_id
    field :vehicle_id
    field :created_at
    field :updated_at
  end

  view :summary do
    field :total_amount
    field :mileage
    field :customer_id
    field :vehicle_id
    field :service_date do |obj|
      obj.service_date&.iso8601
    end
    field :next_service_date do |obj|
      obj.next_service_date&.iso8601
    end
    exclude :created_at
    exclude :updated_at
    exclude :notes
  end

  view :with_details do
    field :total_amount
    field :notes
    field :mileage
    field :customer_id
    field :vehicle_id
    field :appointment_id
    field :created_at
    field :updated_at
    field :formatted_total_amount
    field :formatted_service_date
    field :formatted_next_service_date
    field :is_overdue do |obj|
      obj.is_overdue?
    end
    field :days_until_next_service
    association :customer, blueprint: CustomerSerializer, view: :summary
    association :vehicle, blueprint: VehicleSerializer, view: :summary
    field :budget_id
    field :subtotal_net do |obj|
      obj.subtotal_net.to_d.to_s
    end
    field :total_iva do |obj|
      obj.total_iva.to_d.to_s
    end
    field :exempt_total do |obj|
      obj.exempt_total.to_d.to_s
    end
    field :iva_breakdown do |obj|
      obj.iva_breakdown.map { |row| row.transform_values { |v| v.to_d.to_s } }
    end
    association :items, blueprint: ServiceRecordItemSerializer
  end

  view :formatted do
    field :total_amount
    field :mileage
    field :customer_id
    field :vehicle_id
    field :formatted_service_date
    field :formatted_next_service_date
    field :formatted_total_amount
    exclude :is_overdue
    exclude :days_until_next_service
    exclude :created_at
    exclude :updated_at
  end

  # Vista especial para incluir asociaciones completas
  view :with_associations do
    field :total_amount
    field :notes
    field :mileage
    field :customer_id
    field :vehicle_id
    field :service_date do |obj|
      obj.service_date&.iso8601
    end
    field :next_service_date do |obj|
      obj.next_service_date&.iso8601
    end
    field :created_at
    field :updated_at
    field :formatted_total_amount
    field :formatted_service_date
    field :formatted_next_service_date
    field :is_overdue do |obj|
      obj.is_overdue?
    end
    field :days_until_next_service do |obj|
      obj.days_until_next_service
    end
    association :customer, blueprint: CustomerSerializer, view: :summary
    association :vehicle, blueprint: VehicleSerializer, view: :summary
  end
end
