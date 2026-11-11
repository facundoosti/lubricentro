# Lista única de ítems de la atención, mismo shape que budget_items (+ origen en el catálogo).
class CreateServiceRecordItems < ActiveRecord::Migration[8.1]
  def change
    create_table :service_record_items do |t|
      t.references :service_record, null: false, foreign_key: true, index: false
      t.integer :position, null: false, default: 0
      t.decimal :quantity, precision: 10, scale: 2, null: false, default: 1
      t.string :description, limit: 500, null: false
      t.decimal :unit_price, precision: 12, scale: 2, null: false, default: 0
      t.decimal :iva_rate, precision: 4, scale: 2
      t.decimal :total, precision: 12, scale: 2, null: false, default: 0
      t.references :product, null: true, foreign_key: { on_delete: :nullify }
      t.references :service, null: true, foreign_key: { on_delete: :nullify }
      t.timestamps
    end
    add_index :service_record_items, [ :service_record_id, :position ]

    add_reference :service_records, :budget, null: true, foreign_key: { on_delete: :nullify }
  end
end
