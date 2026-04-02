# == Schema Information
#
# Table name: services
#
#  id          :bigint           not null, primary key
#  base_price  :decimal(10, 2)   not null
#  description :text
#  embedding   :vector
#  name        :string(100)      not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_services_on_base_price  (base_price)
#  index_services_on_name        (name) UNIQUE
#
class ServiceSerializer < Blueprinter::Base
  identifier :id

  # Default view - campos básicos
  fields :name, :description, :created_at, :updated_at
  field :base_price do |service|
    service.base_price.to_s
  end

  # Summary view - solo información esencial (exclude default fields)
  view :summary do
    exclude :description
    exclude :created_at
    exclude :updated_at
  end

  # Transform base_price to formatted string in some views
  view :formatted do
    exclude :base_price
    field :formatted_price do |service|
      service.formatted_price
    end
  end

  # Future: with_service_records view cuando implementemos ServiceRecord
  # view :with_service_records do
  #   fields :name, :description, :base_price, :created_at, :updated_at
  #   association :service_records, blueprint: ServiceRecordSerializer, view: :summary
  # end
end
