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
    end

    context "without authentication" do
      it "returns unauthorized" do
        post import_api_v1_products_url
        expect(response).to have_http_status(:unauthorized)
      end
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

  def json_response
    JSON.parse(response.body, symbolize_names: true)
  end
end
