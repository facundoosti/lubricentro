# == Schema Information
#
# Table name: conversations
#
#  id              :bigint           not null, primary key
#  label           :string
#  last_message_at :datetime
#  status          :string           default("bot"), not null
#  whatsapp_phone  :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  customer_id     :bigint
#
# Indexes
#
#  index_conversations_on_customer_id     (customer_id)
#  index_conversations_on_status          (status)
#  index_conversations_on_whatsapp_phone  (whatsapp_phone) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => customers.id)
#
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

    trait :archived do
      status { "archived" }
    end

    trait :with_messages do
      after(:create) do |conversation|
        create(:message, conversation: conversation, sender_type: "customer", direction: "inbound", body: "Hola, buenas")
        create(:message, conversation: conversation, sender_type: "bot", direction: "outbound", body: "Bienvenido, ¿en qué te ayudo?")
      end
    end
  end
end
