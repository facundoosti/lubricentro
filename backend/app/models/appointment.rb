# == Schema Information
#
# Table name: appointments
#
#  id           :bigint           not null, primary key
#  scheduled_at :datetime         not null
#  status       :string           default("scheduled"), not null
#  notes        :text
#  customer_id  :bigint           not null
#  vehicle_id   :bigint           not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_appointments_on_customer_id                (customer_id)
#  index_appointments_on_customer_id_and_scheduled_at  (customer_id,scheduled_at)
#  index_appointments_on_scheduled_at               (scheduled_at)
#  index_appointments_on_status                     (status)
#  index_appointments_on_vehicle_id                 (vehicle_id)
#  index_appointments_on_vehicle_id_and_scheduled_at  (vehicle_id,scheduled_at)
#

class Appointment < ApplicationRecord
  belongs_to :customer
  belongs_to :vehicle

  # Validaciones
  validates :scheduled_at, presence: true
  validates :status, presence: true, inclusion: { in: %w[scheduled confirmed completed cancelled] }
  validates :notes, length: { maximum: 1000 }, allow_blank: true

  # Validación custom: scheduled_at debe ser en el futuro
  validate :scheduled_at_must_be_in_future, on: :create

  # Scopes útiles
  scope :scheduled, -> { where(status: "scheduled") }
  scope :confirmed, -> { where(status: "confirmed") }
  scope :completed, -> { where(status: "completed") }
  scope :cancelled, -> { where(status: "cancelled") }
  scope :upcoming, -> { where("scheduled_at > ?", Time.current).order(:scheduled_at) }
  scope :past, -> { where("scheduled_at <= ?", Time.current).order(scheduled_at: :desc) }
  scope :by_customer, ->(customer_id) { where(customer_id: customer_id) }
  scope :by_vehicle, ->(vehicle_id) { where(vehicle_id: vehicle_id) }
  scope :by_date_range, ->(start_date, end_date) {
    where(scheduled_at: start_date.beginning_of_day..end_date.end_of_day)
  }

  # Métodos helper
  def display_status
    case status
    when "scheduled" then "Agendado"
    when "confirmed" then "Confirmado"
    when "completed" then "Completado"
    when "cancelled" then "Cancelado"
    else status.humanize
    end
  end

  def can_be_cancelled?
    %w[scheduled confirmed].include?(status) && scheduled_at > Time.current
  end

  def can_be_confirmed?
    status == "scheduled" && scheduled_at > Time.current
  end

  def can_be_completed?
    %w[scheduled confirmed].include?(status)
  end

  def is_overdue?
    scheduled_at < Time.current && %w[scheduled confirmed].include?(status)
  end

  private

  def scheduled_at_must_be_in_future
    if scheduled_at.present? && scheduled_at <= Time.current
      errors.add(:scheduled_at, "must be in the future")
    end
  end
end
