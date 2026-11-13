class AddFiscalDataToCustomers < ActiveRecord::Migration[8.1]
  def change
    add_column :customers, :cuit, :string, limit: 13
    add_column :customers, :invoice_type, :string, limit: 2
  end
end
