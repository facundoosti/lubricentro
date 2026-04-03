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

RSpec.describe BudgetSerializer, type: :serializer do
  let(:customer) { create(:customer) }
  let(:vehicle)  { create(:vehicle, customer: customer) }
  let(:budget)   { create(:budget, customer: customer, vehicle: vehicle) }

  before do
    create(:budget_item, budget: budget, quantity: 2, unit_price: 100)
    budget.reload
    budget.save!
  end

  describe 'default view' do
    subject(:result) { BudgetSerializer.render_as_hash(budget) }

    it 'includes core fields' do
      expect(result).to include(
        :id, :status, :status_label, :date, :notes,
        :card_surcharge_percentage, :total_list, :total_card,
        :customer_id, :vehicle_id
      )
    end

    it 'formats date as ISO8601' do
      expect(result[:date]).to eq(budget.date.iso8601)
    end
  end

  describe ':with_items view' do
    subject(:result) { BudgetSerializer.render_as_hash(budget, view: :with_items) }

    it 'includes items association' do
      expect(result[:items]).to be_an(Array)
      expect(result[:items].first).to include(:id, :description, :quantity, :unit_price, :total)
    end

    it 'includes customer association' do
      expect(result[:customer]).to include(:id, :name)
    end

    it 'includes vehicle association' do
      expect(result[:vehicle]).to include(:id, :brand, :model)
    end
  end
end
