class CreateVehicles < ActiveRecord::Migration[8.0]
  def change
    create_table :vehicles do |t|
      t.string :brand, null: false
      t.string :model, null: false
      t.string :license_plate, null: false
      t.string :year, null: false
      t.references :customer, null: false, foreign_key: true

      t.timestamps
    end

    add_index :vehicles, :license_plate, unique: true
  end
end
