FactoryBot.define do
  factory :budget_item do
    description { Faker::Commerce.product_name }
    quantity { 1 }
    unit_price { rand(10.0..500.0).round(2) }
    position { 0 }

    association :budget
  end
end
