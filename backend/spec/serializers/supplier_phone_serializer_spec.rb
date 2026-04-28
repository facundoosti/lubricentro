require 'rails_helper'

RSpec.describe SupplierPhoneSerializer do
  let(:supplier_phone) { create(:supplier_phone, company_name: "Empresa S.A.", notes: "Proveedor principal") }

  describe 'default view' do
    subject(:serialized) { described_class.render_as_hash(supplier_phone) }

    it 'includes all expected fields' do
      expect(serialized.keys).to include(:id, :phone, :company_name, :notes, :created_at, :updated_at)
    end

    it 'returns correct values' do
      expect(serialized[:company_name]).to eq("Empresa S.A.")
      expect(serialized[:notes]).to eq("Proveedor principal")
      expect(serialized[:phone]).to eq(supplier_phone.phone)
    end
  end

  describe 'collection serialization' do
    let!(:supplier_phones) { create_list(:supplier_phone, 2) }

    it 'serializes a collection under a root key' do
      result = described_class.render_as_hash(supplier_phones, root: :supplier_phones)
      expect(result).to have_key(:supplier_phones)
      expect(result[:supplier_phones].size).to eq(2)
    end
  end
end
