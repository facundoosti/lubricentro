class ProductImportJob < ApplicationJob
  queue_as :default

  def perform(file_path, original_filename, job_id)
    result = ProductImportService.new(file_path, original_filename, job_id).call
    ActionCable.server.broadcast("import_#{job_id}", { type: "complete" }.merge(result))
  ensure
    File.delete(file_path) if file_path && File.exist?(file_path)
  end
end
