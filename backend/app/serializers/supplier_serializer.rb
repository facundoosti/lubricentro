# == Schema Information
#
# Table name: suppliers
#
#  id         :bigint           not null, primary key
#  address    :string(200)
#  cuit       :string(20)
#  email      :string(100)
#  name       :string(150)      not null
#  notes      :text
#  phone      :string(30)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_suppliers_on_cuit  (cuit) UNIQUE WHERE (cuit IS NOT NULL)
#  index_suppliers_on_name  (name) UNIQUE
#
class SupplierSerializer < Blueprinter::Base
  identifier :id

  fields :name, :cuit, :email, :phone, :address, :notes, :created_at, :updated_at

  field :products_count do |supplier|
    supplier.respond_to?(:products_count) ? supplier.products_count : supplier.products.size
  end

  view :summary do
    exclude :notes
    exclude :created_at
    exclude :updated_at
  end
end
