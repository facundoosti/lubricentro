class ProductImportJob < ApplicationJob
  queue_as :default

  MISSING_FILE_MESSAGE = "El archivo ya no está disponible (posible reinicio del servidor). Volvé a subirlo.".freeze

  def perform(file_path, original_filename, job_id)
    file_path = Rails.root.join(file_path).to_s
    return publish_failed(job_id, MISSING_FILE_MESSAGE) unless File.exist?(file_path)

    result = ProductImportService.new(file_path, original_filename, job_id).call
    type = result.delete(:fatal) ? "failed" : "complete"
    ProductImportStatus.publish(job_id, { type: type }.merge(result))
  rescue StandardError => e
    Rails.logger.error("[ProductImportJob] #{job_id}: #{e.class} #{e.message}")
    publish_failed(job_id, "Error inesperado: #{e.message}")
  ensure
    File.delete(file_path) if file_path && File.exist?(file_path)
  end

  private

  def publish_failed(job_id, message)
    ProductImportStatus.publish(job_id, { type: "failed", errors: [ { row: nil, message: message } ] })
  end
end
