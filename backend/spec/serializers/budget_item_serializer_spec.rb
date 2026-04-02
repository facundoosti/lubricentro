require 'rails_helper'

RSpec.describe BudgetItemSerializer, type: :serializer do
  let(:item) { create(:budget_item, quantity: 3, unit_price: 50) }

  subject(:result) { BudgetItemSerializer.render_as_hash(item) }

  it 'includes all fields' do
    expect(result).to include(
      :id, :budget_id, :position, :quantity, :description, :unit_price, :total
    )
  end

  it 'returns computed total' do
    expect(result[:total]).to eq(item.total)
  end
end
