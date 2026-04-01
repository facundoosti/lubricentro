# == Schema Information
#
# Table name: customers
#
#  id         :bigint           not null, primary key
#  address    :text
#  email      :string(100)
#  name       :string(100)      not null
#  phone      :string(20)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_customers_on_email  (email) UNIQUE
#  index_customers_on_name   (name)
#
class CustomerSerializer < Blueprinter::Base
  identifier :id

  fields :name, :phone, :email, :address, :created_at, :updated_at
  # fields :observaciones # Descomentar cuando se agregue el campo a la BD

  field :avatar_url do |customer|
    ActiveStorageUrlHelper.url_for(customer.avatar)
  end

  view :with_vehicles do
    association :vehicles, blueprint: VehicleSerializer, view: :summary
    field :vehicles_count do |customer|
      customer.vehicles.size
    end
  end

  view :summary do
    identifier :id
    fields :name, :phone, :email
    exclude :address
    exclude :created_at
    exclude :updated_at
  end
end
