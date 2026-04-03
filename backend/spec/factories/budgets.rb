# == Schema Information
#
# Table name: budgets
#
#  id                        :bigint           not null, primary key
#  card_surcharge_percentage :decimal(5, 2)    default(0.0)
#  date                      :date             not null
#  notes                     :text
#  status                    :string(20)       default("draft"), not null
#  total_card                :decimal(12, 2)   default(0.0)
#  total_list                :decimal(12, 2)   default(0.0)
#  vehicle_description       :string(200)
#  created_at                :datetime         not null
#  updated_at                :datetime         not null
#  customer_id               :bigint
#  vehicle_id                :bigint
#
# Indexes
#
#  index_budgets_on_customer_id  (customer_id)
#  index_budgets_on_date         (date)
#  index_budgets_on_status       (status)
#  index_budgets_on_vehicle_id   (vehicle_id)
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => customers.id)
#  fk_rails_...  (vehicle_id => vehicles.id)
#
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
