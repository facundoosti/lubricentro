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
require 'rails_helper'

RSpec.describe SupplierSerializer do
  let(:supplier) { create(:supplier, :with_contact) }

  describe 'default view' do
    subject(:serialized) { described_class.render_as_hash(supplier) }

    it 'includes all expected fields' do
      expect(serialized.keys).to include(:id, :name, :cuit, :email, :phone, :address, :notes, :created_at, :updated_at, :products_count)
    end

    it 'returns correct values' do
      expect(serialized[:name]).to eq(supplier.name)
      expect(serialized[:email]).to eq(supplier.email)
      expect(serialized[:cuit]).to eq(supplier.cuit)
    end

    it 'returns products_count as 0 when no products' do
      expect(serialized[:products_count]).to eq(0)
    end

    context 'when supplier has products' do
      before { create_list(:product, 3, supplier: supplier) }

      it 'returns correct products_count' do
        expect(described_class.render_as_hash(supplier)[:products_count]).to eq(3)
      end
    end
  end

  describe 'summary view' do
    subject(:serialized) { described_class.render_as_hash(supplier, view: :summary) }

    it 'excludes notes, created_at, updated_at' do
      expect(serialized.keys).not_to include(:notes, :created_at, :updated_at)
    end

    it 'includes basic fields' do
      expect(serialized.keys).to include(:id, :name, :email, :phone, :cuit, :address)
    end
  end

  describe 'collection serialization' do
    let!(:suppliers) { create_list(:supplier, 3) }

    it 'serializes a collection under a root key' do
      result = described_class.render_as_hash(suppliers, root: :suppliers)
      expect(result).to have_key(:suppliers)
      expect(result[:suppliers].size).to eq(3)
    end
  end
end
