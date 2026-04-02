require 'rails_helper'

RSpec.describe BudgetItem, type: :model do
  subject(:budget_item) { build(:budget_item) }

  describe 'associations' do
    it { is_expected.to belong_to(:budget) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:description) }
    it { is_expected.to validate_length_of(:description).is_at_most(300) }
    it { is_expected.to validate_presence_of(:quantity) }
    it { is_expected.to validate_numericality_of(:quantity).is_greater_than(0) }
    it { is_expected.to validate_presence_of(:unit_price) }
    it { is_expected.to validate_numericality_of(:unit_price).is_greater_than_or_equal_to(0) }
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
