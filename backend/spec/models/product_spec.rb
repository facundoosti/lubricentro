# == Schema Information
#
# Table name: products
#
#  id          :bigint           not null, primary key
#  active      :boolean          default(TRUE), not null
#  brand       :string(100)
#  description :text
#  embedding   :vector(768)
#  name        :string(100)      not null
#  sku         :string(50)
#  stock       :integer          default(0), not null
#  unit        :string(50)
#  unit_price  :decimal(10, 2)   not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  category_id :bigint
#  supplier_id :bigint
#
# Indexes
#
#  index_products_on_category_id  (category_id)
#  index_products_on_name         (name) UNIQUE
#  index_products_on_sku          (sku) UNIQUE WHERE (sku IS NOT NULL)
#  index_products_on_supplier_id  (supplier_id)
#  index_products_on_unit_price   (unit_price)
#
# Foreign Keys
#
#  fk_rails_...  (category_id => categories.id)
#  fk_rails_...  (supplier_id => suppliers.id)
#

require 'rails_helper'

RSpec.describe Product, type: :model do
  describe 'validations' do
    subject { build(:product) }

    it { should validate_presence_of(:name) }
    it { should validate_length_of(:name).is_at_most(100) }
    it { should validate_uniqueness_of(:name).case_insensitive }

    it { should validate_length_of(:description).is_at_most(1000) }
    it { should validate_presence_of(:unit_price) }
    it { should validate_numericality_of(:unit_price).is_greater_than_or_equal_to(0) }
    it { should validate_length_of(:unit).is_at_most(50) }
    it { should validate_numericality_of(:stock).only_integer.is_greater_than_or_equal_to(0) }
  end

  describe 'scopes' do
    let!(:oil) { create(:product, :oil) }
    let!(:filter) { create(:product, :air_filter, unit_price: 3000) }

    it 'finds products by name' do
      expect(Product.by_name('oil')).to include(oil)
      expect(Product.by_name('filter')).to include(filter)
    end

    it 'finds products by price range' do
      expect(Product.by_price_range(7000, 8000)).to include(oil)
      expect(Product.by_price_range(2000, 4000)).to include(filter)
    end
  end

  describe 'methods' do
    let(:product) { create(:product, unit_price: 123.45) }

    it 'returns a formatted price' do
      expect(product.formatted_price).to eq('$123.45')
    end
  end

  describe 'factory' do
    it 'has a valid default factory' do
      expect(build(:product)).to be_valid
    end

    it 'has valid trait factories' do
      expect(build(:product, :oil)).to be_valid
      expect(build(:product, :air_filter)).to be_valid
      expect(build(:product, :brake_fluid)).to be_valid
    end
  end
end
