# == Schema Information
#
# Table name: service_record_services
#
#  id                :bigint           not null, primary key
#  quantity          :integer          default(1), not null
#  unit_price        :decimal(10, 2)   not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  service_id        :bigint           not null
#  service_record_id :bigint           not null
#
# Indexes
#
#  index_service_record_services_on_quantity           (quantity)
#  index_service_record_services_on_service_id         (service_id)
#  index_service_record_services_on_service_record_id  (service_record_id)
#  index_service_record_services_on_unit_price         (unit_price)
#  index_service_record_services_unique                (service_record_id,service_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (service_id => services.id)
#  fk_rails_...  (service_record_id => service_records.id)
#
FactoryBot.define do
  factory :service_record_service do
    association :service_record
    association :service
    quantity { rand(1..3) }
    unit_price { rand(50.0..500.0).round(2) }
  end
end
