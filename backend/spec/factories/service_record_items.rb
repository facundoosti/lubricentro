# == Schema Information
#
# Table name: service_record_items
#
#  id                :bigint           not null, primary key
#  description       :string(500)      not null
#  iva_rate          :decimal(4, 2)
#  margin_percentage :decimal(6, 2)    default(0.0), not null
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
FactoryBot.define do
  factory :service_record_item do
    description { Faker::Commerce.product_name }
    quantity { 1 }
    unit_price { rand(10.0..500.0).round(2) }
    position { 0 }

    association :service_record
  end
end
