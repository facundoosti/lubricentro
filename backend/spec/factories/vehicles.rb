# == Schema Information
#
# Table name: vehicles
#
#  id            :integer          not null, primary key
#  brand         :string           not null
#  model         :string           not null
#  license_plate :string           not null
#  year          :string           not null
#  customer_id   :integer          not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_vehicles_on_customer_id    (customer_id)
#  index_vehicles_on_license_plate  (license_plate) UNIQUE
#

FactoryBot.define do
  factory :vehicle do
    brand { Faker::Vehicle.make }
    model { Faker::Vehicle.model(make_of_model: brand) }
    license_plate { Faker::Alphanumeric.alphanumeric(number: 6, min_alpha: 3, min_numeric: 3).upcase }
    year { Faker::Vehicle.year }
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
