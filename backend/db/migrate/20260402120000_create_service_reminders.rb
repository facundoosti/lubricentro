class CreateServiceReminders < ActiveRecord::Migration[8.0]
  def change
    create_table :service_reminders do |t|
      t.references :service_record, null: false, foreign_key: true
      t.references :customer,       null: false, foreign_key: true
      t.references :vehicle,        null: false, foreign_key: true
      t.string  :status,   null: false, default: "pending"
      t.string  :channel,  null: false, default: "whatsapp"
      t.datetime :sent_at
      t.text :error_message
      t.timestamps
    end

    add_index :service_reminders, [ :vehicle_id, :created_at ]
  end
end
