# == Schema Information
#
# Table name: service_record_services
#
#  id                :bigint           not null, primary key
#  quantity          :integer          default(1), not null
#  unit_price        :decimal(10, 2)   not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  service_id        :bigint           not null
#  service_record_id :bigint           not null
#
# Indexes
#
#  index_service_record_services_on_quantity           (quantity)
#  index_service_record_services_on_service_id         (service_id)
#  index_service_record_services_on_service_record_id  (service_record_id)
#  index_service_record_services_on_unit_price         (unit_price)
#  index_service_record_services_unique                (service_record_id,service_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (service_id => services.id)
#  fk_rails_...  (service_record_id => service_records.id)
#
require 'rails_helper'

RSpec.describe ServiceRecordService, type: :model do
  describe 'associations' do
    it { should belong_to(:service_record) }
    it { should belong_to(:service) }
  end

  describe 'validations' do
    subject { build(:service_record_service) }

    it { should validate_presence_of(:quantity) }
    it { should validate_numericality_of(:quantity).is_greater_than(0) }
    it { should validate_presence_of(:unit_price) }
    it { should validate_numericality_of(:unit_price).is_greater_than_or_equal_to(0) }

    it 'validates uniqueness of service_record_id scoped to service_id' do
      existing = create(:service_record_service)
      duplicate = build(:service_record_service, service_record: existing.service_record, service: existing.service)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:service_record_id]).to be_present
    end
  end

  describe 'callbacks' do
    describe 'before_save :set_unit_price_from_service' do
      it 'sets unit_price from service when service changes' do
        service = create(:service, base_price: 199.99)
        srs = create(:service_record_service, service: service)
        expect(srs.unit_price).to eq(service.base_price)
      end
    end
  end

  describe 'methods' do
    let(:srs) { build(:service_record_service, quantity: 2, unit_price: 75.0) }

    describe '#total_price' do
      it 'returns quantity * unit_price' do
        expect(srs.total_price).to eq(150.0)
      end
    end

    describe '#formatted_total_price' do
      it 'returns a formatted currency string' do
        expect(srs.formatted_total_price).to be_a(String)
        expect(srs.formatted_total_price).to include('$')
      end
    end

    describe '#formatted_unit_price' do
      it 'returns a formatted currency string' do
        expect(srs.formatted_unit_price).to be_a(String)
        expect(srs.formatted_unit_price).to include('$')
      end
    end
  end

  describe 'factory' do
    it 'has a valid default factory' do
      expect(build(:service_record_service)).to be_valid
    end
  end
end
