require 'rails_helper'

RSpec.describe ServiceRecordSerializer do
  let(:customer) { create(:customer) }
  let(:vehicle) { create(:vehicle, customer: customer) }
  let(:service_record) { create(:service_record, customer: customer, vehicle: vehicle) }

  describe 'default view' do
    let(:serialized) { described_class.render_as_hash(service_record, view: :default) }

    it 'includes basic service record fields' do
      expect(serialized).to include(
        :id,
        :service_date,
        :total_amount,
        :notes,
        :mileage,
        :next_service_date,
        :customer_id,
        :vehicle_id,
        :created_at,
        :updated_at
      )
    end

    it 'serializes service_date as ISO string' do
      expect(serialized[:service_date]).to eq(service_record.service_date.iso8601)
    end

    it 'serializes next_service_date as ISO string when present' do
      expect(serialized[:next_service_date]).to eq(service_record.next_service_date.iso8601)
    end

    it 'serializes next_service_date as nil when not present' do
      service_record.update!(next_service_date: nil)
      serialized = described_class.render_as_hash(service_record, view: :default)
      expect(serialized[:next_service_date]).to be_nil
    end

    it 'serializes total_amount as decimal' do
      expect(serialized[:total_amount]).to eq(service_record.total_amount.to_f)
    end

    it 'serializes mileage as integer' do
      expect(serialized[:mileage]).to eq(service_record.mileage)
    end
  end

  describe 'summary view' do
    let(:serialized) { described_class.render_as_hash(service_record, view: :summary) }

    it 'includes only essential fields' do
      expect(serialized).to include(
        :id,
        :service_date,
        :total_amount,
        :mileage,
        :next_service_date,
        :customer_id,
        :vehicle_id
      )
    end

    it 'excludes verbose fields' do
      expect(serialized).not_to include(:notes, :created_at, :updated_at)
    end
  end

  describe 'with_details view' do
    let(:serialized) { described_class.render_as_hash(service_record, view: :with_details) }

    it 'includes all fields from default view' do
      expect(serialized).to include(
        :id,
        :service_date,
        :total_amount,
        :notes,
        :mileage,
        :next_service_date,
        :customer_id,
        :vehicle_id,
        :created_at,
        :updated_at
      )
    end

    it 'includes formatted helper fields' do
      expect(serialized).to include(
        :formatted_total_amount,
        :formatted_service_date,
        :formatted_next_service_date,
        :is_overdue,
        :days_until_next_service
      )
    end

    it 'serializes formatted_total_amount correctly' do
      expect(serialized[:formatted_total_amount]).to eq(service_record.formatted_total_amount)
    end

    it 'serializes formatted_service_date correctly' do
      expect(serialized[:formatted_service_date]).to eq(service_record.formatted_service_date)
    end

    it 'serializes formatted_next_service_date correctly when present' do
      expect(serialized[:formatted_next_service_date]).to eq(service_record.formatted_next_service_date)
    end

    it 'serializes formatted_next_service_date as nil when not present' do
      service_record.update!(next_service_date: nil)
      serialized = described_class.render_as_hash(service_record, view: :with_details)
      expect(serialized[:formatted_next_service_date]).to be_nil
    end

    it 'serializes is_overdue correctly' do
      expect(serialized[:is_overdue]).to eq(service_record.is_overdue?)
    end

    it 'serializes days_until_next_service correctly' do
      expect(serialized[:days_until_next_service]).to eq(service_record.days_until_next_service)
    end
  end

  describe 'formatted view' do
    let(:serialized) { described_class.render_as_hash(service_record, view: :formatted) }

    it 'includes formatted fields' do
      expect(serialized).to include(
        :id,
        :service_date,
        :total_amount,
        :notes,
        :mileage,
        :next_service_date,
        :customer_id,
        :vehicle_id,
        :formatted_total_amount,
        :formatted_service_date,
        :formatted_next_service_date
      )
    end

    it 'excludes helper fields that are not formatted' do
      expect(serialized).not_to include(:is_overdue, :days_until_next_service, :created_at, :updated_at)
    end
  end

  describe 'collection serialization' do
    let!(:service_records) { create_list(:service_record, 3, customer: customer, vehicle: vehicle) }

    it 'serializes collection with default view' do
      serialized = described_class.render_as_hash(service_records, view: :default)
      expect(serialized).to be_an(Array)
      expect(serialized.length).to eq(3)
      expect(serialized.first).to include(:id, :service_date, :total_amount)
    end

    it 'serializes collection with summary view' do
      serialized = described_class.render_as_hash(service_records, view: :summary)
      expect(serialized).to be_an(Array)
      expect(serialized.length).to eq(3)
      expect(serialized.first).to include(:id, :service_date, :total_amount)
      expect(serialized.first).not_to include(:notes, :created_at)
    end
  end

  describe 'edge cases' do
    it 'handles service record with nil notes' do
      service_record.update!(notes: nil)
      serialized = described_class.render_as_hash(service_record, view: :default)
      expect(serialized[:notes]).to be_nil
    end

    it 'handles service record with zero total_amount' do
      service_record.update!(total_amount: 0)
      serialized = described_class.render_as_hash(service_record, view: :default)
      expect(serialized[:total_amount]).to eq(0.0)
    end

    it 'handles service record with very high mileage' do
      service_record.update!(mileage: 999_999)
      serialized = described_class.render_as_hash(service_record, view: :default)
      expect(serialized[:mileage]).to eq(999_999)
    end
  end
end
