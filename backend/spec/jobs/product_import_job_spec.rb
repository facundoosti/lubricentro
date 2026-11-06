require 'rails_helper'

RSpec.describe ProductImportJob, type: :job do
  let(:job_id) { "job-abc" }
  let(:relative_path) { "tmp/imports/#{job_id}.xlsx" }
  let(:file_path) { Rails.root.join(relative_path).to_s }

  before do
    FileUtils.mkdir_p(File.dirname(file_path))
    File.write(file_path, "x")
    allow(ProductImportStatus).to receive(:publish)
  end

  after { FileUtils.rm_f(file_path) }

  context 'when the import service finishes' do
    before do
      service = instance_double(ProductImportService, call: { imported: 5, errors: [] })
      allow(ProductImportService).to receive(:new).and_return(service)
    end

    it 'resolves the path relative to Rails.root and publishes complete' do
      described_class.perform_now(relative_path, "productos.xlsx", job_id)
      expect(ProductImportService).to have_received(:new).with(file_path, "productos.xlsx", job_id)
      expect(ProductImportStatus).to have_received(:publish).with(job_id, { type: "complete", imported: 5, errors: [] })
    end

    it 'deletes the uploaded file' do
      described_class.perform_now(relative_path, "productos.xlsx", job_id)
      expect(File.exist?(file_path)).to be false
    end
  end

  context 'when the service reports a fatal error' do
    before do
      result = { imported: 3, errors: [ { row: nil, message: "Error al leer el archivo: x" } ], fatal: true }
      allow(ProductImportService).to receive(:new).and_return(instance_double(ProductImportService, call: result))
    end

    it 'publishes failed keeping the rows already imported' do
      described_class.perform_now(relative_path, "productos.xlsx", job_id)
      expect(ProductImportStatus).to have_received(:publish)
        .with(job_id, { type: "failed", imported: 3, errors: [ { row: nil, message: "Error al leer el archivo: x" } ] })
    end
  end

  context 'when the file is no longer available' do
    before do
      FileUtils.rm_f(file_path)
      allow(ProductImportService).to receive(:new)
    end

    it 'publishes failed with a clear message without running the import' do
      described_class.perform_now(relative_path, "productos.xlsx", job_id)
      expect(ProductImportService).not_to have_received(:new)
      expect(ProductImportStatus).to have_received(:publish)
        .with(job_id, { type: "failed", errors: [ { row: nil, message: described_class::MISSING_FILE_MESSAGE } ] })
    end
  end

  context 'when the import service raises' do
    before do
      allow(ProductImportService).to receive(:new).and_raise(StandardError, "boom")
      allow(Rails.logger).to receive(:error)
    end

    it 'publishes a failed status instead of leaving the client waiting' do
      described_class.perform_now(relative_path, "productos.xlsx", job_id)
      expect(ProductImportStatus).to have_received(:publish)
        .with(job_id, { type: "failed", errors: [ { row: nil, message: "Error inesperado: boom" } ] })
    end
  end
end
