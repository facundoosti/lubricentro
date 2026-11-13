class CreateInstallmentPlans < ActiveRecord::Migration[8.1]
  def change
    create_table :installment_plans do |t|
      t.string :name, limit: 50, null: false
      t.integer :installments, null: false
      t.decimal :surcharge_percentage, precision: 5, scale: 2, null: false, default: 0
      t.boolean :active, null: false, default: true
      t.integer :position, null: false, default: 0

      t.timestamps
    end
    add_check_constraint :installment_plans, "installments > 1", name: "installment_plans_installments_gt_1"
    add_check_constraint :installment_plans, "surcharge_percentage >= 0", name: "installment_plans_surcharge_non_negative"
    add_index :installment_plans, [ :active, :position ]
  end
end
