class ServiceRecordService < ApplicationRecord
  belongs_to :service_record
  belongs_to :service

  # Validaciones
  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :service_record_id, uniqueness: { scope: :service_id }

  # Callbacks
  before_save :set_unit_price_from_service, if: :service_id_changed?

  # Métodos
  def total_price
    quantity * unit_price
  end

  def formatted_total_price
    ActionController::Base.helpers.number_to_currency(total_price, unit: "$", separator: ",", delimiter: ".")
  end

  def formatted_unit_price
    ActionController::Base.helpers.number_to_currency(unit_price, unit: "$", separator: ",", delimiter: ".")
  end

  private

  def set_unit_price_from_service
    self.unit_price = service.base_price if service.present?
  end
end
