require 'rails_helper'

RSpec.describe ProductSerializer do
  let(:product) { create(:product, :oil) }

  describe 'default view' do
    let(:serialized) { ProductSerializer.render_as_hash(product) }

    it 'includes all the required fields' do
      expect(serialized.keys).to contain_exactly(
        :id, :name, :description, :unit_price, :unit, :created_at, :updated_at
      )
    end

    it 'formats the price as a string' do
      expect(serialized[:unit_price]).to eq(product.unit_price.to_s)
    end
  end

  describe 'summary view' do
    let(:serialized) { ProductSerializer.render_as_hash(product, view: :summary) }

    it 'includes only the summary fields' do
      expect(serialized.keys).to contain_exactly(:id, :name, :unit_price, :unit)
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
