# == Schema Information
#
# Table name: users
#
#  id              :integer          not null, primary key
#  name            :string           not null
#  email           :string           not null
#  password_digest :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_users_on_email  (email) UNIQUE
#

FactoryBot.define do
  factory :user do
    name { Faker::Name.name }
    email { Faker::Internet.unique.email }
    password { "password123" }
    password_confirmation { "password123" }

    trait :with_strong_password do
      password { "StrongP@ssw0rd123!" }
      password_confirmation { "StrongP@ssw0rd123!" }
    end

    trait :admin do
      name { "Facundo Osti" }
      email { "facundoosti@gmail.com" }
      password { "lubri123" }
      password_confirmation { "lubri123" }
    end

    trait :with_long_name do
      name { Faker::Name.name_with_middle }
    end

    trait :with_company_email do
      email { Faker::Internet.unique.email(domain: 'lubricentro.com') }
    end
  end

  factory :admin_user, parent: :user do
    admin
  end
end
