# == Schema Information
#
# Table name: vehicles
#
#  id            :bigint           not null, primary key
#  brand         :string           not null
#  license_plate :string           not null
#  model         :string           not null
#  year          :string           not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  customer_id   :bigint           not null
#
# Indexes
#
#  index_vehicles_on_customer_id    (customer_id)
#  index_vehicles_on_license_plate  (license_plate) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => customers.id)
#
class VehicleSerializer < Blueprinter::Base
  identifier :id

  fields :brand, :model, :license_plate, :year, :customer_id, :created_at, :updated_at

  # Add customer name for convenience
  field :customer_name do |vehicle|
    vehicle.customer&.name
  end

  field :image_url do |vehicle|
    ActiveStorageUrlHelper.url_for(vehicle.image)
  end

  view :with_customer do
    association :customer, blueprint: CustomerSerializer, view: :summary
    field :appointments_count do |vehicle|
      0 # TODO: vehicle.appointments.count when appointments model is ready
    end
    field :service_records_count do |vehicle|
      0 # TODO: vehicle.service_records.count when service_records model is ready
    end
  end

  view :summary do
    identifier :id
    fields :brand, :model, :license_plate, :year
    exclude :customer_id
    exclude :customer_name
    exclude :created_at
    exclude :updated_at
  end
end
