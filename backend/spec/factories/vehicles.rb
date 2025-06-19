FactoryBot.define do
  factory :vehicle do
    sequence(:brand) { |n| [ "Toyota", "Honda", "Ford", "Chevrolet", "Nissan" ][n % 5] }
    sequence(:model) { |n| [ "Corolla", "Civic", "Focus", "Cruze", "Sentra" ][n % 5] }
    sequence(:license_plate) { |n| "ABC#{1000 + n}" }
    sequence(:year) { |n| (2015 + (n % 8)).to_s }
    association :customer

    trait :with_old_year do
      year { "2010" }
    end

    trait :with_recent_year do
      year { "2023" }
    end

    trait :toyota do
      brand { "Toyota" }
      model { "Corolla" }
    end

    trait :honda do
      brand { "Honda" }
      model { "Civic" }
    end
  end
end
