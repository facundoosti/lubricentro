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
#  customer_id       :bigint           not null
#  vehicle_id        :bigint           not null
#
# Indexes
#
#  index_service_records_on_appointment_id  (appointment_id) UNIQUE
#  index_service_records_on_customer_id     (customer_id)
#  index_service_records_on_vehicle_id      (vehicle_id)
#
# Foreign Keys
#
#  fk_rails_...  (appointment_id => appointments.id)
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
    field :service_record_services do |obj|
      obj.service_record_services.map do |srs|
        {
          id: srs.id,
          service_id: srs.service_id,
          name: srs.service&.name,
          quantity: srs.quantity,
          unit_price: srs.unit_price,
          total_price: srs.total_price
        }
      end
    end
    field :service_record_products do |obj|
      obj.service_record_products.map do |srp|
        {
          id: srp.id,
          product_id: srp.product_id,
          name: srp.product&.name,
          quantity: srp.quantity,
          unit_price: srp.unit_price,
          total_price: srp.total_price
        }
      end
    end
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
