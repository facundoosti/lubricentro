FactoryBot.define do
  factory :appointment do
    scheduled_at { 1.day.from_now }
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
