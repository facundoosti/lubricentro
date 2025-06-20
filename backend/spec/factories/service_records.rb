# == Schema Information
#
# Table name: service_records
#
#  id                :integer          not null, primary key
#  service_date      :date
#  total_amount      :decimal(, )
#  notes             :text
#  mileage           :integer
#  next_service_date :date
#  customer_id       :integer          not null
#  vehicle_id        :integer          not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_service_records_on_customer_id  (customer_id)
#  index_service_records_on_vehicle_id   (vehicle_id)
#

FactoryBot.define do
  factory :service_record do
    service_date { Date.current }
    total_amount { rand(50.0..500.0).round(2) }
    notes { Faker::Lorem.sentence(word_count: 10, supplemental: false, random_words_to_add: 5) }
    mileage { rand(10000..150000) }
    next_service_date { service_date + 6.months }

    association :customer
    association :vehicle

    trait :with_high_mileage do
      mileage { rand(150000..300000) }
    end

    trait :overdue do
      service_date { 2.months.ago.to_date }
      next_service_date { 1.month.ago.to_date }
    end

    trait :upcoming do
      service_date { 1.month.ago.to_date }
      next_service_date { 1.month.from_now.to_date }
    end

    trait :expensive do
      total_amount { rand(500.0..2000.0).round(2) }
      notes { "Reparación mayor del motor" }
    end

    trait :basic_service do
      total_amount { rand(30.0..100.0).round(2) }
      notes { "Cambio de aceite básico" }
    end

    trait :with_detailed_notes do
      notes { Faker::Lorem.paragraph(sentence_count: 4, supplemental: false, random_sentences_to_add: 2) }
    end
  end
end
