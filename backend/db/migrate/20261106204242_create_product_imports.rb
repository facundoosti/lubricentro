class CreateProductImports < ActiveRecord::Migration[8.1]
  def change
    create_table :product_imports do |t|
      t.string :job_id, null: false
      t.string :status, null: false, default: "queued"
      t.integer :processed, null: false, default: 0
      t.integer :total, null: false, default: 0
      t.integer :imported, null: false, default: 0
      t.integer :errors_count, null: false, default: 0
      t.jsonb :error_details, null: false, default: []

      t.timestamps
    end

    add_index :product_imports, :job_id, unique: true
  end
end
