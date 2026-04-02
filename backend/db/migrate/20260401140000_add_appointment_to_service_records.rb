class AddAppointmentToServiceRecords < ActiveRecord::Migration[8.0]
  def change
    add_column :service_records, :appointment_id, :bigint
    add_index :service_records, :appointment_id, unique: true
    add_foreign_key :service_records, :appointments, column: :appointment_id

    change_column_default :service_records, :total_amount, from: nil, to: 0
  end
end
