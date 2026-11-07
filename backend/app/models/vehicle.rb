# == Schema Information
#
# Table name: vehicles
#
#  id            :bigint           not null, primary key
#  brand         :string           not null
#  license_plate :string           not null
#  model         :string           not null
#  year          :string           not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  customer_id   :bigint           not null
#
# Indexes
#
#  index_vehicles_on_customer_id    (customer_id)
#  index_vehicles_on_license_plate  (license_plate) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => customers.id)
#

class Vehicle < ApplicationRecord
  MIN_YEAR = 1950

  belongs_to :customer
  has_many :appointments, dependent: :destroy
  has_many :service_records, dependent: :destroy
  has_one_attached :image

  # Validaciones
  validates :brand, presence: true, length: { minimum: 2, maximum: 50 }
  validates :model, presence: true, length: { minimum: 2, maximum: 50 }
  validates :license_plate, presence: true, uniqueness: { case_sensitive: false },
            format: { with: /\A[A-Za-z0-9\s]{6,10}\z/, message: "invalid format" }
  validates :year, presence: true, length: { is: 4 }
  # Solo al crear o cambiar el año: los vehículos viejos fuera de rango se siguen pudiendo editar.
  validate :year_within_range, if: -> { new_record? || year_changed? }

  # Callbacks
  before_validation :normalize_license_plate

  # Scopes
  scope :by_customer, ->(customer_id) { where(customer_id: customer_id) }
  scope :by_brand, ->(brand) { where(brand: brand) }
  # Coincidencia exacta ignorando mayúsculas y espacios ("ab 123 cd" == "AB123CD")
  scope :by_license_plate, ->(plate) {
    where("UPPER(REPLACE(license_plate, ' ', '')) = ?", plate.to_s.upcase.gsub(/\s/, ""))
  }

  # { vehicle_id => { date:, mileage: } } de la atención más reciente de cada vehículo (una sola consulta)
  def self.last_services_for(vehicle_ids)
    return {} if vehicle_ids.empty?

    ServiceRecord
      .where(vehicle_id: vehicle_ids)
      .select("DISTINCT ON (vehicle_id) vehicle_id, service_date, mileage")
      .order(Arel.sql("vehicle_id, service_date DESC NULLS LAST, created_at DESC"))
      .to_h { |r| [ r.vehicle_id, { date: r.service_date, mileage: r.mileage } ] }
  end

  private

  def normalize_license_plate
    self.license_plate = license_plate.upcase.strip if license_plate.present?
  end

  def year_within_range
    return if year.blank?

    max_year = Date.current.year + 1
    return if year.to_s.match?(/\A\d{4}\z/) && year.to_i.between?(MIN_YEAR, max_year)

    errors.add(:year, "must be between #{MIN_YEAR} and #{max_year}")
  end
end
