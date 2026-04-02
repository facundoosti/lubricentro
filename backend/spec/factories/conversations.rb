FactoryBot.define do
  factory :conversation do
    sequence(:whatsapp_phone) { |n| "+5491100#{n.to_s.rjust(6, '0')}" }
    status { "bot" }

    trait :needs_human do
      status { "needs_human" }
    end

    trait :supplier do
      status { "supplier" }
    end

    trait :resolved do
      status { "resolved" }
    end

    trait :with_messages do
      after(:create) do |conversation|
        create(:message, conversation: conversation, sender_type: "customer", direction: "inbound", body: "Hola, buenas")
        create(:message, conversation: conversation, sender_type: "bot", direction: "outbound", body: "Bienvenido, ¿en qué te ayudo?")
      end
    end
  end
end
