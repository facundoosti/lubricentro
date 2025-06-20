# == Schema Information
#
# Table name: service_records
#
#  id                :integer          not null, primary key
#  service_date      :date
#  total_amount      :decimal(, )
#  notes             :text
#  mileage           :integer
#  next_service_date :date
#  customer_id       :integer          not null
#  vehicle_id        :integer          not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_service_records_on_customer_id  (customer_id)
#  index_service_records_on_vehicle_id   (vehicle_id)
#

require 'rails_helper'

RSpec.describe ServiceRecord, type: :model do
  describe 'associations' do
    it { should belong_to(:customer) }
    it { should belong_to(:vehicle) }
  end

  describe 'validations' do
    it { should validate_presence_of(:service_date) }
    it { should validate_presence_of(:total_amount) }
    it { should validate_presence_of(:mileage) }
    it { should validate_presence_of(:customer_id) }
    it { should validate_presence_of(:vehicle_id) }

    it { should validate_numericality_of(:total_amount).is_greater_than_or_equal_to(0) }
    it { should validate_numericality_of(:mileage).is_greater_than(0) }
  end

  describe 'custom validations' do
    let(:customer) { create(:customer) }
    let(:vehicle) { create(:vehicle) }
    let(:service_record) { build(:service_record, customer: customer, vehicle: vehicle) }

    describe 'service_date_cannot_be_in_future' do
      it 'is valid when service_date is today' do
        service_record.service_date = Date.current
        expect(service_record).to be_valid
      end

      it 'is valid when service_date is in the past' do
        service_record.service_date = Date.current - 1.day
        expect(service_record).to be_valid
      end

      it 'is invalid when service_date is in the future' do
        service_record.service_date = Date.current + 1.day
        expect(service_record).not_to be_valid
        expect(service_record.errors[:service_date]).to include('no puede ser en el futuro')
      end
    end

    describe 'next_service_date_after_service_date' do
      it 'is valid when next_service_date is after service_date' do
        service_record.service_date = Date.current
        service_record.next_service_date = Date.current + 6.months
        expect(service_record).to be_valid
      end

      it 'is invalid when next_service_date is before service_date' do
        service_record.service_date = Date.current
        service_record.next_service_date = Date.current - 1.day
        expect(service_record).not_to be_valid
        expect(service_record.errors[:next_service_date]).to include('debe ser posterior a la fecha de servicio')
      end

      it 'is invalid when next_service_date equals service_date' do
        service_record.service_date = Date.current
        service_record.next_service_date = Date.current
        expect(service_record).not_to be_valid
        expect(service_record.errors[:next_service_date]).to include('debe ser posterior a la fecha de servicio')
      end
    end
  end

  describe 'scopes' do
    let!(:recent_record) { create(:service_record, service_date: Date.current) }
    let!(:old_record) { create(:service_record, service_date: Date.current - 1.month) }
    let!(:customer_record) { create(:service_record) }
    let!(:vehicle_record) { create(:service_record) }
    let!(:high_mileage_record) { create(:service_record, :with_high_mileage) }

    describe '.recent' do
      it 'returns records ordered by service_date desc' do
        expect(ServiceRecord.recent.first).to eq(recent_record)
      end
    end

    describe '.by_customer' do
      it 'returns records for specific customer' do
        expect(ServiceRecord.by_customer(customer_record.customer_id)).to include(customer_record)
      end
    end

    describe '.by_vehicle' do
      it 'returns records for specific vehicle' do
        expect(ServiceRecord.by_vehicle(vehicle_record.vehicle_id)).to include(vehicle_record)
      end
    end

    describe '.by_date_range' do
      it 'returns records within date range' do
        start_date = Date.current - 1.month
        end_date = Date.current
        expect(ServiceRecord.by_date_range(start_date, end_date)).to include(recent_record, old_record)
      end
    end

    describe '.with_high_mileage' do
      it 'returns records with mileage above threshold' do
        expect(ServiceRecord.with_high_mileage).to include(high_mileage_record)
      end

      it 'uses custom threshold' do
        custom_record = create(:service_record, mileage: 250_000)
        expect(ServiceRecord.with_high_mileage(200_000)).to include(custom_record)
      end
    end
  end

  describe 'callbacks' do
    describe 'before_save :calculate_next_service_date' do
      it 'calculates next_service_date when mileage changes' do
        service_record = create(:service_record, service_date: Date.current)
        original_next_date = service_record.next_service_date

        service_record.mileage = 50000
        service_record.save

        expect(service_record.next_service_date).to eq(service_record.service_date + 6.months)
      end

      it 'does not calculate next_service_date when mileage does not change' do
        service_record = create(:service_record, service_date: Date.current)
        original_next_date = service_record.next_service_date

        service_record.notes = "Updated notes"
        service_record.save

        expect(service_record.next_service_date).to eq(original_next_date)
      end
    end
  end

  describe 'helper methods' do
    let(:service_record) { create(:service_record, total_amount: 150.50, service_date: Date.new(2024, 1, 15)) }

    describe '#formatted_total_amount' do
      it 'returns formatted currency' do
        expect(service_record.formatted_total_amount).to eq('$150,50')
      end
    end

    describe '#formatted_service_date' do
      it 'returns formatted date' do
        expect(service_record.formatted_service_date).to eq('15/01/2024')
      end
    end

    describe '#formatted_next_service_date' do
      it 'returns formatted next service date' do
        service_record.next_service_date = Date.new(2024, 7, 15)
        expect(service_record.formatted_next_service_date).to eq('15/07/2024')
      end

      it 'returns nil when next_service_date is nil' do
        service_record.next_service_date = nil
        expect(service_record.formatted_next_service_date).to be_nil
      end
    end

    describe '#is_overdue?' do
      it 'returns true when next_service_date is in the past' do
        service_record.next_service_date = Date.current - 1.day
        expect(service_record.is_overdue?).to be true
      end

      it 'returns false when next_service_date is in the future' do
        service_record.next_service_date = Date.current + 1.day
        expect(service_record.is_overdue?).to be false
      end

      it 'returns false when next_service_date is nil' do
        service_record.next_service_date = nil
        expect(service_record.is_overdue?).to be false
      end
    end

    describe '#days_until_next_service' do
      it 'returns positive days when next_service_date is in the future' do
        service_record.next_service_date = Date.current + 5.days
        expect(service_record.days_until_next_service).to eq(5)
      end

      it 'returns negative days when next_service_date is in the past' do
        service_record.next_service_date = Date.current - 3.days
        expect(service_record.days_until_next_service).to eq(-3)
      end

      it 'returns nil when next_service_date is nil' do
        service_record.next_service_date = nil
        expect(service_record.days_until_next_service).to be_nil
      end
    end
  end

  describe 'factory traits' do
    describe ':with_high_mileage' do
      it 'creates a service record with high mileage' do
        service_record = create(:service_record, :with_high_mileage)
        expect(service_record.mileage).to be > 150000
      end
    end

    describe ':overdue' do
      it 'creates an overdue service record' do
        service_record = create(:service_record, :overdue, service_date: Date.current - 1.year, next_service_date: Date.current - 1.day)
        expect(service_record.is_overdue?).to be true
      end
    end

    describe ':upcoming' do
      it 'creates an upcoming service record' do
        service_record = create(:service_record, :upcoming, service_date: Date.current - 1.month, next_service_date: Date.current + 1.month)
        expect(service_record.days_until_next_service).to be > 0
      end
    end

    describe ':expensive' do
      it 'creates an expensive service record' do
        service_record = create(:service_record, :expensive)
        expect(service_record.total_amount).to be > 500
        expect(service_record.notes).to include('Reparación mayor')
      end
    end

    describe ':basic_service' do
      it 'creates a basic service record' do
        service_record = create(:service_record, :basic_service)
        expect(service_record.total_amount).to be < 100
        expect(service_record.notes).to include('Cambio de aceite básico')
      end
    end
  end
end
