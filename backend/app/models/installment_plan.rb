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
class InstallmentPlan < ApplicationRecord
  validates :name, presence: true, length: { maximum: 50 }
  validates :installments, numericality: { only_integer: true, greater_than: 1, less_than_or_equal_to: 60 }
  validates :surcharge_percentage, numericality: { greater_than_or_equal_to: 0, less_than: 1000 }
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(:position, :id) }
end
