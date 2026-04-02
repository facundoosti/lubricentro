FactoryBot.define do
  factory :budget do
    date { Date.current }
    status { "draft" }
    notes { Faker::Lorem.sentence }
    card_surcharge_percentage { 0 }
    vehicle_description { nil }

    association :customer
    association :vehicle

    trait :sent do
      status { "sent" }
    end

    trait :approved do
      status { "approved" }
    end

    trait :rejected do
      status { "rejected" }
    end

    trait :with_items do
      after(:create) do |budget|
        create(:budget_item, budget: budget, quantity: 2, unit_price: 100)
        create(:budget_item, budget: budget, quantity: 1, unit_price: 50)
      end
    end

    trait :with_surcharge do
      card_surcharge_percentage { 10 }
    end
  end
end
