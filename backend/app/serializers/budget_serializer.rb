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
class BudgetSerializer < Blueprinter::Base
  identifier :id

  field :date do |obj|
    obj.date&.iso8601
  end
  field :status
  field :status_label
  field :vehicle_description
  field :notes
  field :card_surcharge_percentage
  field :total_list
  field :total_card
  field :customer_id
  field :vehicle_id
  field :created_at
  field :updated_at

  view :with_items do
    field :date do |obj|
      obj.date&.iso8601
    end
    field :status
    field :status_label
    field :vehicle_description
    field :notes
    field :card_surcharge_percentage
    field :total_list
    field :total_card
    field :customer_id
    field :vehicle_id
    field :created_at
    field :updated_at

    association :items, blueprint: BudgetItemSerializer
    association :customer, blueprint: CustomerSerializer, view: :summary
    association :vehicle, blueprint: VehicleSerializer, view: :summary
  end
end
