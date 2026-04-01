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
FactoryBot.define do
  factory :service_record_product do
    association :service_record
    association :product
    quantity { rand(1..5) }
    unit_price { rand(10.0..200.0).round(2) }
  end
end
