class Api::V1::ProductsController < ApplicationController
  before_action :set_product, only: [ :show, :update, :destroy ]

  def index
    @products = Product.includes(:image_attachment, :supplier)
    @products = @products.by_name(params[:search]) if params[:search].present?
    @products = @products.by_supplier(params[:supplier_id]) if params[:supplier_id].present?

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
      render_json({}, message: "Error creating product", errors: @product.errors.full_messages, status: :unprocessable_content)
    end
  end

  def update
    if @product.update(product_params)
      render_json(ProductSerializer.render_as_hash(@product), message: "Product updated successfully")
    else
      render_json({}, message: "Error updating product", errors: @product.errors.full_messages, status: :unprocessable_content)
    end
  end

  def destroy
    @product.destroy
    render_json({}, message: "Product deleted successfully")
  end

  def import
    unless params[:file].present?
      render_json({}, message: "No se adjuntó ningún archivo", errors: [ "Se requiere un archivo Excel (.xlsx o .xls)" ], status: :unprocessable_content)
      return
    end

    result = ProductImportService.new(params[:file]).call

    render_json(
      { imported: result[:imported], errors: result[:errors] },
      message: "Importación completada: #{result[:imported]} producto(s) importados",
      status: :ok
    )
  end

  def import_template
    package = Axlsx::Package.new
    workbook = package.workbook

    workbook.add_worksheet(name: "Productos") do |sheet|
      header_style = workbook.styles.add_style(
        bg_color: "7C3AED",
        fg_color: "FFFFFF",
        b: true,
        alignment: { horizontal: :center }
      )

      sheet.add_row(
        [ "SKU", "Nombre *", "Descripción", "Precio Unitario *", "Unidad", "Proveedor (nombre)" ],
        style: header_style
      )
      sheet.add_row([ "PRD-EJEMPLO", "Aceite 5W-30", "Aceite de motor sintético", "5000.00", "litro", "Proveedor SA" ])

      sheet.column_widths 15, 30, 40, 18, 12, 25
    end

    send_data package.to_stream.read,
              filename: "template_productos.xlsx",
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              disposition: "attachment"
  end

  def bulk_price_preview
    products = filtered_products_for_bulk

    previews = products.map do |p|
      new_price = calculate_new_price(p.unit_price, params[:adjustment_type], params[:adjustment_value])
      {
        id: p.id,
        name: p.name,
        sku: p.sku,
        current_price: p.unit_price.to_s,
        new_price: new_price.round(2).to_s
      }
    end

    render_json({ previews: previews, total: previews.count }, message: "Vista previa generada")
  end

  def bulk_price_update
    products = filtered_products_for_bulk

    unless products.any?
      render_json({}, message: "No se encontraron productos con los criterios dados", errors: [ "Sin productos" ], status: :unprocessable_content)
      return
    end

    updated = 0
    products.each do |p|
      new_price = calculate_new_price(p.unit_price, params[:adjustment_type], params[:adjustment_value])
      p.update_column(:unit_price, new_price.round(2))
      updated += 1
    end

    render_json({ updated: updated }, message: "#{updated} producto(s) actualizados exitosamente")
  end

  private

  def set_product
    @product = Product.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_json({}, message: "Product not found", errors: [ "Product not found" ], status: :not_found)
  end

  def product_params
    params.require(:product).permit(:name, :sku, :description, :unit_price, :unit, :supplier_id, :image)
  end

  def filtered_products_for_bulk
    scope = Product.all
    scope = scope.by_supplier(params[:supplier_id]) if params[:supplier_id].present?
    scope = scope.by_name(params[:search]) if params[:search].present?
    scope
  end

  def calculate_new_price(current_price, adjustment_type, adjustment_value)
    value = adjustment_value.to_f
    case adjustment_type
    when "percentage"
      current_price * (1 + value / 100.0)
    when "fixed"
      current_price + value
    else
      current_price
    end
  end
end
