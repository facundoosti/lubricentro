# == Schema Information
#
# Table name: products
#
#  id          :bigint           not null, primary key
#  description :text
#  embedding   :vector(768)
#  name        :string(100)      not null
#  unit        :string(50)
#  unit_price  :decimal(10, 2)   not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_products_on_name        (name) UNIQUE
#  index_products_on_unit_price  (unit_price)
#
class ProductSerializer < Blueprinter::Base
  identifier :id

  fields :name, :description, :unit, :created_at, :updated_at

  field :unit_price do |product|
    product.unit_price.to_s
  end

  field :image_url do |product|
    ActiveStorageUrlHelper.url_for(product.image)
  end

  view :summary do
    exclude :description
    exclude :created_at
    exclude :updated_at
  end
end
