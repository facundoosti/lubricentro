FactoryBot.define do
  factory :service_reminder do
    status { "pending" }
    channel { "whatsapp" }
    sent_at { nil }
    error_message { nil }

    association :customer
    association :vehicle
    association :service_record

    trait :sent do
      status { "sent" }
      sent_at { Time.current }
    end

    trait :failed do
      status { "failed" }
      error_message { "Connection timeout" }
    end
  end
end
