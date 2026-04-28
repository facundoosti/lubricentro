class Api::V1::SuppliersController < ApplicationController
  before_action :set_supplier, only: [ :show, :update, :destroy ]

  def index
    @suppliers = Supplier.left_joins(:products)
                         .group("suppliers.id")
                         .select("suppliers.*, COUNT(products.id) AS products_count")
    @suppliers = @suppliers.by_name(params[:search]) if params[:search].present?
    @suppliers = @suppliers.ordered

    @pagy, @suppliers = pagy(@suppliers, items: safe_per_page(params[:per_page]))

    render_json(SupplierSerializer.render_as_hash(@suppliers, root: :suppliers))
  end

  def show
    render_json(SupplierSerializer.render_as_hash(@supplier))
  end

  def create
    @supplier = Supplier.new(supplier_params)
    if @supplier.save
      render_json(SupplierSerializer.render_as_hash(@supplier), message: "Proveedor creado exitosamente", status: :created)
    else
      render_json({}, message: "Error al crear el proveedor", errors: @supplier.errors.full_messages, status: :unprocessable_content)
    end
  end

  def update
    if @supplier.update(supplier_params)
      render_json(SupplierSerializer.render_as_hash(@supplier), message: "Proveedor actualizado exitosamente")
    else
      render_json({}, message: "Error al actualizar el proveedor", errors: @supplier.errors.full_messages, status: :unprocessable_content)
    end
  end

  def destroy
    if @supplier.products.exists?
      render_json({}, message: "No se puede eliminar un proveedor con productos asociados", errors: [ "El proveedor tiene productos asociados" ], status: :unprocessable_content)
      return
    end

    @supplier.destroy
    render_json({}, message: "Proveedor eliminado exitosamente")
  end

  private

  def set_supplier
    @supplier = Supplier.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_json({}, message: "Proveedor no encontrado", errors: [ "Proveedor no encontrado" ], status: :not_found)
  end

  def supplier_params
    params.require(:supplier).permit(:name, :cuit, :email, :phone, :address, :notes)
  end
end
