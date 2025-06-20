class ServiceRecordSerializer < Blueprinter::Base
  identifier :id

  field :service_date do |obj|
    obj.service_date&.iso8601
  end
  field :next_service_date do |obj|
    obj.next_service_date&.iso8601
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
    field :created_at
    field :updated_at
    field :formatted_total_amount
    field :formatted_service_date
    field :formatted_next_service_date
    field :is_overdue do |obj|
      obj.is_overdue?
    end
    field :days_until_next_service
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
