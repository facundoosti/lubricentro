class AddContactToSettings < ActiveRecord::Migration[8.1]
  def change
    add_column :settings, :email, :string
    add_column :settings, :instagram, :string
  end
end
