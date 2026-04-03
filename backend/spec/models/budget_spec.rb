# == Schema Information
#
# Table name: budgets
#
#  id                        :bigint           not null, primary key
#  card_surcharge_percentage :decimal(5, 2)    default(0.0)
#  date                      :date             not null
#  notes                     :text
#  status                    :string(20)       default("draft"), not null
#  total_card                :decimal(12, 2)   default(0.0)
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

  describe '#status_label' do
    it { expect(build(:budget, status: 'draft').status_label).to eq('Borrador') }
    it { expect(build(:budget, status: 'sent').status_label).to eq('Enviado') }
    it { expect(build(:budget, status: 'approved').status_label).to eq('Aprobado') }
    it { expect(build(:budget, status: 'rejected').status_label).to eq('Rechazado') }
  end
end
