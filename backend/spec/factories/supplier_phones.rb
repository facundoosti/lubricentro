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
FactoryBot.define do
  factory :supplier_phone do
    sequence(:phone) { |n| "+5491199#{n.to_s.rjust(6, '0')}" }
    company_name { "Proveedor #{Faker::Company.name}" }
    notes { nil }
  end
end
