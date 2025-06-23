# == Schema Information
#
# Table name: products
#
#  id          :integer          not null, primary key
#  name        :string(100)      not null
#  description :text
#  unit_price  :decimal(10, 2)   not null
#  unit        :string(50)
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_products_on_name        (name) UNIQUE
#  index_products_on_unit_price  (unit_price)
#

class Product < ApplicationRecord
  # Relaciones
  has_many :service_record_products, dependent: :destroy
  has_many :service_records, through: :service_record_products

  # Validaciones
  validates :name, presence: true, length: { maximum: 100 }, uniqueness: { case_sensitive: false }
  validates :description, length: { maximum: 1000 }, allow_blank: true
  validates :unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :unit, length: { maximum: 50 }, allow_blank: true

  # Scopes
  scope :by_name, ->(name) { where("name ILIKE ?", "%#{name}%") }
  scope :by_price_range, ->(min, max) { where(unit_price: min..max) }

  # Métodos
  def formatted_price
    "$#{unit_price.to_f}"
  end
end
