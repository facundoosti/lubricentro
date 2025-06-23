FactoryBot.define do
  factory :service_record_product do
    association :service_record
    association :product
    quantity { rand(1..5) }
    unit_price { rand(10.0..200.0).round(2) }
  end
end
