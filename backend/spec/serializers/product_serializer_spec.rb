# == Schema Information
#
# Table name: products
#
#  id          :bigint           not null, primary key
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
require 'rails_helper'

RSpec.describe ProductSerializer do
  let(:product) { create(:product, :oil) }

  describe 'default view' do
    let(:serialized) { ProductSerializer.render_as_hash(product) }

    it 'includes all the required fields' do
      expect(serialized.keys).to contain_exactly(
        :id, :name, :sku, :brand, :description, :unit_price, :unit, :stock, :image_url,
        :supplier_id, :supplier_name, :category_id, :category_name, :created_at, :updated_at
      )
    end

    it 'formats the price as a string' do
      expect(serialized[:unit_price]).to eq(product.unit_price.to_s)
    end
  end

  describe 'summary view' do
    let(:serialized) { ProductSerializer.render_as_hash(product, view: :summary) }

    it 'includes only the summary fields' do
      expect(serialized.keys).to contain_exactly(
        :id, :name, :sku, :brand, :unit_price, :unit, :stock, :image_url,
        :supplier_id, :supplier_name, :category_id, :category_name
      )
    end
  end

  describe 'collection serialization' do
    let!(:products) { create_list(:product, 3) }
    let(:serialized) { ProductSerializer.render_as_hash(products, root: :products) }

    it 'serializes a collection under a root key' do
      expect(serialized).to have_key(:products)
      expect(serialized[:products].size).to eq(3)
    end
  end
end
