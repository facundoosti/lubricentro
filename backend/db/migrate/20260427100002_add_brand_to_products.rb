class AddBrandToProducts < ActiveRecord::Migration[8.0]
  def change
    add_column :products, :brand, :string, limit: 100
  end
end
