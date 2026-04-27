class CreateSuppliers < ActiveRecord::Migration[8.0]
  def change
    create_table :suppliers do |t|
      t.string :name, null: false, limit: 150
      t.string :cuit, limit: 20
      t.string :email, limit: 100
      t.string :phone, limit: 30
      t.string :address, limit: 200
      t.text :notes

      t.timestamps
    end

    add_index :suppliers, :name, unique: true
    add_index :suppliers, :cuit, unique: true, where: "cuit IS NOT NULL"
  end
end
