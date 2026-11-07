# == Schema Information
#
# Table name: budgets
#
#  id                        :bigint           not null, primary key
#  card_surcharge_percentage :decimal(5, 2)    default(0.0)
#  date                      :date             not null
#  notes                     :text
#  status                    :string(20)       default("draft"), not null
#  subtotal_net              :decimal(12, 2)   default(0.0)
#  total_card                :decimal(12, 2)   default(0.0)
#  total_iva                 :decimal(12, 2)   default(0.0)
#  total_list                :decimal(12, 2)   default(0.0)
#  vehicle_description       :string(200)
#  created_at                :datetime         not null
#  updated_at                :datetime         not null
#  customer_id               :bigint
#  vehicle_id                :bigint
#
# Indexes
#
#  index_budgets_on_customer_id  (customer_id)
#  index_budgets_on_date         (date)
#  index_budgets_on_status       (status)
#  index_budgets_on_vehicle_id   (vehicle_id)
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => customers.id)
#  fk_rails_...  (vehicle_id => vehicles.id)
#
class Budget < ApplicationRecord
  belongs_to :customer, optional: true
  belongs_to :vehicle, optional: true
  has_many :items, class_name: "BudgetItem", dependent: :destroy, inverse_of: :budget

  accepts_nested_attributes_for :items, allow_destroy: true, reject_if: :all_blank

  STATUSES = %w[draft sent approved rejected].freeze

  validates :date, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :card_surcharge_percentage, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }
  # Solo al cambiar cliente o vehículo: los presupuestos viejos inconsistentes se siguen pudiendo editar.
  validate :vehicle_belongs_to_customer, if: -> { will_save_change_to_vehicle_id? || will_save_change_to_customer_id? }

  scope :recent, -> { order(date: :desc, created_at: :desc) }
  scope :by_status, ->(s) { where(status: s) }
  scope :by_customer, ->(id) { where(customer_id: id) }
  scope :by_search, ->(term) {
    left_joins(:customer)
      .where(
        "budgets.vehicle_description ILIKE :t OR customers.name ILIKE :t",
        t: "%#{term}%"
      )
  }

  before_save :compute_totals

  # Totales con IVA discriminado. unit_price de los ítems es neto; los ítems sin
  # alícuota (servicios, presupuestos anteriores al IVA) se suman como precio final.
  # El IVA se redondea por alícuota, no por línea.
  def compute_totals
    self.subtotal_net = taxed_items.sum(&:line_net)
    self.total_iva = iva_breakdown.sum { |row| row[:amount] }
    self.total_list = subtotal_net + total_iva + exempt_total
    self.total_card = (total_list * (1 + (card_surcharge_percentage || 0) / 100)).round(2)
  end

  # [{ rate: 21.0, base: 20000.0, amount: 4200.0 }, ...] ordenado por alícuota descendente
  def iva_breakdown
    taxed_items.group_by { |i| i.iva_rate.to_d }.sort_by { |rate, _| -rate }.map do |rate, group|
      base = group.sum(&:line_net)
      { rate: rate, base: base, amount: (base * rate / 100).round(2) }
    end
  end

  def exempt_total
    active_items.reject(&:iva_rate).sum(&:line_net)
  end

  def status_label
    case status
    when "draft"    then "Borrador"
    when "sent"     then "Enviado"
    when "approved" then "Aprobado"
    when "rejected" then "Rechazado"
    else status
    end
  end

  private

  def active_items
    items.reject(&:marked_for_destruction?)
  end

  def taxed_items
    active_items.select(&:iva_rate)
  end

  def vehicle_belongs_to_customer
    return if vehicle.nil? || customer_id.nil?
    return if vehicle.customer_id == customer_id

    errors.add(:vehicle, "no pertenece al cliente seleccionado")
  end
end
