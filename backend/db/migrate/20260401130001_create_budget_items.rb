class CreateBudgetItems < ActiveRecord::Migration[8.0]
  def change
    create_table :budget_items do |t|
      t.references :budget, null: false, foreign_key: true
      t.integer :position, null: false, default: 0
      t.decimal :quantity, precision: 10, scale: 2, null: false, default: 1
      t.string :description, null: false, limit: 300
      t.decimal :unit_price, precision: 12, scale: 2, null: false, default: 0
      t.decimal :total, precision: 12, scale: 2, null: false, default: 0

      t.timestamps
    end

    add_index :budget_items, [ :budget_id, :position ]
  end
end
