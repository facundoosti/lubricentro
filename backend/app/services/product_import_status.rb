# Estado de una importación de productos, identificado por job_id.
#
# Cada actualización se guarda en la tabla product_imports (para que el
# frontend pueda consultarla por HTTP si se pierde la conexión en vivo) y se
# transmite por Action Cable al stream "import_<job_id>".
#
# Tipos: "queued", "progress", "complete", "failed".
class ProductImportStatus
  def self.read(job_id)
    ProductImport.find_by(job_id: job_id)&.payload
  end

  def self.publish(job_id, payload)
    return if job_id.blank?

    attempts = 0
    begin
      record = ProductImport.find_or_initialize_by(job_id: job_id)
      # Un estado final no retrocede (job reintentado o progreso tardío)
      return record.payload if record.terminal? && !ProductImport::TERMINAL.include?(payload[:type])

      assign(record, payload)
      record.save!
    rescue ActiveRecord::RecordNotUnique, ActiveRecord::RecordInvalid => e
      # Carrera entre dos publish del mismo job_id: se reintenta una vez sobre el registro ya creado
      raise if e.is_a?(ActiveRecord::RecordInvalid) && !e.record.errors.of_kind?(:job_id, :taken)

      attempts += 1
      retry if attempts == 1
      raise
    end

    message = record.payload
    ActionCable.server.broadcast("import_#{job_id}", message)
    message
  end

  def self.assign(record, payload)
    record.status = payload[:type]
    record.processed = payload[:processed] if payload.key?(:processed)
    record.total = payload[:total] if payload.key?(:total)
    record.imported = payload[:imported] if payload.key?(:imported)
    if payload.key?(:errors)
      record.error_details = payload[:errors]
      record.errors_count = payload[:errors].size
    elsif payload.key?(:errors_count)
      record.errors_count = payload[:errors_count]
    end
  end
  private_class_method :assign
end
