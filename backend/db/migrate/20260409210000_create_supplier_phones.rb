class CreateSupplierPhones < ActiveRecord::Migration[8.0]
  def change
    create_table :supplier_phones do |t|
      t.string :phone, null: false
      t.string :company_name
      t.text :notes

      t.timestamps
    end

    add_index :supplier_phones, :phone, unique: true
  end
end
