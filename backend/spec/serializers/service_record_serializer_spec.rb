# == Schema Information
#
# Table name: service_records
#
#  id                :bigint           not null, primary key
#  mileage           :integer
#  next_service_date :date
#  notes             :text
#  service_date      :date
#  total_amount      :decimal(, )      default(0.0)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  appointment_id    :bigint
#  budget_id         :bigint
#  customer_id       :bigint           not null
#  vehicle_id        :bigint           not null
#
# Indexes
#
#  index_service_records_on_appointment_id  (appointment_id) UNIQUE
#  index_service_records_on_budget_id       (budget_id)
#  index_service_records_on_customer_id     (customer_id)
#  index_service_records_on_vehicle_id      (vehicle_id)
#
# Foreign Keys
#
#  fk_rails_...  (appointment_id => appointments.id)
#  fk_rails_...  (budget_id => budgets.id) ON DELETE => nullify
#  fk_rails_...  (customer_id => customers.id)
#  fk_rails_...  (vehicle_id => vehicles.id)
#
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

    context 'con ítems' do
      let(:product) { create(:product) }
      let(:service_record) do
        record = build(:service_record, customer: customer, vehicle: vehicle, budget: create(:budget, customer: customer))
        record.items.build(description: 'Aceite', quantity: 2, unit_price: 10_000, iva_rate: 21, product: product, position: 0)
        record.items.build(description: 'Lavado', quantity: 1, unit_price: 5_000, position: 1)
        record.save!
        record.reload
      end

      it 'incluye los ítems con su forma de contrato' do
        expect(serialized[:items].size).to eq(2)
        expect(serialized[:items].first.keys).to contain_exactly(
          :id, :position, :description, :quantity, :unit_price, :iva_rate, :margin_percentage, :total, :product_id,
          :service_id
        )
        expect(serialized[:items].map { |i| i[:description] }).to eq(%w[Aceite Lavado])
        expect(serialized[:items].first[:product_id]).to eq(product.id)
      end

      it 'incluye el presupuesto de origen y el desglose de IVA' do
        expect(serialized).to include(
          budget_id: service_record.budget_id,
          subtotal_net: '20000.0',
          total_iva: '4200.0',
          exempt_total: '5000.0',
          margin_total: '0.0',
          iva_breakdown: [ { rate: '21.0', base: '20000.0', amount: '4200.0' } ]
        )
      end

      it 'ya no incluye las listas viejas de servicios y productos' do
        expect(serialized).not_to include(:service_record_services, :service_record_products)
      end
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
