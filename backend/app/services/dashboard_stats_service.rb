class DashboardStatsService
  def self.calculate_main_metrics
    current_month = Date.current.beginning_of_month
    previous_month = current_month - 1.month

    {
      customers: Customer.count,
      customers_change: calculate_customer_growth,
      vehicles: Vehicle.count,
      vehicles_change: calculate_vehicle_growth,
      appointments_today: Appointment.where(scheduled_at: Date.current.all_day).count,
      appointments_change: calculate_appointment_change,
      monthly_revenue: calculate_monthly_revenue,
      revenue_change: calculate_revenue_growth,
      services_completed_today: ServiceRecord.where(created_at: Date.current.all_day).count,
      productivity_average: calculate_productivity_average,
      retention_rate: calculate_retention_rate,
      average_ticket: calculate_average_ticket,
      # Nuevas métricas basadas en las asociaciones
      total_services_performed: ServiceRecordService.sum(:quantity),
      total_products_used: ServiceRecordProduct.sum(:quantity),
      top_service: get_top_service,
      top_product: get_top_product
    }
  end

  def self.calculate_trends
    {
      monthly_services: calculate_monthly_services_data,
      services_by_type: calculate_services_by_type,
      customer_flow: calculate_customer_flow,
      # Nuevas tendencias
      revenue_by_service_type: calculate_revenue_by_service_type,
      revenue_by_product_type: calculate_revenue_by_product_type,
      service_product_ratio: calculate_service_product_ratio
    }
  end

  def self.calculate_goals
    current_month = Date.current.beginning_of_month
    current_revenue = calculate_monthly_revenue
    target_revenue = 50000 # Meta mensual de ingresos
    current_services = ServiceRecord.where(created_at: current_month.all_month).count
    target_services = 80 # Meta mensual de servicios

    {
      revenue_target: target_revenue,
      revenue_current: current_revenue,
      revenue_percentage: ((current_revenue.to_f / target_revenue) * 100).round(1),
      services_target: target_services,
      services_current: current_services,
      services_percentage: ((current_services.to_f / target_services) * 100).round(1),
      customers_target: 200, # Meta mensual de clientes nuevos
      customers_current: Customer.where(created_at: current_month.all_month).count,
      satisfaction_target: 4.5, # Meta de satisfacción
      satisfaction_current: 4.2, # Rating promedio (mock por ahora)
      # Nuevos objetivos
      services_performed_target: 120, # Meta de servicios realizados
      services_performed_current: ServiceRecordService.where(created_at: current_month.all_month).sum(:quantity),
      products_used_target: 200, # Meta de productos utilizados
      products_used_current: ServiceRecordProduct.where(created_at: current_month.all_month).sum(:quantity)
    }
  end

  def self.generate_alerts
    alerts = []

    # Productos más utilizados (para identificar stock necesario)
    top_products = ServiceRecordProduct.joins(:product)
                                      .group("products.name")
                                      .sum(:quantity)
                                      .sort_by { |_, quantity| -quantity }
                                      .first(3)

    # Servicios vencidos reales
    overdue_services = ServiceRecord.where("next_service_date < ?", Date.current).count
    if overdue_services > 0
      alerts << { type: "error", message: "#{overdue_services} servicios vencidos", count: overdue_services }
    end

    # Turnos sin confirmar
    pending_appointments = Appointment.where(status: "scheduled", scheduled_at: Date.current.all_day).count
    if pending_appointments > 0
      alerts << { type: "warning", message: "#{pending_appointments} turnos sin confirmar", count: pending_appointments }
    end

    # Servicios próximos a vencer
    upcoming_services = ServiceRecord.where("next_service_date BETWEEN ? AND ?",
                                           Date.current,
                                           Date.current + 1.week).count
    if upcoming_services > 0
      alerts << { type: "info", message: "#{upcoming_services} servicios próximos a vencer", count: upcoming_services }
    end

    # Objetivos en riesgo
    goals = calculate_goals
    if goals[:revenue_percentage] < 70
      alerts << { type: "error", message: "Objetivo de ingresos en riesgo", percentage: goals[:revenue_percentage] }
    end

    alerts
  end

  def self.get_recent_activity
    {
      today_appointments: Appointment.where(scheduled_at: Date.current.all_day)
                                   .includes(:customer, :vehicle)
                                   .order(:scheduled_at)
                                   .limit(5)
                                   .map do |appointment|
        {
          id: appointment.id,
          customer: appointment.customer.name,
          vehicle: "#{appointment.vehicle.brand} #{appointment.vehicle.model} - #{appointment.vehicle.license_plate}",
          service: appointment.notes || "Servicio general",
          time: appointment.scheduled_at.strftime("%H:%M"),
          status: appointment.status
        }
      end,
      recent_services: ServiceRecord.includes(:customer, :vehicle, :service_record_services, :service_record_products)
                                  .order(created_at: :desc)
                                  .limit(5)
                                  .map do |service|
        {
          id: service.id,
          customer: service.customer.name,
          vehicle: "#{service.vehicle.brand} #{service.vehicle.model}",
          services: service.service_record_services.sum(:quantity),
          products: service.service_record_products.sum(:quantity),
          total: service.total_amount,
          date: service.created_at.strftime("%d/%m/%Y"),
          service_types: service.service_record_services.includes(:service).map { |srs| srs.service.name }.join(", "),
          product_types: service.service_record_products.includes(:product).map { |srp| srp.product.name }.join(", ")
        }
      end
    }
  end

  private

  def self.calculate_customer_growth
    current_month = Date.current.beginning_of_month
    previous_month = current_month - 1.month

    current_count = Customer.where(created_at: current_month.all_month).count
    previous_count = Customer.where(created_at: previous_month.all_month).count

    return 0 if previous_count == 0
    ((current_count - previous_count).to_f / previous_count * 100).round(1)
  end

  def self.calculate_vehicle_growth
    current_month = Date.current.beginning_of_month
    previous_month = current_month - 1.month

    current_count = Vehicle.where(created_at: current_month.all_month).count
    previous_count = Vehicle.where(created_at: previous_month.all_month).count

    return 0 if previous_count == 0
    ((current_count - previous_count).to_f / previous_count * 100).round(1)
  end

  def self.calculate_appointment_change
    today = Appointment.where(scheduled_at: Date.current.all_day).count
    yesterday = Appointment.where(scheduled_at: Date.yesterday.all_day).count

    return 0 if yesterday == 0
    ((today - yesterday).to_f / yesterday * 100).round(1)
  end

  def self.calculate_monthly_revenue
    ServiceRecord.where(created_at: Date.current.beginning_of_month.all_month).sum(:total_amount)
  end

  def self.calculate_revenue_growth
    current_month = Date.current.beginning_of_month
    previous_month = current_month - 1.month

    current_revenue = ServiceRecord.where(created_at: current_month.all_month).sum(:total_amount)
    previous_revenue = ServiceRecord.where(created_at: previous_month.all_month).sum(:total_amount)

    return 0 if previous_revenue == 0
    ((current_revenue - previous_revenue).to_f / previous_revenue * 100).round(1)
  end

  def self.calculate_productivity_average
    # Servicios por hora en el día actual
    today_services = ServiceRecord.where(created_at: Date.current.all_day).count
    # Asumiendo 8 horas de trabajo
    (today_services.to_f / 8).round(1)
  end

  def self.calculate_retention_rate
    # Porcentaje de clientes que han vuelto más de una vez
    total_customers = Customer.count
    return 0 if total_customers == 0

    repeat_customers = Customer.joins(:service_records)
                              .group("customers.id")
                              .having("COUNT(service_records.id) > 1")
                              .count.keys.count

    (repeat_customers.to_f / total_customers * 100).round(1)
  end

  def self.calculate_average_ticket
    total_revenue = ServiceRecord.sum(:total_amount)
    total_services = ServiceRecord.count

    return 0 if total_services == 0
    (total_revenue.to_f / total_services).round(0)
  end

  def self.calculate_monthly_services_data
    # Últimos 6 meses
    (0..5).map do |i|
      month = Date.current - i.months
      services_count = ServiceRecord.where(created_at: month.all_month).count
      revenue = ServiceRecord.where(created_at: month.all_month).sum(:total_amount)
      services_performed = ServiceRecordService.joins(:service_record)
                                              .where(service_records: { created_at: month.all_month })
                                              .sum(:quantity)
      products_used = ServiceRecordProduct.joins(:service_record)
                                         .where(service_records: { created_at: month.all_month })
                                         .sum(:quantity)

      {
        month: month.strftime("%b"),
        services: services_count,
        revenue: revenue,
        services_performed: services_performed,
        products_used: products_used
      }
    end.reverse
  end

  def self.calculate_services_by_type
    ServiceRecordService.joins(:service)
                        .group("services.name")
                        .sum(:quantity)
                        .map { |name, count| { name: name, count: count } }
                        .sort_by { |service| -service[:count] }
                        .first(10)
  end

  def self.calculate_revenue_by_service_type
    ServiceRecordService.joins(:service)
                        .group("services.name")
                        .sum("service_record_services.quantity * service_record_services.unit_price")
                        .map { |name, revenue| { name: name, revenue: revenue } }
                        .sort_by { |service| -service[:revenue] }
                        .first(10)
  end

  def self.calculate_revenue_by_product_type
    ServiceRecordProduct.joins(:product)
                        .group("products.name")
                        .sum("service_record_products.quantity * service_record_products.unit_price")
                        .map { |name, revenue| { name: name, revenue: revenue } }
                        .sort_by { |product| -product[:revenue] }
                        .first(10)
  end

  def self.calculate_service_product_ratio
    total_services = ServiceRecordService.sum(:quantity)
    total_products = ServiceRecordProduct.sum(:quantity)

    return { services: 0, products: 0, ratio: 0 } if total_products == 0

    {
      services: total_services,
      products: total_products,
      ratio: (total_services.to_f / total_products).round(2)
    }
  end

  def self.get_top_service
    top_service = ServiceRecordService.joins(:service)
                                     .group("services.name")
                                     .sum(:quantity)
                                     .max_by { |_, quantity| quantity }

    return { name: "N/A", count: 0 } unless top_service

    { name: top_service[0], count: top_service[1] }
  end

  def self.get_top_product
    top_product = ServiceRecordProduct.joins(:product)
                                     .group("products.name")
                                     .sum(:quantity)
                                     .max_by { |_, quantity| quantity }

    return { name: "N/A", count: 0 } unless top_product

    { name: top_product[0], count: top_product[1] }
  end

  def self.calculate_customer_flow
    # Últimas 4 semanas
    (0..3).map do |i|
      week_start = Date.current.beginning_of_week - i.weeks
      week_end = week_start.end_of_week

      new_customers = Customer.where(created_at: week_start..week_end).count
      repeat_customers = Customer.joins(:service_records)
                                .where(service_records: { created_at: week_start..week_end })
                                .where.not(id: Customer.where(created_at: week_start..week_end).select(:id))
                                .distinct.count

      {
        week: week_start.strftime("%d/%m"),
        new: new_customers,
        repeat: repeat_customers
      }
    end.reverse
  end
end
