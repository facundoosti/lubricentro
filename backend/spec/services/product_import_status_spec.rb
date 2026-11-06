require 'rails_helper'

RSpec.describe ProductImportStatus do
  let(:job_id) { "job-123" }

  before { allow(ActionCable.server).to receive(:broadcast) }

  describe '.publish' do
    subject(:publish) { described_class.publish(job_id, { type: "progress", processed: 20, total: 100, imported: 19, errors_count: 1 }) }

    it 'persists the status so it can be read later' do
      publish
      expect(described_class.read(job_id)).to include(type: "progress", processed: 20, total: 100, imported: 19, errors_count: 1)
    end

    it 'broadcasts the same payload on the import stream' do
      message = publish
      expect(ActionCable.server).to have_received(:broadcast).with("import_#{job_id}", message)
    end

    it 'updates the same record on later publishes' do
      publish
      described_class.publish(job_id, { type: "complete", imported: 99, errors: [ { row: 4, message: "x" } ] })
      expect(ProductImport.where(job_id: job_id).count).to eq(1)
      expect(described_class.read(job_id)).to include(type: "complete", imported: 99, processed: 20, errors_count: 1)
    end

    context 'when the import already finished' do
      before { described_class.publish(job_id, { type: "complete", imported: 10, errors: [] }) }

      it 'ignores a late progress update' do
        publish
        expect(described_class.read(job_id)).to include(type: "complete", imported: 10)
      end
    end

    context 'when job_id is blank' do
      let(:job_id) { nil }

      it 'does nothing' do
        expect(publish).to be_nil
        expect(ProductImport.count).to eq(0)
        expect(ActionCable.server).not_to have_received(:broadcast)
      end
    end
  end

  describe '.read' do
    it 'returns nil for an unknown job' do
      expect(described_class.read("desconocido")).to be_nil
    end
  end
end
