# == Schema Information
#
# Table name: budget_items
#
#  id          :bigint           not null, primary key
#  description :string(500)      not null
#  iva_rate    :decimal(4, 2)
#  position    :integer          default(0), not null
#  quantity    :decimal(10, 2)   default(1.0), not null
#  total       :decimal(12, 2)   default(0.0), not null
#  unit_price  :decimal(12, 2)   default(0.0), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  budget_id   :bigint           not null
#
# Indexes
#
#  index_budget_items_on_budget_id               (budget_id)
#  index_budget_items_on_budget_id_and_position  (budget_id,position)
#
# Foreign Keys
#
#  fk_rails_...  (budget_id => budgets.id)
#
class BudgetItem < ApplicationRecord
  include ItemizedTotals::Line

  belongs_to :budget
end
