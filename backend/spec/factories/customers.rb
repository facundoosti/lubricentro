# == Schema Information
#
# Table name: customers
#
#  id         :bigint           not null, primary key
#  address    :text
#  email      :string(100)
#  name       :string(100)      not null
#  phone      :string(20)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_customers_on_email  (email) UNIQUE
#  index_customers_on_name   (name)
#

FactoryBot.define do
  factory :customer do
    name { Faker::Name.name }
    phone { Faker::PhoneNumber.phone_number }
    email { Faker::Internet.unique.email }
    address { Faker::Address.full_address }

    factory :customer_with_vehicles do
      transient do
        vehicles_count { 2 }
      end

      after(:create) do |customer, evaluator|
        create_list(:vehicle, evaluator.vehicles_count, customer: customer)
      end
    end
  end
end
