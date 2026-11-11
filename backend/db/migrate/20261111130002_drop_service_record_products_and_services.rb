# Reemplazadas por service_record_items. Antes de borrar verifica que la copia de datos
# (MigrateServiceRecordItemsData) no haya perdido filas; si faltan ítems aborta sin borrar.
class DropServiceRecordProductsAndServices < ActiveRecord::Migration[8.1]
  def up
    ensure_items_copied!
    drop_table :service_record_products
    drop_table :service_record_services
  end

  def down
    create_table :service_record_products do |t|
      t.references :service_record, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.integer :quantity, null: false, default: 1
      t.decimal :unit_price, precision: 10, scale: 2, null: false
      t.timestamps
      t.index :quantity
      t.index :unit_price
      t.index [ :service_record_id, :product_id ], unique: true, name: "index_service_record_products_unique"
    end

    create_table :service_record_services do |t|
      t.references :service_record, null: false, foreign_key: true
      t.references :service, null: false, foreign_key: true
      t.integer :quantity, null: false, default: 1
      t.decimal :unit_price, precision: 10, scale: 2, null: false
      t.timestamps
      t.index :quantity
      t.index :unit_price
      t.index [ :service_record_id, :service_id ], unique: true, name: "index_service_record_services_unique"
    end
  end

  # Cada fila vieja debe tener su ítem: si hay menos ítems que filas viejas, la copia falló.
  def ensure_items_copied!
    items = select_value("SELECT COUNT(*) FROM service_record_items").to_i
    old_rows = select_value("SELECT COUNT(*) FROM service_record_products").to_i +
               select_value("SELECT COUNT(*) FROM service_record_services").to_i
    return if items >= old_rows

    raise ActiveRecord::MigrationError,
          "service_record_items tiene #{items} filas y las tablas viejas #{old_rows}: no se borran"
  end
end
