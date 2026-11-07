class AddIvaRateToProducts < ActiveRecord::Migration[8.1]
  def change
    add_column :products, :iva_rate, :decimal, precision: 4, scale: 2, null: false, default: 21.0
  end
end
