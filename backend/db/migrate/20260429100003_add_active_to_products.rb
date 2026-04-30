class AddActiveToProducts < ActiveRecord::Migration[8.0]
  def change
    add_column :products, :active, :boolean, default: true, null: false
    execute("UPDATE products SET active = (stock > 0)")
  end
end
