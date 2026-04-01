# == Schema Information
#
# Table name: products
#
#  id          :bigint           not null, primary key
#  description :text
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
require 'rails_helper'

RSpec.describe ProductSerializer do
  let(:product) { create(:product, :oil) }

  describe 'default view' do
    let(:serialized) { ProductSerializer.render_as_hash(product) }

    it 'includes all the required fields' do
      expect(serialized.keys).to contain_exactly(
        :id, :name, :description, :unit_price, :unit, :image_url, :created_at, :updated_at
      )
    end

    it 'formats the price as a string' do
      expect(serialized[:unit_price]).to eq(product.unit_price.to_s)
    end
  end

  describe 'summary view' do
    let(:serialized) { ProductSerializer.render_as_hash(product, view: :summary) }

    it 'includes only the summary fields' do
      expect(serialized.keys).to contain_exactly(:id, :name, :unit_price, :unit, :image_url)
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
