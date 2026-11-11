# == Schema Information
#
# Table name: budgets
#
#  id                        :bigint           not null, primary key
#  card_surcharge_percentage :decimal(5, 2)    default(0.0)
#  date                      :date             not null
#  notes                     :text
#  status                    :string(20)       default("draft"), not null
#  subtotal_net              :decimal(12, 2)   default(0.0)
#  total_card                :decimal(12, 2)   default(0.0)
#  total_iva                 :decimal(12, 2)   default(0.0)
#  total_list                :decimal(12, 2)   default(0.0)
#  vehicle_description       :string(200)
#  created_at                :datetime         not null
#  updated_at                :datetime         not null
#  customer_id               :bigint
#  vehicle_id                :bigint
#
# Indexes
#
#  index_budgets_on_customer_id  (customer_id)
#  index_budgets_on_date         (date)
#  index_budgets_on_status       (status)
#  index_budgets_on_vehicle_id   (vehicle_id)
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => customers.id)
#  fk_rails_...  (vehicle_id => vehicles.id)
#
require 'rails_helper'

RSpec.describe Budget, type: :model do
  subject(:budget) { build(:budget) }

  describe 'associations' do
    it { is_expected.to belong_to(:customer).optional }
    it { is_expected.to belong_to(:vehicle).optional }
    it { is_expected.to have_many(:items).class_name('BudgetItem').dependent(:destroy) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:date) }
    it { is_expected.to validate_inclusion_of(:status).in_array(%w[draft sent approved rejected]) }

    it 'validates card_surcharge_percentage is >= 0' do
      budget.card_surcharge_percentage = -1
      expect(budget).not_to be_valid
    end

    it 'validates card_surcharge_percentage is <= 100' do
      budget.card_surcharge_percentage = 101
      expect(budget).not_to be_valid
    end

    it 'is valid with 0% surcharge' do
      budget.card_surcharge_percentage = 0
      expect(budget).to be_valid
    end

    describe 'vehículo del cliente' do
      let(:customer) { create(:customer) }

      it 'acepta un vehículo del mismo cliente' do
        budget = build(:budget, customer: customer, vehicle: create(:vehicle, customer: customer))
        expect(budget).to be_valid
      end

      it 'rechaza un vehículo de otro cliente' do
        budget = build(:budget, customer: customer, vehicle: create(:vehicle))
        expect(budget).not_to be_valid
        expect(budget.errors[:vehicle]).to be_present
      end

      it 'permite editar un presupuesto viejo inconsistente si no cambia cliente ni vehículo' do
        budget = create(:budget, customer: customer, vehicle: create(:vehicle, customer: customer))
        budget.update_column(:vehicle_id, create(:vehicle).id)
        expect(budget.reload.update(status: 'sent')).to be(true)
      end

      it 'acepta un vehículo sin cliente elegido' do
        expect(build(:budget, customer: nil, vehicle: create(:vehicle))).to be_valid
      end
    end
  end

  describe 'scopes' do
    let!(:draft_budget)    { create(:budget, status: 'draft', date: 1.day.ago) }
    let!(:sent_budget)     { create(:budget, status: 'sent', date: Date.current) }
    let!(:approved_budget) { create(:budget, status: 'approved', date: 2.days.ago) }

    describe '.recent' do
      it 'orders by date descending' do
        expect(Budget.recent.first).to eq(sent_budget)
        expect(Budget.recent.last).to eq(approved_budget)
      end
    end

    describe '.by_status' do
      it 'filters by status' do
        expect(Budget.by_status('draft')).to include(draft_budget)
        expect(Budget.by_status('draft')).not_to include(sent_budget)
      end
    end

    describe '.by_search' do
      let(:customer) { create(:customer, name: 'Juan Perez') }
      let!(:budget_with_customer) { create(:budget, customer: customer) }
      let!(:budget_with_description) { create(:budget, vehicle_description: 'Toyota Corolla ABC123') }

      it 'finds by customer name' do
        expect(Budget.by_search('Juan')).to include(budget_with_customer)
      end

      it 'finds by vehicle description' do
        expect(Budget.by_search('Toyota')).to include(budget_with_description)
      end

      it 'returns nothing for unmatched search' do
        expect(Budget.by_search('ZZZnotfound')).to be_empty
      end
    end
  end

  describe '#compute_totals' do
    let(:budget) { create(:budget, card_surcharge_percentage: 10) }

    before do
      create(:budget_item, budget: budget, quantity: 2, unit_price: 100)
      create(:budget_item, budget: budget, quantity: 1, unit_price: 50)
      budget.reload
      budget.save!
    end

    it 'calculates total_list as sum of items' do
      expect(budget.total_list).to eq(250)
    end

    it 'calculates total_card with surcharge' do
      expect(budget.total_card).to be_within(0.01).of(275)
    end
  end

  describe 'totales con IVA' do
    def build_budget(surcharge, items)
      budget = build(:budget, card_surcharge_percentage: surcharge)
      items.each { |attrs| budget.items.build(attrs.merge(description: "Ítem")) }
      budget.save!
      budget
    end

    context 'presupuesto mixto' do
      subject(:budget) do
        build_budget(10, [
          { quantity: 2, unit_price: 10_000, iva_rate: 21 },
          { quantity: 1, unit_price: 4_000, iva_rate: 10.5 },
          { quantity: 1, unit_price: 15_000, iva_rate: nil }
        ])
      end

      it 'calcula subtotal neto, IVA, sin IVA y totales' do
        expect(budget).to have_attributes(subtotal_net: 24_000, total_iva: 4_620, total_list: 43_620, total_card: 47_982)
        expect(budget.exempt_total).to eq(15_000)
        expect(budget.margin_total).to eq(0)
      end

      it 'desglosa el IVA por alícuota' do
        expect(budget.iva_breakdown).to eq([
          { rate: 21, base: 20_000, amount: 4_200 },
          { rate: 10.5, base: 4_000, amount: 420 }
        ])
      end
    end

    it 'aplica el recargo sobre el total con IVA' do
      budget = build_budget(10, [ { quantity: 1, unit_price: 100, iva_rate: 21 } ])
      expect(budget.total_list).to eq(121)
      expect(budget.total_card).to eq(BigDecimal("133.1"))
    end

    it 'redondea el IVA por alícuota y no por línea' do
      budget = build_budget(0, [
        { quantity: 1, unit_price: BigDecimal("0.05"), iva_rate: 21 },
        { quantity: 1, unit_price: BigDecimal("0.05"), iva_rate: 21 }
      ])
      # por línea serían 0.01 + 0.01; por alícuota 0.10 * 21% = 0.021 -> 0.02
      expect(budget.total_iva).to eq(BigDecimal("0.02"))
    end

    it 'ignora los ítems marcados para borrar' do
      budget = build_budget(0, [ { quantity: 1, unit_price: 100, iva_rate: 21 }, { quantity: 1, unit_price: 50, iva_rate: nil } ])
      budget.update!(items_attributes: [ { id: budget.items.last.id, _destroy: "1" } ])
      expect(budget.reload).to have_attributes(total_list: 121, total_iva: 21)
    end

    it 'conserva un ítem viejo con % libre al recalcular' do
      budget = build_budget(0, [ { quantity: 1, unit_price: 1_000, iva_rate: 21 } ])
      budget.items.first.update_column(:iva_rate, 15)
      budget.reload.update!(notes: "Editado", items_attributes: [ { id: budget.items.first.id, quantity: 2 } ])
      expect(budget.reload).to have_attributes(subtotal_net: 2_000, total_iva: 300, total_list: 2_300)
    end

    it 'suma la ganancia al total (1 × 1000, 21%, 30%, recargo 10%)' do
      budget = build_budget(10, [ { quantity: 1, unit_price: 1_000, iva_rate: 21, margin_percentage: 30 } ])
      expect(budget.reload).to have_attributes(subtotal_net: 1_000, total_iva: 210, total_list: 1_510, total_card: 1_661)
      expect(budget.margin_total).to eq(300)
      expect(budget.iva_breakdown).to eq([ { rate: 21, base: 1_000, amount: 210 } ])
    end

    it 'suma la ganancia de los ítems sin IVA' do
      budget = build_budget(0, [ { quantity: 2, unit_price: 500, iva_rate: nil, margin_percentage: 20 } ])
      expect(budget).to have_attributes(total_iva: 0, total_list: 1_200)
      expect(budget.margin_total).to eq(200)
    end

    it 'no cuenta la ganancia de los ítems marcados para borrar' do
      budget = build_budget(0, [ { quantity: 1, unit_price: 1_000, iva_rate: nil, margin_percentage: 50 },
                                 { quantity: 1, unit_price: 100, iva_rate: nil } ])
      budget.update!(items_attributes: [ { id: budget.items.first.id, _destroy: "1" } ])
      expect(budget.reload).to have_attributes(total_list: 100)
      expect(budget.margin_total).to eq(0)
    end

    it 'no cambia los totales de un presupuesto sin alícuotas' do
      budget = build_budget(10, [ { quantity: 2, unit_price: 25_000, iva_rate: nil } ])
      budget.save!
      expect(budget).to have_attributes(total_list: 50_000, total_iva: 0, subtotal_net: 0, total_card: 55_000)
    end
  end

  describe '#status_label' do
    it { expect(build(:budget, status: 'draft').status_label).to eq('Borrador') }
    it { expect(build(:budget, status: 'sent').status_label).to eq('Enviado') }
    it { expect(build(:budget, status: 'approved').status_label).to eq('Aprobado') }
    it { expect(build(:budget, status: 'rejected').status_label).to eq('Rechazado') }
  end
end
