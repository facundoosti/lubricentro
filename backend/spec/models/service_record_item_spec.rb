# == Schema Information
#
# Table name: service_record_items
#
#  id                :bigint           not null, primary key
#  description       :string(500)      not null
#  iva_rate          :decimal(4, 2)
#  position          :integer          default(0), not null
#  quantity          :decimal(10, 2)   default(1.0), not null
#  total             :decimal(12, 2)   default(0.0), not null
#  unit_price        :decimal(12, 2)   default(0.0), not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  product_id        :bigint
#  service_id        :bigint
#  service_record_id :bigint           not null
#
# Indexes
#
#  index_service_record_items_on_product_id                      (product_id)
#  index_service_record_items_on_service_id                      (service_id)
#  index_service_record_items_on_service_record_id_and_position  (service_record_id,position)
#
# Foreign Keys
#
#  fk_rails_...  (product_id => products.id) ON DELETE => nullify
#  fk_rails_...  (service_id => services.id) ON DELETE => nullify
#  fk_rails_...  (service_record_id => service_records.id)
#
require 'rails_helper'

RSpec.describe ServiceRecordItem, type: :model do
  subject(:item) { build(:service_record_item) }

  describe 'associations' do
    it { is_expected.to belong_to(:service_record) }
    it { is_expected.to belong_to(:product).optional }
    it { is_expected.to belong_to(:service).optional }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:description) }
    it { is_expected.to validate_length_of(:description).is_at_most(500) }
    it { is_expected.to validate_presence_of(:quantity) }
    it { is_expected.to validate_numericality_of(:quantity).is_greater_than(0) }
    it { is_expected.to validate_presence_of(:unit_price) }
    it { is_expected.to validate_numericality_of(:unit_price).is_greater_than_or_equal_to(0) }

    it 'acepta cantidades decimales' do
      expect(create(:service_record_item, quantity: 1.5).reload.quantity).to eq(BigDecimal('1.5'))
    end
  end

  describe 'origen en el catálogo' do
    it 'se puede vincular a un producto o a un servicio, o a ninguno (texto libre)' do
      expect(create(:service_record_item, product: create(:product))).to be_persisted
      expect(create(:service_record_item, service: create(:service))).to be_persisted
      expect(create(:service_record_item, product: nil, service: nil)).to be_persisted
    end

    it 'queda sin producto si se borra el producto' do
      product = create(:product)
      item = create(:service_record_item, product: product)
      product.destroy!
      expect(item.reload.product_id).to be_nil
    end

    it 'queda sin servicio si se borra el servicio' do
      service = create(:service)
      item = create(:service_record_item, service: service)
      service.destroy!
      expect(item.reload.service_id).to be_nil
    end
  end

  describe 'default_scope' do
    it 'ordena por posición' do
      record = create(:service_record)
      second = create(:service_record_item, service_record: record, position: 1)
      first = create(:service_record_item, service_record: record, position: 0)
      expect(record.reload.items.to_a).to eq([ first, second ])
    end
  end
end
