# == Schema Information
#
# Table name: vehicles
#
#  id            :integer          not null, primary key
#  brand         :string           not null
#  model         :string           not null
#  license_plate :string           not null
#  year          :string           not null
#  customer_id   :integer          not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_vehicles_on_customer_id    (customer_id)
#  index_vehicles_on_license_plate  (license_plate) UNIQUE
#

class Vehicle < ApplicationRecord
  belongs_to :customer
  has_many :appointments, dependent: :destroy

  # Validaciones
  validates :brand, presence: true, length: { minimum: 2, maximum: 50 }
  validates :model, presence: true, length: { minimum: 2, maximum: 50 }
  validates :license_plate, presence: true, uniqueness: { case_sensitive: false },
            format: { with: /\A[A-Za-z0-9\s]{6,10}\z/, message: "invalid format" }
  validates :year, presence: true, length: { is: 4 }

  # Callbacks
  before_validation :normalize_license_plate

  # Scopes
  scope :by_customer, ->(customer_id) { where(customer_id: customer_id) }
  scope :by_brand, ->(brand) { where(brand: brand) }

  private

  def normalize_license_plate
    self.license_plate = license_plate.upcase.strip if license_plate.present?
  end
end
