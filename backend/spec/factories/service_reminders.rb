# == Schema Information
#
# Table name: service_reminders
#
#  id                :bigint           not null, primary key
#  channel           :string           default("whatsapp"), not null
#  error_message     :text
#  sent_at           :datetime
#  status            :string           default("pending"), not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  customer_id       :bigint           not null
#  service_record_id :bigint           not null
#  vehicle_id        :bigint           not null
#
# Indexes
#
#  index_service_reminders_on_customer_id                (customer_id)
#  index_service_reminders_on_service_record_id          (service_record_id)
#  index_service_reminders_on_vehicle_id                 (vehicle_id)
#  index_service_reminders_on_vehicle_id_and_created_at  (vehicle_id,created_at)
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => customers.id)
#  fk_rails_...  (service_record_id => service_records.id)
#  fk_rails_...  (vehicle_id => vehicles.id)
#
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
