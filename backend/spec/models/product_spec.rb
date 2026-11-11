# == Schema Information
#
# Table name: products
#
#  id          :bigint           not null, primary key
#  active      :boolean          default(TRUE), not null
#  brand       :string(100)
#  description :text
#  embedding   :vector(768)
#  iva_rate    :decimal(4, 2)    default(21.0), not null
#  name        :string(500)      not null
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
    it { should validate_length_of(:name).is_at_most(500) }

    it 'guarda un nombre de 500 caracteres en la base' do
      product = create(:product, name: 'A' * 500)
      expect(product.reload.name.length).to eq(500)
    end

    it { should validate_uniqueness_of(:name).case_insensitive }

    it { should validate_length_of(:description).is_at_most(1000) }
    it { should validate_presence_of(:unit_price) }
    it { should validate_numericality_of(:unit_price).is_greater_than_or_equal_to(0) }
    it { should validate_length_of(:unit).is_at_most(50) }
    it { should validate_numericality_of(:stock).only_integer.is_greater_than_or_equal_to(0) }

    it 'acepta IVA 21 y 10,5' do
      expect(build(:product, iva_rate: 21)).to be_valid
      expect(build(:product, iva_rate: 10.5)).to be_valid
    end

    it 'rechaza otras alícuotas' do
      product = build(:product, iva_rate: 15)
      expect(product).not_to be_valid
      expect(product.errors[:iva_rate]).to be_present
    end
  end

  describe 'IVA' do
    it 'usa 21% por defecto' do
      expect(Product.new.iva_rate).to eq(21)
    end

    it 'calcula el precio con IVA al 21%' do
      expect(build(:product, unit_price: 10_000, iva_rate: 21).unit_price_with_iva).to eq(12_100)
    end

    it 'calcula el precio con IVA al 10,5%' do
      expect(build(:product, unit_price: 10_000, iva_rate: 10.5).unit_price_with_iva).to eq(11_050)
    end

    it 'redondea a 2 decimales' do
      expect(build(:product, unit_price: 99.99, iva_rate: 10.5).unit_price_with_iva).to eq(BigDecimal("110.49"))
    end
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
