# == Schema Information
#
# Table name: services
#
#  id          :integer          not null, primary key
#  name        :string(100)      not null
#  description :text
#  base_price  :decimal(10, 2)   not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_services_on_base_price  (base_price)
#  index_services_on_name        (name) UNIQUE
#

class Service < ApplicationRecord
  # Relaciones
  # has_many :service_record_services, dependent: :destroy
  # has_many :service_records, through: :service_record_services

  # Validaciones (siguiendo BD constraints)
  validates :name, presence: true, length: { maximum: 100 }, uniqueness: { case_sensitive: false }
  validates :description, length: { maximum: 1000 }, allow_blank: true
  validates :base_price, presence: true, numericality: { greater_than: 0 }

  # Scopes útiles
  scope :by_name, ->(name) { where("name ILIKE ?", "%#{name}%") }
  scope :by_price_range, ->(min, max) { where(base_price: min..max) }
  scope :active, -> { where(active: true) } # Para futuro soft delete

  # Métodos helper
  def display_name
    name.presence || "Service ##{id}"
  end

  def formatted_price
    "$#{base_price.to_f}"
  end
end
