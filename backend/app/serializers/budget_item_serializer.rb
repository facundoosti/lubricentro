# == Schema Information
#
# Table name: budget_items
#
#  id          :bigint           not null, primary key
#  description :string(300)      not null
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
class BudgetItemSerializer < Blueprinter::Base
  identifier :id

  fields :budget_id, :position, :quantity, :description, :unit_price, :total
end
