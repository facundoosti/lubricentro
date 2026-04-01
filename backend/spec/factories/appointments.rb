# == Schema Information
#
# Table name: appointments
#
#  id           :bigint           not null, primary key
#  notes        :text
#  scheduled_at :datetime         not null
#  status       :string           default("scheduled"), not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  customer_id  :bigint           not null
#  vehicle_id   :bigint           not null
#
# Indexes
#
#  index_appointments_on_customer_id                   (customer_id)
#  index_appointments_on_customer_id_and_scheduled_at  (customer_id,scheduled_at)
#  index_appointments_on_scheduled_at                  (scheduled_at)
#  index_appointments_on_status                        (status)
#  index_appointments_on_vehicle_id                    (vehicle_id)
#  index_appointments_on_vehicle_id_and_scheduled_at   (vehicle_id,scheduled_at)
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => customers.id)
#  fk_rails_...  (vehicle_id => vehicles.id)
#
FactoryBot.define do
  factory :appointment do
    scheduled_at do
      tomorrow = 1.day.from_now
      tomorrow.month == Time.current.month ? tomorrow : 1.hour.from_now
    end
    status { 'scheduled' }
    notes { Faker::Lorem.sentence(word_count: 8, supplemental: false, random_words_to_add: 4) }
    association :customer
    association :vehicle

    trait :scheduled do
      status { 'scheduled' }
    end

    trait :confirmed do
      status { 'confirmed' }
    end

    trait :completed do
      status { 'completed' }
      scheduled_at { 1.day.ago }
    end

    trait :cancelled do
      status { 'cancelled' }
    end

    trait :past do
      scheduled_at { 1.day.ago }
    end

    trait :urgent do
      scheduled_at { 1.hour.from_now }
      notes { 'URGENTE - Problema con frenos' }
    end

    trait :with_long_notes do
      notes { Faker::Lorem.paragraph(sentence_count: 3, supplemental: false, random_sentences_to_add: 2) }
    end
  end
end
