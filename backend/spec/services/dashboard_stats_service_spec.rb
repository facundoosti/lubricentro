require 'rails_helper'

RSpec.describe DashboardStatsService do
  include ActiveSupport::Testing::TimeHelpers

  describe '.calculate_main_metrics' do
    it 'calculates correct customer and vehicle count and growth' do
      travel_to 1.month.ago do
        3.times { create(:customer) }
        2.times { create(:vehicle, customer: Customer.last) }
      end
      travel_to Date.current do
        5.times { create(:customer) }
        3.times { create(:vehicle, customer: Customer.last) }
      end
      metrics = described_class.calculate_main_metrics
      expect(metrics[:customers]).to eq(8)
      expect(metrics[:vehicles]).to eq(5)
      expect(metrics[:customers_change]).to be_within(0.1).of(66.7)
      expect(metrics[:vehicles_change]).to be_within(0.1).of(50.0)
    end
  end

  describe '.calculate_goals' do
    it 'calculates customer goals correctly' do
      travel_to Date.current.beginning_of_month do
        3.times { create(:customer) }
      end
      goals = described_class.calculate_goals
      expect(goals[:customers_current]).to eq(3)
    end
  end

  describe '.generate_alerts' do
    context 'when there are overdue services' do
      it 'includes overdue services alert' do
        customer = create(:customer)
        vehicle = create(:vehicle, customer: customer)

        service_record = create(:service_record, customer: customer, vehicle: vehicle)
        service_record.update_columns(
          service_date: 2.months.ago.to_date,
          next_service_date: 1.week.ago.to_date,
          created_at: 2.months.ago
        )

        alerts = DashboardStatsService.generate_alerts
        overdue_alert = alerts.find { |alert| alert[:type] == 'error' && alert[:message].include?('servicios vencidos') }

        expect(overdue_alert).to be_present
        expect(overdue_alert[:count]).to eq(1)
      end
    end

    context 'when there are upcoming services' do
      it 'includes upcoming services alert' do
        customer = create(:customer)
        vehicle = create(:vehicle, customer: customer)

        service_record = create(:service_record, customer: customer, vehicle: vehicle)
        service_record.update_columns(
          service_date: 1.month.ago.to_date,
          next_service_date: 3.days.from_now.to_date,
          created_at: 1.month.ago
        )

        alerts = DashboardStatsService.generate_alerts
        upcoming_alert = alerts.find { |alert| alert[:type] == 'info' && alert[:message].include?('servicios próximos') }

        expect(upcoming_alert).to be_present
        expect(upcoming_alert[:count]).to eq(1)
      end
    end
  end

  describe 'private methods' do
    describe '.calculate_customer_growth' do
      it 'calculates growth correctly' do
        previous_month = Date.current.beginning_of_month - 1.month
        2.times do
          customer = build(:customer)
          customer.save!(validate: false)
          customer.update_columns(created_at: previous_month + rand(1..28).days)
        end

        current_month = Date.current.beginning_of_month
        4.times do
          customer = build(:customer)
          customer.save!(validate: false)
          customer.update_columns(created_at: current_month + rand(1..Date.current.day).days)
        end

        growth = DashboardStatsService.send(:calculate_customer_growth)
        expect(growth).to eq(100.0)
      end
    end

    describe '.calculate_retention_rate' do
      it 'calculates retention rate correctly' do
        # Limpiar completamente TODA la base de datos
        ServiceRecordProduct.delete_all
        ServiceRecordService.delete_all
        ServiceRecord.delete_all
        Appointment.delete_all
        Vehicle.delete_all
        Customer.delete_all
        Product.delete_all
        Service.delete_all

        # Crear solo 2 clientes y sus vehículos
        c1 = create(:customer)
        c2 = create(:customer)
        v1 = create(:vehicle, customer: c1)
        v2 = create(:vehicle, customer: c2)

        # Cliente 1 tiene 3 service records (cliente recurrente)
        3.times { create(:service_record, customer: c1, vehicle: v1) }

        # Cliente 2 tiene 1 service record (cliente único)
        create(:service_record, customer: c2, vehicle: v2)

        rate = DashboardStatsService.send(:calculate_retention_rate)
        expect(rate).to eq(50.0) # 1 de 2 clientes tiene múltiples servicios
      end
    end
  end
end
