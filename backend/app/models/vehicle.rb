class Vehicle < ApplicationRecord
  belongs_to :customer

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
