# == Schema Information
#
# Table name: budget_items
#
#  id          :bigint           not null, primary key
#  description :string(300)      not null
#  iva_rate    :decimal(4, 2)
#  position    :integer          default(0), not null
#  quantity    :decimal(10, 2)   default(1.0), not null
#  total       :decimal(12, 2)   default(0.0), not null
#  unit_price  :decimal(12, 2)   default(0.0), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  budget_id   :bigint           not null
#
# Indexes
#
#  index_budget_items_on_budget_id               (budget_id)
#  index_budget_items_on_budget_id_and_position  (budget_id,position)
#
# Foreign Keys
#
#  fk_rails_...  (budget_id => budgets.id)
#
require 'rails_helper'

RSpec.describe BudgetItem, type: :model do
  subject(:budget_item) { build(:budget_item) }

  describe 'associations' do
    it { is_expected.to belong_to(:budget) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:description) }
    it { is_expected.to validate_length_of(:description).is_at_most(500) }

    it 'guarda una descripción de 500 caracteres en la base (nombre largo de producto)' do
      item = create(:budget_item, description: 'A' * 500)
      expect(item.reload.description.length).to eq(500)
    end
    it { is_expected.to validate_presence_of(:quantity) }
    it { is_expected.to validate_numericality_of(:quantity).is_greater_than(0) }
    it { is_expected.to validate_presence_of(:unit_price) }
    it { is_expected.to validate_numericality_of(:unit_price).is_greater_than_or_equal_to(0) }

    it 'acepta IVA 21, 10,5 o vacío' do
      [ 21, 10.5, nil ].each do |rate|
        expect(build(:budget_item, iva_rate: rate)).to be_valid
      end
    end

    it 'rechaza otras alícuotas' do
      item = build(:budget_item, iva_rate: 15)
      expect(item).not_to be_valid
      expect(item.errors[:iva_rate]).to be_present
    end
  end

  describe '#compute_total' do
    it 'calculates total as quantity * unit_price before save' do
      item = create(:budget_item, quantity: 3, unit_price: 150)
      expect(item.total).to eq(450)
    end

    it 'allows zero unit_price' do
      item = create(:budget_item, quantity: 1, unit_price: 0)
      expect(item.total).to eq(0)
    end
  end

  describe 'default_scope' do
    it 'orders by position' do
      budget = create(:budget)
      item2 = create(:budget_item, budget: budget, position: 2)
      item0 = create(:budget_item, budget: budget, position: 0)
      item1 = create(:budget_item, budget: budget, position: 1)

      expect(budget.reload.items.to_a).to eq([ item0, item1, item2 ])
    end
  end
end
