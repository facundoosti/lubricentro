class Api::V1::BudgetsController < ApplicationController
  before_action :set_budget, only: [ :show, :update, :destroy, :duplicate ]

  # GET /api/v1/budgets
  def index
    @budgets = Budget.includes(:customer, :vehicle, :items)
    @budgets = @budgets.by_search(params[:search]) if params[:search].present?
    @budgets = @budgets.by_status(params[:status]) if params[:status].present?
    @budgets = @budgets.by_customer(params[:customer_id]) if params[:customer_id].present?
    @budgets = @budgets.recent

    @pagy, @budgets = pagy(@budgets, items: safe_per_page(params[:per_page]))
    @serializer = BudgetSerializer.render_as_hash(@budgets, root: :budgets, view: :with_items)
    render_json(@serializer)
  end

  # GET /api/v1/budgets/:id
  def show
    @serializer = BudgetSerializer.render_as_hash(@budget, view: :with_items)
    render_json(@serializer)
  end

  # POST /api/v1/budgets
  def create
    @budget = Budget.new(budget_params)

    if @budget.save
      @serializer = BudgetSerializer.render_as_hash(@budget, view: :with_items)
      render_json(@serializer, message: "Presupuesto creado exitosamente", status: :created)
    else
      render_json({ errors: @budget.errors.full_messages }, message: "Error al crear el presupuesto", status: :unprocessable_content)
    end
  end

  # PATCH/PUT /api/v1/budgets/:id
  def update
    if @budget.update(budget_params)
      @serializer = BudgetSerializer.render_as_hash(@budget, view: :with_items)
      render_json(@serializer, message: "Presupuesto actualizado exitosamente")
    else
      render_json({ errors: @budget.errors.full_messages }, message: "Error al actualizar el presupuesto", status: :unprocessable_content)
    end
  end

  # DELETE /api/v1/budgets/:id
  def destroy
    @budget.destroy
    render_json({}, message: "Presupuesto eliminado exitosamente")
  end

  # POST /api/v1/budgets/:id/duplicate
  # Copia cliente, vehículo, notas, recargo e ítems (con su alícuota y ganancia) en un borrador con fecha de hoy.
  def duplicate
    copy = @budget.dup
    copy.assign_attributes(status: "draft", date: Date.current)
    @budget.items.each do |item|
      copied = copy.items.build(item.attributes.slice("position", "quantity", "description", "unit_price", "iva_rate", "margin_percentage"))
      copied.legacy_iva_rate_ok = true # conserva un % anterior (p. ej. 15)
    end

    if copy.save
      @serializer = BudgetSerializer.render_as_hash(copy, view: :with_items)
      render_json(@serializer, message: "Presupuesto duplicado", status: :created)
    else
      render_json({ errors: copy.errors.full_messages }, message: "Error al duplicar el presupuesto", status: :unprocessable_content)
    end
  end

  private

  def set_budget
    @budget = Budget.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_json({ errors: [ "Presupuesto no encontrado" ] }, message: "Presupuesto no encontrado", status: :not_found)
  end

  def budget_params
    params.require(:budgets).permit(
      :customer_id, :vehicle_id, :vehicle_description,
      :date, :status, :notes, :card_surcharge_percentage,
      items_attributes: [ :id, :position, :quantity, :description, :unit_price, :iva_rate, :margin_percentage, :_destroy ]
    )
  end
end
