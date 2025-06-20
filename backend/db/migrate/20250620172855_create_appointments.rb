class CreateAppointments < ActiveRecord::Migration[8.0]
  def change
    create_table :appointments do |t|
      t.datetime :scheduled_at, null: false
      t.string :status, null: false, default: 'scheduled'
      t.text :notes
      t.references :customer, null: false, foreign_key: true
      t.references :vehicle, null: false, foreign_key: true

      t.timestamps
    end

    # Índices para optimizar queries
    add_index :appointments, :scheduled_at
    add_index :appointments, :status
    add_index :appointments, [ :customer_id, :scheduled_at ]
    add_index :appointments, [ :vehicle_id, :scheduled_at ]
  end
end
