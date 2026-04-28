# == Schema Information
#
# Table name: suppliers
#
#  id         :bigint           not null, primary key
#  address    :string(200)
#  cuit       :string(20)
#  email      :string(100)
#  name       :string(150)      not null
#  notes      :text
#  phone      :string(30)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_suppliers_on_cuit  (cuit) UNIQUE WHERE (cuit IS NOT NULL)
#  index_suppliers_on_name  (name) UNIQUE
#
class Supplier < ApplicationRecord
  has_many :products, dependent: :nullify

  validates :name, presence: true, length: { maximum: 150 }, uniqueness: { case_sensitive: false }
  validates :cuit, length: { maximum: 20 }, allow_blank: true,
                   uniqueness: { case_sensitive: false, allow_blank: true }
  validates :email, length: { maximum: 100 }, allow_blank: true,
                    format: { with: URI::MailTo::EMAIL_REGEXP, allow_blank: true }
  validates :phone, length: { maximum: 30 }, allow_blank: true
  validates :address, length: { maximum: 200 }, allow_blank: true

  scope :by_name, ->(name) { where("suppliers.name ILIKE ?", "%#{name}%") }
  scope :ordered, -> { order("suppliers.name") }
end
