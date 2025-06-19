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
