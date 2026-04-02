class CreateSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :settings do |t|
      t.string :lubricentro_name
      t.string :phone
      t.string :mobile
      t.string :address
      t.decimal :latitude, precision: 10, scale: 7
      t.decimal :longitude, precision: 10, scale: 7
      t.jsonb :opening_hours, default: {}
      t.string :cuit
      t.string :owner_name

      t.timestamps
    end
  end
end
