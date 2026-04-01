# == Schema Information
#
# Table name: service_record_products
#
#  id                :bigint           not null, primary key
#  quantity          :integer          default(1), not null
#  unit_price        :decimal(10, 2)   not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  product_id        :bigint           not null
#  service_record_id :bigint           not null
#
# Indexes
#
#  index_service_record_products_on_product_id         (product_id)
#  index_service_record_products_on_quantity           (quantity)
#  index_service_record_products_on_service_record_id  (service_record_id)
#  index_service_record_products_on_unit_price         (unit_price)
#  index_service_record_products_unique                (service_record_id,product_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (product_id => products.id)
#  fk_rails_...  (service_record_id => service_records.id)
#
require 'rails_helper'

RSpec.describe ServiceRecordProduct, type: :model do
  describe 'associations' do
    it { should belong_to(:service_record) }
    it { should belong_to(:product) }
  end

  describe 'validations' do
    subject { build(:service_record_product) }

    it { should validate_presence_of(:quantity) }
    it { should validate_numericality_of(:quantity).is_greater_than(0) }
    it { should validate_presence_of(:unit_price) }
    it { should validate_numericality_of(:unit_price).is_greater_than_or_equal_to(0) }

    it 'validates uniqueness of service_record_id scoped to product_id' do
      existing = create(:service_record_product)
      duplicate = build(:service_record_product, service_record: existing.service_record, product: existing.product)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:service_record_id]).to be_present
    end
  end

  describe 'callbacks' do
    describe 'before_save :set_unit_price_from_product' do
      it 'sets unit_price from product when product changes' do
        product = create(:product, unit_price: 99.99)
        srp = create(:service_record_product, product: product)
        expect(srp.unit_price).to eq(product.unit_price)
      end
    end
  end

  describe 'methods' do
    let(:srp) { build(:service_record_product, quantity: 3, unit_price: 50.0) }

    describe '#total_price' do
      it 'returns quantity * unit_price' do
        expect(srp.total_price).to eq(150.0)
      end
    end

    describe '#formatted_total_price' do
      it 'returns a formatted currency string' do
        expect(srp.formatted_total_price).to be_a(String)
        expect(srp.formatted_total_price).to include('$')
      end
    end

    describe '#formatted_unit_price' do
      it 'returns a formatted currency string' do
        expect(srp.formatted_unit_price).to be_a(String)
        expect(srp.formatted_unit_price).to include('$')
      end
    end
  end

  describe 'factory' do
    it 'has a valid default factory' do
      expect(build(:service_record_product)).to be_valid
    end
  end
end
