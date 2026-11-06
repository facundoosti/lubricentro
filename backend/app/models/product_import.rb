# == Schema Information
#
# Table name: product_imports
#
#  id            :bigint           not null, primary key
#  error_details :jsonb            not null
#  errors_count  :integer          default(0), not null
#  imported      :integer          default(0), not null
#  processed     :integer          default(0), not null
#  status        :string           default("queued"), not null
#  total         :integer          default(0), not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  job_id        :string           not null
#
# Indexes
#
#  index_product_imports_on_job_id  (job_id) UNIQUE
#
class ProductImport < ApplicationRecord
  STATUSES = %w[queued progress complete failed].freeze
  TERMINAL = %w[complete failed].freeze
  # Sin novedades en este tiempo, se asume que el worker murió
  STALE_AFTER = 10.minutes
  STALE_MESSAGE = "La importación dejó de responder. Revisá el listado de productos y, si faltan, volvé a importar.".freeze

  validates :job_id, presence: true, uniqueness: true
  validates :status, inclusion: { in: STATUSES }

  def terminal?
    TERMINAL.include?(status)
  end

  def stale?
    !terminal? && updated_at.present? && updated_at < STALE_AFTER.ago
  end

  # Mismo formato que los mensajes de Action Cable del stream "import_<job_id>"
  def payload
    return stale_payload if stale?

    {
      type: status,
      job_id: job_id,
      processed: processed,
      total: total,
      imported: imported,
      errors_count: errors_count,
      errors: error_details,
      updated_at: updated_at&.iso8601
    }
  end

  private

  def stale_payload
    {
      type: "failed", job_id: job_id, processed: processed, total: total, imported: imported,
      errors_count: errors_count + 1,
      errors: error_details + [ { "row" => nil, "message" => STALE_MESSAGE } ],
      updated_at: updated_at&.iso8601
    }
  end
end
