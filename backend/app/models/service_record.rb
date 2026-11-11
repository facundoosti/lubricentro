# == Schema Information
#
# Table name: service_records
#
#  id                :bigint           not null, primary key
#  mileage           :integer
#  next_service_date :date
#  notes             :text
#  service_date      :date
#  total_amount      :decimal(, )      default(0.0)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  appointment_id    :bigint
#  budget_id         :bigint
#  customer_id       :bigint           not null
#  vehicle_id        :bigint           not null
#
# Indexes
#
#  index_service_records_on_appointment_id  (appointment_id) UNIQUE
#  index_service_records_on_budget_id       (budget_id)
#  index_service_records_on_customer_id     (customer_id)
#  index_service_records_on_vehicle_id      (vehicle_id)
#
# Foreign Keys
#
#  fk_rails_...  (appointment_id => appointments.id)
#  fk_rails_...  (budget_id => budgets.id) ON DELETE => nullify
#  fk_rails_...  (customer_id => customers.id)
#  fk_rails_...  (vehicle_id => vehicles.id)
#

class ServiceRecord < ApplicationRecord
  include ItemizedTotals

  belongs_to :customer
  belongs_to :vehicle
  belongs_to :appointment, optional: true
  # Presupuesto de origen (copiar desde presupuesto)
  belongs_to :budget, optional: true

  has_many :items, class_name: "ServiceRecordItem", dependent: :destroy, inverse_of: :service_record
  has_many_attached :photos
  has_many :service_reminders, dependent: :destroy

  accepts_nested_attributes_for :items, allow_destroy: true, reject_if: ->(attrs) { attrs[:description].blank? }

  # Validaciones
  validates :service_date, presence: true
  validates :total_amount, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :mileage, numericality: { greater_than: 0 }, allow_nil: true
  validates :customer_id, presence: true
  validates :vehicle_id, presence: true
  validates :appointment_id, uniqueness: true, allow_nil: true

  # Validaciones de fecha
  validate :service_date_cannot_be_in_future
  validate :next_service_date_after_service_date, if: :next_service_date?
  validate :budget_matches_customer, if: -> { will_save_change_to_budget_id? || will_save_change_to_customer_id? }

  # Scopes
  scope :recent, -> { order(service_date: :desc) }
  scope :by_date_range, ->(start_date, end_date) { where(service_date: start_date..end_date) }
  scope :by_customer, ->(customer_id) { where(customer_id: customer_id) }
  scope :by_vehicle, ->(vehicle_id) { where(vehicle_id: vehicle_id) }
  scope :with_high_mileage, ->(threshold = 100000) { where("mileage > ?", threshold) }
  scope :pending_reminders, ->(days_ahead = 7) {
    joins(:customer, :vehicle)
      .where(next_service_date: Date.current..(Date.current + days_ahead.days))
      .where.not(
        vehicle_id: ServiceReminder
          .where("created_at >= ?", 30.days.ago)
          .select(:vehicle_id)
      )
      .where(
        "NOT EXISTS (
          SELECT 1 FROM service_records sr2
          WHERE sr2.vehicle_id = service_records.vehicle_id
          AND sr2.service_date >= service_records.next_service_date
          AND sr2.id != service_records.id
        )"
      )
      .where.not(customer_id: Customer.where(phone: [ nil, "" ]).select(:id))
  }

  # Callbacks
  before_save :calculate_next_service_date, if: :mileage_changed?
  # Solo si cambian los ítems: las atenciones migradas (o sin ítems) conservan su total histórico.
  before_save :compute_total_amount, if: :items_changed?

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

  # Mismo cálculo que el total efectivo/débito del presupuesto (ver ItemizedTotals)
  def compute_total_amount
    self.total_amount = items_grand_total.round(2)
  end

  def subtotal_net
    items_net_total
  end

  def total_iva
    items_iva_total
  end

  private

  # Mira solo lo que está en memoria (nested attributes): no dispara queries si no se tocaron ítems.
  def items_changed?
    items.target.any?(&:changed_for_autosave?)
  end

  def budget_matches_customer
    return if budget_id.nil?
    return errors.add(:budget, "no existe") if budget.nil?
    return if budget.customer_id.nil? || budget.customer_id == customer_id

    errors.add(:budget, "pertenece a otro cliente")
  end

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
