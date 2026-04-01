class CreateBudgets < ActiveRecord::Migration[8.0]
  def change
    create_table :budgets do |t|
      t.references :customer, null: true, foreign_key: true
      t.references :vehicle, null: true, foreign_key: true
      t.string :vehicle_description, limit: 200
      t.date :date, null: false
      t.string :status, null: false, default: "draft", limit: 20
      t.text :notes
      t.decimal :card_surcharge_percentage, precision: 5, scale: 2, default: 0
      t.decimal :total_list, precision: 12, scale: 2, default: 0
      t.decimal :total_card, precision: 12, scale: 2, default: 0

      t.timestamps
    end

    add_index :budgets, :date
    add_index :budgets, :status
  end
end
