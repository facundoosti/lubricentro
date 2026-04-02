FactoryBot.define do
  factory :message do
    association :conversation
    body { Faker::Lorem.sentence }
    direction { "inbound" }
    sender_type { "customer" }

    trait :outbound do
      direction { "outbound" }
      sender_type { "bot" }
    end

    trait :from_agent do
      direction { "outbound" }
      sender_type { "agent" }
    end
  end
end
