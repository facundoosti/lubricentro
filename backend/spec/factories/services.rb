# == Schema Information
#
# Table name: services
#
#  id          :integer          not null, primary key
#  name        :string(100)      not null
#  description :text
#  base_price  :decimal(10, 2)   not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_services_on_base_price  (base_price)
#  index_services_on_name        (name) UNIQUE
#

FactoryBot.define do
  factory :service do
    name { Faker::Commerce.unique.product_name }
    description { Faker::Lorem.sentence(word_count: 8, supplemental: false, random_words_to_add: 4) }
    base_price { rand(1000..50000) } # Entre $10.00 y $500.00

    # Traits para casos específicos
    trait :oil_change do
      name { "Oil Change" }
      description { "Complete oil change with premium oil and filter replacement" }
      base_price { 8500 } # $85.00
    end

    trait :tire_rotation do
      name { "Tire Rotation" }
      description { "Rotate all four tires to ensure even wear" }
      base_price { 3500 } # $35.00
    end

    trait :brake_service do
      name { "Brake Service" }
      description { "Complete brake inspection and pad replacement" }
      base_price { 25000 } # $250.00
    end

    trait :expensive do
      base_price { rand(50001..100000) } # $500.01 - $1000.00
    end

    trait :cheap do
      base_price { rand(500..1999) } # $5.00 - $19.99
    end
  end
end
