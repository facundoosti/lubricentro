class AddProductCodeToBudgetItems < ActiveRecord::Migration[8.1]
  def change
    add_column :budget_items, :product_code, :string, limit: 50
  end
end
