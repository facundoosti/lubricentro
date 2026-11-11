require 'rails_helper'

# El nombre de producto es único: la factory no puede repetirlo entre
# registros del mismo test (Faker::Commerce.product_name repetía y hacía
# fallar specs al azar en CI).
RSpec.describe 'factory :product' do
  it 'genera nombres únicos' do
    names = Array.new(500) { build(:product).name }
    expect(names.uniq.size).to eq(names.size)
  end
end
