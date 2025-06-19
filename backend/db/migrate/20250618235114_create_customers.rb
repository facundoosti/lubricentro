class CreateCustomers < ActiveRecord::Migration[8.0]
  def change
    create_table :customers do |t|
      t.string :name, null: false, limit: 100
      t.string :phone, limit: 20
      t.string :email, limit: 100
      t.text :address

      t.timestamps
    end

    add_index :customers, :email, unique: true
    add_index :customers, :name
  end
end
