class Api::V1::SupplierPhonesController < ApplicationController
  before_action :set_supplier_phone, only: [ :show, :update, :destroy ]

  # GET /api/v1/supplier_phones
  def index
    supplier_phones = SupplierPhone.order(:company_name, :phone)
    data = SupplierPhoneSerializer.render_as_hash(supplier_phones, root: :supplier_phones)
    render_json(data)
  end

  # GET /api/v1/supplier_phones/:id
  def show
    data = SupplierPhoneSerializer.render_as_hash(@supplier_phone, root: :supplier_phone)
    render_json(data)
  end

  # POST /api/v1/supplier_phones
  def create
    supplier_phone = SupplierPhone.new(supplier_phone_params)

    if supplier_phone.save
      data = SupplierPhoneSerializer.render_as_hash(supplier_phone, root: :supplier_phone)
      render_json(data, message: "Número registrado como proveedor", status: :created)
    else
      render_json({ errors: supplier_phone.errors.full_messages },
                  message: "No se pudo registrar el número",
                  status: :unprocessable_entity)
    end
  end

  # PATCH /api/v1/supplier_phones/:id
  def update
    if @supplier_phone.update(supplier_phone_params)
      data = SupplierPhoneSerializer.render_as_hash(@supplier_phone, root: :supplier_phone)
      render_json(data, message: "Proveedor actualizado")
    else
      render_json({ errors: @supplier_phone.errors.full_messages },
                  message: "No se pudo actualizar",
                  status: :unprocessable_entity)
    end
  end

  # DELETE /api/v1/supplier_phones/:id
  def destroy
    @supplier_phone.destroy!
    render_json({}, message: "Número eliminado de la lista de proveedores")
  end

  private

  def set_supplier_phone
    @supplier_phone = SupplierPhone.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_json({ errors: [ "Proveedor no encontrado" ] }, message: "No encontrado", status: :not_found)
  end

  def supplier_phone_params
    params.require(:supplier_phone).permit(:phone, :company_name, :notes)
  end
end
