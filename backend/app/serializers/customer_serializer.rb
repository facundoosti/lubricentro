class CustomerSerializer < Blueprinter::Base
  identifier :id

  fields :name, :phone, :email, :address, :created_at, :updated_at
  # fields :observaciones # Descomentar cuando se agregue el campo a la BD

  field :vehicles_count do |customer|
    customer.vehicles.count
  end

  view :with_vehicles do
    association :vehicles, blueprint: VehicleSerializer, view: :summary
    field :vehicles_count do |customer|
      customer.vehicles.count
    end
  end

  view :summary do
    identifier :id
    fields :name, :phone, :email
    exclude :address
    exclude :created_at
    exclude :updated_at
    field :vehicles_count do |customer|
      customer.vehicles.count
    end
  end
end
