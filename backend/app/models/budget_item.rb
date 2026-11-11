# == Schema Information
#
# Table name: budget_items
#
#  id          :bigint           not null, primary key
#  description :string(300)      not null
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
  belongs_to :budget

  validates :description, presence: true, length: { maximum: 500 }
  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  # nil = sin IVA (precio final, p. ej. servicios)
  validates :iva_rate, inclusion: { in: Product::IVA_RATES, message: "debe ser 21, 10,5 o vacío" }, allow_nil: true

  before_save :compute_total

  default_scope { order(:position) }

  # Importe neto de la línea (sin IVA)
  def line_net
    (quantity || 0) * (unit_price || 0)
  end

  private

  def compute_total
    self.total = line_net
  end
end
