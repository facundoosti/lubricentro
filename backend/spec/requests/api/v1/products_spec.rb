require 'rails_helper'

RSpec.describe "Api::V1::Products", type: :request do
  include ApiHelper
  let(:user) { create(:user) }
  let(:valid_attributes) { attributes_for(:product, :oil) }
  let(:invalid_attributes) { attributes_for(:product, name: '') }

  describe "GET /api/v1/products" do
    let!(:products) { create_list(:product, 5) }

    before { get api_v1_products_url, headers: auth_headers(user) }

    it "returns a successful response" do
      expect(response).to be_successful
    end

    it "returns all products with pagination" do
      expect(json_response[:data][:products].size).to eq(5)
      expect(json_response[:data][:pagination]).to be_present
    end

    context "without authentication" do
      it "returns unauthorized" do
        get api_v1_products_url
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/products/:id" do
    let(:product) { create(:product) }

    before { get api_v1_product_url(product), headers: auth_headers(user) }

    it "returns a successful response" do
      expect(response).to be_successful
    end

    it "returns the product data" do
      expect(json_response[:data][:id]).to eq(product.id)
    end

    context "con IVA" do
      let(:product) { create(:product, unit_price: 10_000, iva_rate: 10.5) }

      it "devuelve la alícuota y el precio con IVA" do
        expect(json_response[:data][:iva_rate]).to eq("10.5")
        expect(json_response[:data][:unit_price_with_iva]).to eq("11050.0")
      end
    end

    context "when the product does not exist" do
      it "returns not found" do
        get api_v1_product_url(id: 999_999), headers: auth_headers(user)
        expect(response).to have_http_status(:not_found)
        expect(json_response[:success]).to be(false)
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        get api_v1_product_url(product)
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/v1/products" do
    context "with valid parameters" do
      it "creates a new Product" do
        expect {
          post api_v1_products_url, params: { product: valid_attributes }, headers: auth_headers(user)
        }.to change(Product, :count).by(1)
      end

      it "returns a created response" do
        post api_v1_products_url, params: { product: valid_attributes }, headers: auth_headers(user)
        expect(response).to have_http_status(:created)
        expect(json_response[:data][:name]).to eq(valid_attributes[:name])
      end
    end

    context "con alícuota de IVA" do
      it "usa 21% si no se envía" do
        post api_v1_products_url, params: { product: valid_attributes }, headers: auth_headers(user)
        expect(json_response[:data][:iva_rate]).to eq("21.0")
      end

      it "guarda 10,5%" do
        post api_v1_products_url, params: { product: valid_attributes.merge(iva_rate: "10.5") }, headers: auth_headers(user)
        expect(response).to have_http_status(:created)
        expect(Product.last.iva_rate).to eq(10.5)
      end

      it "rechaza una alícuota inválida" do
        post api_v1_products_url, params: { product: valid_attributes.merge(iva_rate: "15") }, headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:success]).to be(false)
        expect(json_response[:errors]).to be_present
      end
    end

    context "with invalid parameters" do
      it "does not create a new Product" do
        expect {
          post api_v1_products_url, params: { product: invalid_attributes }, headers: auth_headers(user)
        }.to change(Product, :count).by(0)
      end

      it "returns an unprocessable entity response" do
        post api_v1_products_url, params: { product: invalid_attributes }, headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        post api_v1_products_url, params: { product: valid_attributes }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PATCH /api/v1/products/:id" do
    let(:product) { create(:product) }
    let(:new_attributes) { attributes_for(:product, :air_filter) }

    it "updates the requested product" do
      patch api_v1_product_url(product), params: { product: new_attributes }, headers: auth_headers(user)
      product.reload
      expect(product.name).to eq(new_attributes[:name])
    end

    it "returns a successful response" do
      patch api_v1_product_url(product), params: { product: new_attributes }, headers: auth_headers(user)
      expect(response).to be_successful
    end

    it "actualiza la alícuota de IVA" do
      patch api_v1_product_url(product), params: { product: { iva_rate: "10.5" } }, headers: auth_headers(user)
      expect(product.reload.iva_rate).to eq(10.5)
    end

    context "without authentication" do
      it "returns unauthorized" do
        patch api_v1_product_url(product), params: { product: new_attributes }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/products/:id" do
    let!(:product) { create(:product) }

    it "destroys the requested product" do
      expect {
        delete api_v1_product_url(product), headers: auth_headers(user)
      }.to change(Product, :count).by(-1)
    end

    it "returns a successful response" do
      delete api_v1_product_url(product), headers: auth_headers(user)
      expect(response).to be_successful
    end

    context "without authentication" do
      it "returns unauthorized" do
        delete api_v1_product_url(product)
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/products with filters" do
    let(:supplier) { create(:supplier) }
    let!(:product_with_supplier) { create(:product, :oil, supplier: supplier) }
    let!(:product_mobil) { create(:product, :air_filter, brand: "Mobil") }

    it "filters by supplier_id" do
      get api_v1_products_url, params: { supplier_id: supplier.id }, headers: auth_headers(user)
      expect(json_response[:data][:products].map { |p| p[:id] }).to include(product_with_supplier.id)
    end

    it "filters by brand" do
      get api_v1_products_url, params: { brand: "Mobil" }, headers: auth_headers(user)
      ids = json_response[:data][:products].map { |p| p[:id] }
      expect(ids).to include(product_mobil.id)
    end

    it "returns 404 for non-existent product" do
      get api_v1_product_url(id: 999999), headers: auth_headers(user)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/products/import" do
    context "without a file" do
      it "returns unprocessable_content" do
        post import_api_v1_products_url, headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end
    end

    context "with an unsupported file format" do
      let(:file) { fixture_file_upload(Rails.root.join("spec/fixtures/files/test.txt"), "text/plain") }

      before do
        FileUtils.mkdir_p(Rails.root.join("spec/fixtures/files"))
        File.write(Rails.root.join("spec/fixtures/files/test.txt"), "hello")
      end

      it "returns unprocessable_content" do
        post import_api_v1_products_url, params: { file: file }, headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "with a valid xlsx file" do
      let(:file) { fixture_file_upload(Rails.root.join("spec/fixtures/files/test.xlsx"), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") }

      before do
        FileUtils.mkdir_p(Rails.root.join("spec/fixtures/files"))
        package = Axlsx::Package.new
        package.workbook.add_worksheet(name: "Productos") { |s| s.add_row([ "SKU", "Nombre" ]) }
        package.serialize(Rails.root.join("spec/fixtures/files/test.xlsx").to_s)
        allow(ProductImportJob).to receive(:perform_later)
      end

      it "returns accepted status with job_id" do
        post import_api_v1_products_url, params: { file: file }, headers: auth_headers(user)
        expect(response).to have_http_status(:accepted)
        expect(json_response[:data][:job_id]).to be_present
      end

      it "enqueues the job with a path relative to Rails.root" do
        post import_api_v1_products_url, params: { file: file }, headers: auth_headers(user)
        job_id = json_response[:data][:job_id]
        expect(ProductImportJob).to have_received(:perform_later).with("tmp/imports/#{job_id}.xlsx", "test.xlsx", job_id)
      end

      it "returns service_unavailable and cleans up when the job cannot be enqueued" do
        allow(ProductImportJob).to receive(:perform_later).and_raise(StandardError, "queue down")
        expect {
          post import_api_v1_products_url, params: { file: file }, headers: auth_headers(user)
        }.not_to change { Dir.glob(Rails.root.join("tmp/imports/*.xlsx")).size }
        expect(response).to have_http_status(:service_unavailable)
        expect(json_response[:success]).to be false
      end

      it "stores the queued status for the job" do
        allow(ProductImportStatus).to receive(:publish)
        post import_api_v1_products_url, params: { file: file }, headers: auth_headers(user)
        expect(ProductImportStatus).to have_received(:publish).with(json_response[:data][:job_id], { type: "queued" })
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        post import_api_v1_products_url
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/products/import_status/:job_id" do
    let(:job_id) { SecureRandom.uuid }

    context "when the import exists" do
      before do
        ProductImportStatus.publish(job_id, { type: "complete", imported: 3, errors: [ { row: 2, message: "falla" } ] })
      end

      it "returns the stored status" do
        get import_status_api_v1_products_url(job_id: job_id), headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
        expect(json_response[:data][:import]).to include(type: "complete", imported: 3, job_id: job_id)
        expect(json_response[:data][:import][:errors_count]).to eq(1)
        expect(json_response[:data][:import][:errors].first).to include(row: 2, message: "falla")
      end
    end

    context "when the import does not exist" do
      it "returns not_found" do
        get import_status_api_v1_products_url(job_id: "no-existe"), headers: auth_headers(user)
        expect(response).to have_http_status(:not_found)
        expect(json_response[:success]).to be false
        expect(json_response[:errors]).to be_present
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        get import_status_api_v1_products_url(job_id: job_id)
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/products/import_template (columna IVA)" do
    it "incluye la columna IVA en la plantilla" do
      get import_template_api_v1_products_url, headers: auth_headers(user)

      file = Tempfile.new([ "template", ".xlsx" ])
      file.binmode
      file.write(response.body)
      file.close
      header = Roo::Excelx.new(file.path).row(1)
      expect(header.last).to eq("IVA (21 o 10,5)")
    ensure
      file&.unlink
    end
  end

  describe "GET /api/v1/products/import_template" do
    it "returns an xlsx file" do
      get import_template_api_v1_products_url, headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      expect(response.content_type).to include("spreadsheetml")
    end

    context "without authentication" do
      it "returns unauthorized" do
        get import_template_api_v1_products_url
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/v1/products/bulk_price_preview" do
    let!(:products) { create_list(:product, 3) }

    it "returns a preview of price adjustments by percentage" do
      post bulk_price_preview_api_v1_products_url,
           params: { adjustment_type: "percentage", adjustment_value: "10" },
           headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(json_response[:data][:previews]).to be_an(Array)
      expect(json_response[:data][:previews].size).to eq(3)
    end

    it "returns a preview with fixed adjustment" do
      post bulk_price_preview_api_v1_products_url,
           params: { adjustment_type: "fixed", adjustment_value: "500" },
           headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      preview = json_response[:data][:previews].first
      expect(preview[:new_price].to_f).to eq(preview[:current_price].to_f + 500)
    end

    it "filters by product_ids" do
      target = products.first
      post bulk_price_preview_api_v1_products_url,
           params: { product_ids: [ target.id ], adjustment_type: "percentage", adjustment_value: "5" },
           headers: auth_headers(user)

      expect(json_response[:data][:previews].size).to eq(1)
      expect(json_response[:data][:previews].first[:id]).to eq(target.id)
    end

    context "without authentication" do
      it "returns unauthorized" do
        post bulk_price_preview_api_v1_products_url
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/v1/products/bulk_price_update" do
    let!(:products) { create_list(:product, 2, unit_price: 1000) }

    it "updates prices for all products by percentage" do
      post bulk_price_update_api_v1_products_url,
           params: { adjustment_type: "percentage", adjustment_value: "10" },
           headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(json_response[:data][:updated]).to eq(2)
      products.each { |p| expect(p.reload.unit_price.to_f).to be_within(0.01).of(1100.0) }
    end

    it "updates prices for specific product_ids" do
      target = products.first
      post bulk_price_update_api_v1_products_url,
           params: { product_ids: [ target.id ], adjustment_type: "fixed", adjustment_value: "200" },
           headers: auth_headers(user)

      expect(json_response[:data][:updated]).to eq(1)
      expect(target.reload.unit_price.to_f).to be_within(0.01).of(1200.0)
    end

    it "returns error when no products match" do
      post bulk_price_update_api_v1_products_url,
           params: { product_ids: [ 999999 ], adjustment_type: "percentage", adjustment_value: "10" },
           headers: auth_headers(user)

      expect(response).to have_http_status(:unprocessable_content)
    end

    context "without authentication" do
      it "returns unauthorized" do
        post bulk_price_update_api_v1_products_url
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/v1/products/bulk_iva_update" do
    let(:supplier) { create(:supplier) }
    let!(:p1) { create(:product, supplier: supplier, unit_price: 1000) }
    let!(:p2) { create(:product, supplier: supplier) }
    let!(:p3) { create(:product) }

    it "cambia la alícuota de los productos seleccionados" do
      post bulk_iva_update_api_v1_products_url,
           params: { product_ids: [ p1.id, p2.id ], iva_rate: "10.5" },
           headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(json_response[:success]).to be(true)
      expect(json_response[:data][:updated]).to eq(2)
      expect(p1.reload.iva_rate).to eq(10.5)
      expect(p2.reload.iva_rate).to eq(10.5)
      expect(p3.reload.iva_rate).to eq(21)
    end

    it "no modifica el precio" do
      post bulk_iva_update_api_v1_products_url,
           params: { product_ids: [ p1.id ], iva_rate: "10,5" },
           headers: auth_headers(user)

      expect(p1.reload.unit_price).to eq(1000)
    end

    it "filtra por proveedor" do
      post bulk_iva_update_api_v1_products_url,
           params: { supplier_id: supplier.id, iva_rate: "10.5" },
           headers: auth_headers(user)

      expect(json_response[:data][:updated]).to eq(2)
      expect(p3.reload.iva_rate).to eq(21)
    end

    it "respeta el filtro de categoría" do
      category = Category.create!(name: "Neumáticos")
      p1.update!(category: category)
      post bulk_iva_update_api_v1_products_url,
           params: { category_id: category.id.to_s, iva_rate: "10.5" },
           headers: auth_headers(user)

      expect(json_response[:data][:updated]).to eq(1)
      expect(p2.reload.iva_rate).to eq(21)
    end

    it "rechaza una alícuota inválida" do
      post bulk_iva_update_api_v1_products_url,
           params: { product_ids: [ p1.id ], iva_rate: "27" },
           headers: auth_headers(user)

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_response[:success]).to be(false)
      expect(p1.reload.iva_rate).to eq(21)
    end

    it "rechaza un request sin ids ni filtros" do
      post bulk_iva_update_api_v1_products_url, params: { iva_rate: "10.5" }, headers: auth_headers(user)

      expect(response).to have_http_status(:unprocessable_content)
      expect(p1.reload.iva_rate).to eq(21)
    end

    it "cambia todo el catálogo solo con all=true" do
      post bulk_iva_update_api_v1_products_url, params: { all: "true", iva_rate: "10.5" }, headers: auth_headers(user)

      expect(json_response[:data][:updated]).to eq(3)
    end

    it "devuelve error si no hay productos" do
      post bulk_iva_update_api_v1_products_url,
           params: { product_ids: [ 999_999 ], iva_rate: "10.5" },
           headers: auth_headers(user)

      expect(response).to have_http_status(:unprocessable_content)
    end

    context "without authentication" do
      it "returns unauthorized" do
        post bulk_iva_update_api_v1_products_url, params: { iva_rate: "21" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  def json_response
    JSON.parse(response.body, symbolize_names: true)
  end
end
