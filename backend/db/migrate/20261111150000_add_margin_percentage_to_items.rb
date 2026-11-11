# % de ganancia por línea (fórmula sumada con el IVA). Default 0: ningún total existente cambia.
class AddMarginPercentageToItems < ActiveRecord::Migration[8.1]
  def change
    add_column :budget_items, :margin_percentage, :decimal, precision: 6, scale: 2, default: 0, null: false
    add_column :service_record_items, :margin_percentage, :decimal, precision: 6, scale: 2, default: 0, null: false
  end
end
