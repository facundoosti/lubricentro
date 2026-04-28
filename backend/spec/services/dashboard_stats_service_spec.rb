require 'rails_helper'

RSpec.describe DashboardStatsService do
  include ActiveSupport::Testing::TimeHelpers

  describe '.calculate_main_metrics' do
    it 'calculates correct customer and vehicle count and growth' do
      travel_to 1.month.ago do
        2.times { create(:customer) }
        prev_customer = create(:customer)
        2.times { create(:vehicle, customer: prev_customer) }
      end
      travel_to Date.current do
        4.times { create(:customer) }
        curr_customer = create(:customer)
        3.times { create(:vehicle, customer: curr_customer) }
      end

      metrics = described_class.calculate_main_metrics
      expect(metrics[:customers]).to eq(8)
      expect(metrics[:vehicles]).to eq(5)
      expect(metrics[:customers_change]).to be_within(0.1).of(66.7)
      expect(metrics[:vehicles_change]).to be_within(0.1).of(50.0)
    end

    it 'returns all expected keys' do
      metrics = described_class.calculate_main_metrics
      expect(metrics).to include(
        :customers, :customers_change, :vehicles, :vehicles_change,
        :appointments_today, :appointments_change,
        :monthly_revenue, :weekly_revenue, :revenue_change,
        :monthly_customers_served, :weekly_customers_served,
        :services_completed_today, :productivity_average, :retention_rate,
        :average_ticket, :total_services_performed, :total_products_used,
        :top_service, :top_product
      )
    end

    it 'counts appointments_today correctly' do
      customer    = create(:customer)
      vehicle     = create(:vehicle, customer: customer)
      appointment = create(:appointment, customer: customer, vehicle: vehicle, scheduled_at: 1.day.from_now)
      appointment.update_columns(scheduled_at: Time.current.noon)

      expect(described_class.calculate_main_metrics[:appointments_today]).to eq(1)
    end

    it 'calculates monthly_revenue from service records this month' do
      customer = create(:customer)
      vehicle  = create(:vehicle, customer: customer)
      sr       = create(:service_record, customer: customer, vehicle: vehicle)
      sr.update_columns(total_amount: 1500, created_at: Date.current.beginning_of_month + 1.day)

      expect(described_class.calculate_main_metrics[:monthly_revenue]).to eq(1500)
    end

    it 'returns top_service with name and count' do
      customer = create(:customer)
      vehicle  = create(:vehicle, customer: customer)
      service  = create(:service)
      sr       = create(:service_record, customer: customer, vehicle: vehicle)
      create(:service_record_service, service_record: sr, service: service, quantity: 3)

      top = described_class.calculate_main_metrics[:top_service]
      expect(top).to include(:name, :count)
      expect(top[:name]).to eq(service.name)
      expect(top[:count]).to eq(3)
    end

    it 'returns top_service as N/A when no services exist' do
      ServiceRecordService.delete_all
      expect(described_class.calculate_main_metrics[:top_service]).to eq(name: 'N/A', count: 0)
    end
  end

  describe '.calculate_goals' do
    it 'returns all expected keys' do
      goals = described_class.calculate_goals
      expect(goals).to include(
        :revenue_target, :revenue_current, :revenue_percentage,
        :services_target, :services_current, :services_percentage,
        :customers_target, :customers_current,
        :satisfaction_target, :satisfaction_current,
        :services_performed_target, :services_performed_current,
        :products_used_target, :products_used_current
      )
    end

    it 'calculates customers_current for the month' do
      travel_to Date.current.beginning_of_month do
        3.times { create(:customer) }
      end
      expect(described_class.calculate_goals[:customers_current]).to eq(3)
    end

    it 'calculates services_current for the month' do
      customer = create(:customer)
      vehicle  = create(:vehicle, customer: customer)
      2.times { create(:service_record, customer: customer, vehicle: vehicle) }

      expect(described_class.calculate_goals[:services_current]).to eq(2)
    end

    it 'returns revenue_percentage as 0.0 when no revenue' do
      ServiceRecord.delete_all
      expect(described_class.calculate_goals[:revenue_percentage]).to eq(0.0)
    end
  end

  describe '.generate_alerts' do
    context 'when there are overdue services' do
      it 'includes overdue services alert' do
        customer       = create(:customer)
        vehicle        = create(:vehicle, customer: customer)
        service_record = create(:service_record, customer: customer, vehicle: vehicle)
        service_record.update_columns(
          service_date:      2.months.ago.to_date,
          next_service_date: 1.week.ago.to_date,
          created_at:        2.months.ago
        )

        alerts        = described_class.generate_alerts
        overdue_alert = alerts.find { |a| a[:type] == 'error' && a[:message].include?('servicios vencidos') }

        expect(overdue_alert).to be_present
        expect(overdue_alert[:count]).to eq(1)
      end
    end

    context 'when there are upcoming services' do
      it 'includes upcoming services alert' do
        customer       = create(:customer)
        vehicle        = create(:vehicle, customer: customer)
        service_record = create(:service_record, customer: customer, vehicle: vehicle)
        service_record.update_columns(
          service_date:      1.month.ago.to_date,
          next_service_date: 3.days.from_now.to_date,
          created_at:        1.month.ago
        )

        alerts         = described_class.generate_alerts
        upcoming_alert = alerts.find { |a| a[:type] == 'info' && a[:message].include?('servicios próximos') }

        expect(upcoming_alert).to be_present
        expect(upcoming_alert[:count]).to eq(1)
      end
    end

    context 'when there are pending appointments today' do
      it 'includes pending appointments warning' do
        customer = create(:customer)
        vehicle  = create(:vehicle, customer: customer)
        appointment = create(:appointment, customer: customer, vehicle: vehicle,
                             scheduled_at: 1.day.from_now, status: "scheduled")
        appointment.update_columns(scheduled_at: Time.current.noon)

        warning = described_class.generate_alerts.find { |a| a[:type] == 'warning' }
        expect(warning).to be_present
      end
    end

    context 'when there is no relevant data' do
      it 'returns an empty array' do
        ServiceRecord.delete_all
        Appointment.delete_all
        expect(described_class.generate_alerts).to eq([])
      end
    end
  end

  describe '.calculate_trends' do
    it 'returns trends with expected keys' do
      trends = described_class.calculate_trends
      expect(trends).to include(
        :monthly_services, :services_by_type, :customer_flow,
        :revenue_by_service_type, :revenue_by_product_type, :service_product_ratio
      )
    end

    it 'returns monthly_services for last 6 months with all keys' do
      trends = described_class.calculate_trends
      expect(trends[:monthly_services].length).to eq(6)
      expect(trends[:monthly_services].first).to include(
        :month, :services, :revenue, :services_performed, :products_used
      )
    end

    it 'returns service_product_ratio with zero values when no data' do
      ServiceRecordProduct.delete_all
      ServiceRecordService.delete_all
      trends = described_class.calculate_trends
      expect(trends[:service_product_ratio]).to include(services: 0, products: 0, ratio: 0)
    end

    it 'calculates service_product_ratio correctly when data exists' do
      customer = create(:customer)
      vehicle  = create(:vehicle, customer: customer)
      service  = create(:service)
      product  = create(:product)
      sr       = create(:service_record, customer: customer, vehicle: vehicle)
      create(:service_record_service, service_record: sr, service: service, quantity: 4)
      create(:service_record_product, service_record: sr, product: product, quantity: 2)

      ratio = described_class.calculate_trends[:service_product_ratio]
      expect(ratio[:services]).to eq(4)
      expect(ratio[:products]).to eq(2)
      expect(ratio[:ratio]).to eq(2.0)
    end
  end

  describe '.get_recent_activity' do
    it 'returns today_appointments and recent_services keys' do
      activity = described_class.get_recent_activity
      expect(activity).to include(:today_appointments, :recent_services)
    end

    it 'returns recent_services with expected shape' do
      customer = create(:customer)
      vehicle  = create(:vehicle, customer: customer)
      create(:service_record, customer: customer, vehicle: vehicle)

      activity = described_class.get_recent_activity
      expect(activity[:recent_services]).to be_present
      expect(activity[:recent_services].first).to include(:id, :customer, :vehicle, :total, :date)
    end

    it 'returns today_appointments with expected shape' do
      customer = create(:customer)
      vehicle  = create(:vehicle, customer: customer)
      appointment = create(:appointment, customer: customer, vehicle: vehicle, scheduled_at: 1.day.from_now)
      appointment.update_columns(scheduled_at: Time.current.noon)

      activity = described_class.get_recent_activity
      expect(activity[:today_appointments]).to be_present
      expect(activity[:today_appointments].first).to include(:id, :customer, :vehicle, :time, :status)
    end
  end

  describe 'private methods' do
    describe '.calculate_customer_growth' do
      it 'calculates growth correctly' do
        previous_month = Date.current.beginning_of_month - 1.month
        2.times do
          customer = build(:customer)
          customer.save!(validate: false)
          customer.update_columns(created_at: previous_month + 5.days)
        end

        current_month = Date.current.beginning_of_month
        4.times do
          customer = build(:customer)
          customer.save!(validate: false)
          customer.update_columns(created_at: current_month + 5.days)
        end

        expect(described_class.send(:calculate_customer_growth)).to eq(100.0)
      end

      it 'returns 0 when there are no previous month customers' do
        Customer.delete_all
        expect(described_class.send(:calculate_customer_growth)).to eq(0)
      end
    end

    describe '.calculate_retention_rate' do
      before do
        ServiceRecordProduct.delete_all
        ServiceRecordService.delete_all
        ServiceRecord.delete_all
        Appointment.delete_all
        Vehicle.delete_all
        Customer.delete_all
        Product.delete_all
        Service.delete_all
      end

      it 'calculates retention rate correctly' do
        c1 = create(:customer)
        c2 = create(:customer)
        v1 = create(:vehicle, customer: c1)
        v2 = create(:vehicle, customer: c2)

        3.times { create(:service_record, customer: c1, vehicle: v1) }
        create(:service_record, customer: c2, vehicle: v2)

        expect(described_class.send(:calculate_retention_rate)).to eq(50.0)
      end

      it 'returns 0 when there are no customers' do
        expect(described_class.send(:calculate_retention_rate)).to eq(0)
      end
    end
  end
end
