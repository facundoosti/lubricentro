# == Schema Information
#
# Table name: supplier_phones
#
#  id           :bigint           not null, primary key
#  company_name :string
#  notes        :text
#  phone        :string           not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_supplier_phones_on_phone  (phone) UNIQUE
#
class SupplierPhoneSerializer < Blueprinter::Base
  identifier :id

  fields :phone, :company_name, :notes, :created_at, :updated_at
end
