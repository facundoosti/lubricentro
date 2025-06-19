class VehicleSerializer < Blueprinter::Base
  identifier :id

  fields :brand, :model, :license_plate, :year, :customer_id, :created_at, :updated_at

  # Add customer name for convenience
  field :customer_name do |vehicle|
    vehicle.customer&.name
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
