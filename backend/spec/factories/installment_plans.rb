# == Schema Information
#
# Table name: installment_plans
#
#  id                   :bigint           not null, primary key
#  active               :boolean          default(TRUE), not null
#  installments         :integer          not null
#  name                 :string(50)       not null
#  position             :integer          default(0), not null
#  surcharge_percentage :decimal(5, 2)    default(0.0), not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
# Indexes
#
#  index_installment_plans_on_active_and_position  (active,position)
#
FactoryBot.define do
  factory :installment_plan do
    sequence(:name) { |n| "Plan #{n}" }
    installments { 3 }
    surcharge_percentage { 10 }
    active { true }
    position { 0 }
  end
end
