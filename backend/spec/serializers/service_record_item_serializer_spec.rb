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

RSpec.describe ServiceRecordItemSerializer do
  let(:service) { create(:service) }
  let(:item) do
    create(:service_record_item, description: 'Cambio de aceite', quantity: 1.5, unit_price: 1_000,
                                 iva_rate: 15.75, service: service, position: 2)
  end
  let(:serialized) { described_class.render_as_hash(item) }

  it 'serializa los campos del ítem' do
    expect(serialized).to eq(
      id: item.id,
      position: 2,
      description: 'Cambio de aceite',
      quantity: BigDecimal('1.5'),
      unit_price: BigDecimal('1000'),
      iva_rate: BigDecimal('15.75'),
      total: BigDecimal('1500'),
      product_id: nil,
      service_id: service.id
    )
  end
end
