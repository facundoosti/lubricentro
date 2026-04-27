class AddSkuAndSupplierToProducts < ActiveRecord::Migration[8.0]
  def change
    add_column :products, :sku, :string, limit: 50
    add_reference :products, :supplier, null: true, foreign_key: true

    add_index :products, :sku, unique: true, where: "sku IS NOT NULL"
  end
end
