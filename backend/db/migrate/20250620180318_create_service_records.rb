class CreateServiceRecords < ActiveRecord::Migration[8.0]
  def change
    create_table :service_records do |t|
      t.date :service_date
      t.decimal :total_amount
      t.text :notes
      t.integer :mileage
      t.date :next_service_date
      t.references :customer, null: false, foreign_key: true
      t.references :vehicle, null: false, foreign_key: true

      t.timestamps
    end
  end
end
