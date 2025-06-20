class CreateServices < ActiveRecord::Migration[8.0]
  def change
    create_table :services do |t|
      t.string :name, null: false, limit: 100
      t.text :description
      t.decimal :base_price, precision: 10, scale: 2, null: false

      t.timestamps
    end

    add_index :services, :name, unique: true
    add_index :services, :base_price
  end
end
