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
    association :customer, blueprint: CustomerSerializer, view: :summary
    association :vehicle, blueprint: VehicleSerializer, view: :summary
  end
end
