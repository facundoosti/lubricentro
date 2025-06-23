class CreateServiceRecordProducts < ActiveRecord::Migration[8.0]
  def change
    create_table :service_record_products do |t|
      t.references :service_record, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.integer :quantity, null: false, default: 1
      t.decimal :unit_price, precision: 10, scale: 2, null: false

      t.timestamps
    end

    add_index :service_record_products, [ :service_record_id, :product_id ], unique: true, name: 'index_service_record_products_unique'
    add_index :service_record_products, :quantity
    add_index :service_record_products, :unit_price
  end
end
