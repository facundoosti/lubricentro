require 'rails_helper'

RSpec.describe ProductImportService do
  let(:job_id) { nil }

  def call_service(file_path, original_filename)
    described_class.new(file_path, original_filename, job_id).call
  end

  describe '#call' do
    context 'with an unsupported file format' do
      it 'returns an error' do
        result = call_service("/tmp/file.csv", "products.csv")
        expect(result[:imported]).to eq(0)
        expect(result[:errors].first).to include("Error al leer el archivo")
      end
    end

    context 'with a .xlsx file' do
      let(:spreadsheet_double) { instance_double(Roo::Excelx) }
      let(:rows) do
        [
          ["SKU",    "Nombre *", "Descripción", "Precio Unitario *", "Unidad", "Marca",       "Proveedor"],
          ["PR-001", "Aceite 5W-30", "Aceite sintético", "5000.50", "L", "Mobil", nil],
          [nil,      "Filtro Aire",  "Filtro de aire",   "1200",    "unit", nil,   "Proveedor SA"]
        ]
      end

      before do
        allow(Roo::Excelx).to receive(:new).and_return(spreadsheet_double)
        allow(spreadsheet_double).to receive(:last_row).and_return(rows.size)
        allow(spreadsheet_double).to receive(:each_with_index).and_yield(rows[0], 0).and_yield(rows[1], 1).and_yield(rows[2], 2)
        allow(EmbeddingService).to receive(:generate).and_return(nil)
      end

      it 'imports valid rows and skips the header' do
        result = call_service("/tmp/file.xlsx", "products.xlsx")
        expect(result[:imported]).to eq(2)
        expect(result[:errors]).to be_empty
      end

      it 'creates products in the database' do
        expect {
          call_service("/tmp/file.xlsx", "products.xlsx")
        }.to change(Product, :count).by(2)
      end

      it 'creates supplier when supplier_name is present' do
        expect {
          call_service("/tmp/file.xlsx", "products.xlsx")
        }.to change(Supplier, :count).by(1)
      end

      context 'when a row has a blank name' do
        let(:rows) do
          [
            ["SKU", "Nombre *", "Descripción", "Precio Unitario *", "Unidad", "Marca", "Proveedor"],
            [nil,   "",         nil,            "5000",             "L",      nil,      nil]
          ]
        end

        it 'records an error for that row' do
          result = call_service("/tmp/file.xlsx", "products.xlsx")
          expect(result[:imported]).to eq(0)
          expect(result[:errors].first[:message]).to include("nombre es requerido")
        end
      end

      context 'when a row has a nil price' do
        let(:rows) do
          [
            ["SKU", "Nombre *", "Descripción", "Precio Unitario *", "Unidad", "Marca", "Proveedor"],
            [nil,   "Producto", "descripción", nil,                 "L",      nil,     nil]
          ]
        end

        it 'records an error for that row' do
          result = call_service("/tmp/file.xlsx", "products.xlsx")
          expect(result[:imported]).to eq(0)
          expect(result[:errors].first[:message]).to include("precio unitario es inválido")
        end
      end

      context 'when a product with the same SKU already exists' do
        let!(:existing_product) { create(:product, sku: "PR-001", name: "Old Name") }

        it 'updates the existing product' do
          call_service("/tmp/file.xlsx", "products.xlsx")
          existing_product.reload
          expect(existing_product.name).to eq("Aceite 5W-30")
        end

        it 'does not create a duplicate product' do
          expect {
            call_service("/tmp/file.xlsx", "products.xlsx")
          }.to change(Product, :count).by(1)
        end
      end

      context 'with a job_id for progress broadcast' do
        let(:job_id) { "test-job-123" }

        it 'broadcasts progress via ActionCable' do
          expect(ActionCable.server).to receive(:broadcast).with(
            "import_#{job_id}",
            hash_including(type: "progress")
          ).at_least(:once)

          call_service("/tmp/file.xlsx", "products.xlsx")
        end
      end
    end

    context 'when Roo raises an error reading the file' do
      before do
        allow(Roo::Excelx).to receive(:new).and_raise(Roo::Error, "corrupt file")
      end

      it 'returns an error result' do
        result = call_service("/tmp/file.xlsx", "products.xlsx")
        expect(result[:imported]).to eq(0)
        expect(result[:errors].first).to include("corrupt file")
      end
    end
  end
end
