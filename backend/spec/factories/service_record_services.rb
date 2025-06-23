FactoryBot.define do
  factory :service_record_service do
    association :service_record
    association :service
    quantity { rand(1..3) }
    unit_price { rand(50.0..500.0).round(2) }
  end
end
