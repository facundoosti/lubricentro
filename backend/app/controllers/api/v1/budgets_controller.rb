class Api::V1::BudgetsController < ApplicationController
  before_action :set_budget, only: [ :show, :update, :destroy ]

  # GET /api/v1/budgets
  def index
    @budgets = Budget.includes(:customer, :vehicle)
    @budgets = @budgets.by_search(params[:search]) if params[:search].present?
    @budgets = @budgets.by_status(params[:status]) if params[:status].present?
    @budgets = @budgets.recent

    @pagy, @budgets = pagy(@budgets, items: safe_per_page(params[:per_page]))
    @serializer = BudgetSerializer.render_as_hash(@budgets, root: :budgets)
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
      render_json(@serializer, message: "Budget creado exitosamente", status: :created)
    else
      render_json({ errors: @budget.errors.full_messages }, message: "Error al crear el budget", status: :unprocessable_entity)
    end
  end

  # PATCH/PUT /api/v1/budgets/:id
  def update
    if @budget.update(budget_params)
      @serializer = BudgetSerializer.render_as_hash(@budget, view: :with_items)
      render_json(@serializer, message: "Budget actualizado exitosamente")
    else
      render_json({ errors: @budget.errors.full_messages }, message: "Error al actualizar el budget", status: :unprocessable_entity)
    end
  end

  # DELETE /api/v1/budgets/:id
  def destroy
    @budget.destroy
    render_json({}, message: "Budget eliminado exitosamente")
  end

  private

  def set_budget
    @budget = Budget.includes(:customer, :vehicle, :items).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_json({ errors: [ "Budget no encontrado" ] }, message: "Budget no encontrado", status: :not_found)
  end

  def budget_params
    params.require(:budgets).permit(
      :customer_id, :vehicle_id, :vehicle_description,
      :date, :status, :notes, :card_surcharge_percentage,
      items_attributes: [ :id, :position, :quantity, :description, :unit_price, :_destroy ]
    )
  end
end
