# == Schema Information
#
# Table name: service_records
#
#  id                :integer          not null, primary key
#  service_date      :date
#  total_amount      :decimal(, )
#  notes             :text
#  mileage           :integer
#  next_service_date :date
#  customer_id       :integer          not null
#  vehicle_id        :integer          not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_service_records_on_customer_id  (customer_id)
#  index_service_records_on_vehicle_id   (vehicle_id)
#

class ServiceRecord < ApplicationRecord
  belongs_to :customer
  belongs_to :vehicle

  # Validaciones
  validates :service_date, presence: true
  validates :total_amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :mileage, presence: true, numericality: { greater_than: 0 }
  validates :customer_id, presence: true
  validates :vehicle_id, presence: true

  # Validaciones de fecha
  validate :service_date_cannot_be_in_future
  validate :next_service_date_after_service_date, if: :next_service_date?

  # Scopes
  scope :recent, -> { order(service_date: :desc) }
  scope :by_date_range, ->(start_date, end_date) { where(service_date: start_date..end_date) }
  scope :by_customer, ->(customer_id) { where(customer_id: customer_id) }
  scope :by_vehicle, ->(vehicle_id) { where(vehicle_id: vehicle_id) }
  scope :with_high_mileage, ->(threshold = 100000) { where("mileage > ?", threshold) }

  # Callbacks
  before_save :calculate_next_service_date, if: :mileage_changed?

  public
  def formatted_total_amount
    ActionController::Base.helpers.number_to_currency(total_amount, unit: "$", separator: ",", delimiter: ".")
  end

  def formatted_service_date
    service_date&.strftime("%d/%m/%Y")
  end

  def formatted_next_service_date
    next_service_date&.strftime("%d/%m/%Y")
  end

  def is_overdue?
    next_service_date.present? && next_service_date < Date.current
  end

  def days_until_next_service
    return nil unless next_service_date.present?
    (next_service_date - Date.current).to_i
  end

  private

  def service_date_cannot_be_in_future
    if service_date.present? && service_date > Date.current
      errors.add(:service_date, "no puede ser en el futuro")
    end
  end

  def next_service_date_after_service_date
    if next_service_date.present? && service_date.present? && next_service_date <= service_date
      errors.add(:next_service_date, "debe ser posterior a la fecha de servicio")
    end
  end

  def calculate_next_service_date
    # Lógica simple: próximo servicio en 6 meses o 5000 km
    # En un sistema real, esto dependería del tipo de servicio y recomendaciones del fabricante
    self.next_service_date = service_date + 6.months if service_date.present?
  end
end
