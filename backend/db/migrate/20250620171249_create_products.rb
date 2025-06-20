class CreateProducts < ActiveRecord::Migration[8.0]
  def change
    create_table :products do |t|
      t.string :name, null: false, limit: 100
      t.text :description
      t.decimal :unit_price, precision: 10, scale: 2, null: false
      t.string :unit, limit: 50

      t.timestamps
    end

    add_index :products, :name, unique: true
    add_index :products, :unit_price
  end
end
