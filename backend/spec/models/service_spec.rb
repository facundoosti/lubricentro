# == Schema Information
#
# Table name: services
#
#  id          :integer          not null, primary key
#  name        :string(100)      not null
#  description :text
#  base_price  :decimal(10, 2)   not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_services_on_base_price  (base_price)
#  index_services_on_name        (name) UNIQUE
#

require 'rails_helper'

RSpec.describe Service, type: :model do
  # Associations (to be added when ServiceRecord is implemented)
  # it { should have_many(:service_record_services).dependent(:destroy) }
  # it { should have_many(:service_records).through(:service_record_services) }

  # Validations
  describe 'validations' do
    subject { build(:service) }

    it { should validate_presence_of(:name) }
    it { should validate_length_of(:name).is_at_most(100) }
    it { should validate_uniqueness_of(:name).case_insensitive }

    it { should validate_length_of(:description).is_at_most(1000) }
    it { should allow_value('').for(:description) }
    it { should allow_value(nil).for(:description) }

    it { should validate_presence_of(:base_price) }
    it { should validate_numericality_of(:base_price).is_greater_than(0) }
  end

  # Scopes
  describe 'scopes' do
    let!(:oil_change) { create(:service, :oil_change) }
    let!(:brake_service) { create(:service, :brake_service) }
    let!(:tire_rotation) { create(:service, :tire_rotation) }

    describe '.by_name' do
      it 'finds services by partial name match (case insensitive)' do
        results = Service.by_name('oil')
        expect(results).to include(oil_change)
        expect(results).not_to include(brake_service)
      end

      it 'handles case insensitive search' do
        results = Service.by_name('OIL')
        expect(results).to include(oil_change)
      end
    end

    describe '.by_price_range' do
      it 'finds services within price range' do
        # tire_rotation: $35, oil_change: $85, brake_service: $250
        results = Service.by_price_range(3000, 9000) # $30-$90
        expect(results).to include(oil_change, tire_rotation)
        expect(results).not_to include(brake_service)
      end
    end
  end

  # Methods
  describe 'instance methods' do
    let(:service) { create(:service, :oil_change) }

    describe '#display_name' do
      it 'returns the name when present' do
        expect(service.display_name).to eq('Oil Change')
      end

      it 'returns fallback when name is blank' do
        service.name = ''
        expect(service.display_name).to eq("Service ##{service.id}")
      end
    end

    describe '#formatted_price' do
      it 'returns formatted price with currency symbol' do
        service.base_price = 8500
        expect(service.formatted_price).to eq('$8500.0')
      end
    end
  end

  # Factory validation
  describe 'factory' do
    it 'has a valid default factory' do
      service = build(:service)
      expect(service).to be_valid
    end

    it 'has valid trait factories' do
      expect(build(:service, :oil_change)).to be_valid
      expect(build(:service, :brake_service)).to be_valid
      expect(build(:service, :tire_rotation)).to be_valid
      expect(build(:service, :expensive)).to be_valid
      expect(build(:service, :cheap)).to be_valid
    end
  end
end
