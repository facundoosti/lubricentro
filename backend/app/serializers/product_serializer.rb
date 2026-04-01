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
