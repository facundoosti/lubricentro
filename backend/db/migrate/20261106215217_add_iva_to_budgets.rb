class AddIvaToBudgets < ActiveRecord::Migration[8.1]
  def change
    add_column :budget_items, :iva_rate, :decimal, precision: 4, scale: 2
    add_column :budgets, :subtotal_net, :decimal, precision: 12, scale: 2, default: 0.0
    add_column :budgets, :total_iva, :decimal, precision: 12, scale: 2, default: 0.0
  end
end
