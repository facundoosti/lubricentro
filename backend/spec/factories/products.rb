# == Schema Information
#
# Table name: products
#
#  id          :integer          not null, primary key
#  name        :string(100)      not null
#  description :text
#  unit_price  :decimal(10, 2)   not null
#  unit        :string(50)
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_products_on_name        (name) UNIQUE
#  index_products_on_unit_price  (unit_price)
#

FactoryBot.define do
  factory :product do
    name { Faker::Commerce.product_name }
    description { Faker::Lorem.sentence(word_count: 6, supplemental: false, random_words_to_add: 3) }
    unit_price { rand(500..15000) } # $5.00 - $150.00
    unit { [ 'L', 'unit', 'kit', 'piece', 'bottle' ].sample }

    trait :oil do
      name { "Motor Oil 10W-40" }
      description { "Synthetic blend motor oil for modern engines." }
      unit_price { 7500 }
      unit { "L" }
    end

    trait :air_filter do
      name { "Air Filter AF-255" }
      description { "High performance pleated paper air filter." }
      unit_price { 2500 }
      unit { "unit" }
    end

    trait :brake_fluid do
      name { "Brake Fluid DOT 4" }
      description { "High temperature brake fluid." }
      unit_price { 1200 }
      unit { "L" }
    end
  end
end
