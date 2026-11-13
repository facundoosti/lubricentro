class Api::V1::InstallmentPlansController < ApplicationController
  before_action :set_plan, only: [ :show, :update, :destroy ]

  def index
    render_json(InstallmentPlanSerializer.render_as_hash(InstallmentPlan.ordered, root: :installment_plans))
  end

  def show
    render_json(InstallmentPlanSerializer.render_as_hash(@plan))
  end

  def create
    @plan = InstallmentPlan.new(plan_params)
    if @plan.save
      render_json(InstallmentPlanSerializer.render_as_hash(@plan), message: "Plan de cuotas creado", status: :created)
    else
      render_json({}, message: "Error al crear el plan de cuotas", errors: @plan.errors.full_messages, status: :unprocessable_content)
    end
  end

  def update
    if @plan.update(plan_params)
      render_json(InstallmentPlanSerializer.render_as_hash(@plan), message: "Plan de cuotas actualizado")
    else
      render_json({}, message: "Error al actualizar el plan de cuotas", errors: @plan.errors.full_messages, status: :unprocessable_content)
    end
  end

  def destroy
    @plan.destroy
    render_json({}, message: "Plan de cuotas eliminado")
  end

  private

  def set_plan
    @plan = InstallmentPlan.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_json({}, message: "Plan de cuotas no encontrado", errors: [ "Plan de cuotas no encontrado" ], status: :not_found)
  end

  def plan_params
    params.require(:installment_plan).permit(:name, :installments, :surcharge_percentage, :active, :position)
  end
end
