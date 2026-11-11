# Los nombres de producto se copian a budget_items.description al presupuestar,
# por eso ambas columnas se amplían a 500 juntas.
class IncreaseProductsNameLimit < ActiveRecord::Migration[8.1]
  def up
    change_column :products, :name, :string, limit: 500, null: false
    change_column :budget_items, :description, :string, limit: 500, null: false
  end

  # Falla si ya hay valores más largos que el límite anterior (no trunca datos en silencio).
  def down
    change_column :budget_items, :description, :string, limit: 300, null: false
    change_column :products, :name, :string, limit: 100, null: false
  end
end
