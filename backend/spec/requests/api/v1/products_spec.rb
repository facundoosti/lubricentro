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
        expect(response).to have_http_status(:unprocessable_entity)
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

  def json_response
    JSON.parse(response.body, symbolize_names: true)
  end
end
