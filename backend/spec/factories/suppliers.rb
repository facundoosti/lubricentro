# == Schema Information
#
# Table name: suppliers
#
#  id         :bigint           not null, primary key
#  address    :string(200)
#  cuit       :string(20)
#  email      :string(100)
#  name       :string(150)      not null
#  notes      :text
#  phone      :string(30)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_suppliers_on_cuit  (cuit) UNIQUE WHERE (cuit IS NOT NULL)
#  index_suppliers_on_name  (name) UNIQUE
#
FactoryBot.define do
  factory :supplier do
    sequence(:name) { |n| "Proveedor #{n}" }
    cuit { nil }
    email { nil }
    phone { nil }
    address { nil }
    notes { nil }

    trait :with_contact do
      email { Faker::Internet.email }
      phone { Faker::PhoneNumber.phone_number }
      address { Faker::Address.street_address }
      cuit { "20-#{rand(10_000_000..99_999_999)}-#{rand(0..9)}" }
    end

    trait :with_products do
      after(:create) do |supplier|
        create_list(:product, 2, supplier: supplier)
      end
    end
  end
end
