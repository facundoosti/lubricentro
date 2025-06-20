class Api::V1::ProductsController < ApplicationController
  before_action :set_product, only: [ :show, :update, :destroy ]

  def index
    @products = Product.all
    @products = @products.by_name(params[:search]) if params[:search].present?

    @pagy, @products = pagy(@products, items: safe_per_page(params[:per_page]))

    render_json(ProductSerializer.render_as_hash(@products, root: :products))
  end

  def show
    render_json(ProductSerializer.render_as_hash(@product))
  end

  def create
    @product = Product.new(product_params)
    if @product.save
      render_json(ProductSerializer.render_as_hash(@product), message: "Product created successfully", status: :created)
    else
      render_json({}, message: "Error creating product", errors: @product.errors.full_messages, status: :unprocessable_entity)
    end
  end

  def update
    if @product.update(product_params)
      render_json(ProductSerializer.render_as_hash(@product), message: "Product updated successfully")
    else
      render_json({}, message: "Error updating product", errors: @product.errors.full_messages, status: :unprocessable_entity)
    end
  end

  def destroy
    @product.destroy
    render_json({}, message: "Product deleted successfully")
  end

  private

  def set_product
    @product = Product.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_json({}, message: "Product not found", errors: [ "Product not found" ], status: :not_found)
  end

  def product_params
    params.require(:product).permit(:name, :description, :unit_price, :unit)
  end
end
