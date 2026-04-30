# == Schema Information
#
# Table name: products
#
#  id          :bigint           not null, primary key
#  active      :boolean          default(TRUE), not null
#  brand       :string(100)
#  description :text
#  embedding   :vector(768)
#  name        :string(100)      not null
#  sku         :string(50)
#  stock       :integer          default(0), not null
#  unit        :string(50)
#  unit_price  :decimal(10, 2)   not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  category_id :bigint
#  supplier_id :bigint
#
# Indexes
#
#  index_products_on_category_id  (category_id)
#  index_products_on_name         (name) UNIQUE
#  index_products_on_sku          (sku) UNIQUE WHERE (sku IS NOT NULL)
#  index_products_on_supplier_id  (supplier_id)
#  index_products_on_unit_price   (unit_price)
#
# Foreign Keys
#
#  fk_rails_...  (category_id => categories.id)
#  fk_rails_...  (supplier_id => suppliers.id)
#
class ProductSerializer < Blueprinter::Base
  identifier :id

  fields :name, :sku, :description, :unit, :brand, :stock, :active, :created_at, :updated_at

  field :unit_price do |product|
    product.unit_price.to_s
  end

  field :image_url do |product|
    ActiveStorageUrlHelper.url_for(product.image)
  end

  field :supplier_id do |product|
    product.supplier_id
  end

  field :supplier_name do |product|
    product.supplier&.name
  end

  field :category_id do |product|
    product.category_id
  end

  field :category_name do |product|
    product.category&.name
  end

  view :summary do
    exclude :description
    exclude :created_at
    exclude :updated_at
  end
end
