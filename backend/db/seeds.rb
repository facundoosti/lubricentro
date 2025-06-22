# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Seeds para Sistema Lubricentro - Development Environment
# Ejecutar con: rails db:seed

puts "🌱 Iniciando seeds para Sistema Lubricentro..."

# Limpiar datos existentes (solo en development)
if Rails.env.development?
  puts "🧹 Limpiando datos existentes..."
  ServiceRecord.destroy_all
  Appointment.destroy_all
  Vehicle.destroy_all
  Customer.destroy_all
  Product.destroy_all
  Service.destroy_all
end

# Crear Services
puts "🔧 Creando servicios..."
services = [
  {
    name: "Oil Change",
    description: "Complete oil change with premium oil and filter replacement",
    base_price: 85.00
  },
  {
    name: "Tire Rotation",
    description: "Rotate all four tires to ensure even wear",
    base_price: 35.00
  },
  {
    name: "Brake Service",
    description: "Complete brake inspection and pad replacement",
    base_price: 250.00
  },
  {
    name: "Air Filter Replacement",
    description: "Replace engine air filter for optimal performance",
    base_price: 25.00
  },
  {
    name: "Battery Replacement",
    description: "Install new battery with testing",
    base_price: 120.00
  },
  {
    name: "Wheel Alignment",
    description: "Four-wheel alignment for proper handling",
    base_price: 80.00
  },
  {
    name: "Transmission Service",
    description: "Transmission fluid change and filter replacement",
    base_price: 180.00
  },
  {
    name: "Coolant System Service",
    description: "Coolant flush and system inspection",
    base_price: 95.00
  }
]

services.each do |service_attrs|
  Service.find_or_create_by!(name: service_attrs[:name]) do |service|
    service.description = service_attrs[:description]
    service.base_price = service_attrs[:base_price]
  end
end

# Crear Products
puts "📦 Creando productos..."
products = [
  {
    name: "Motor Oil 10W-40",
    description: "Synthetic blend motor oil for modern engines",
    unit_price: 75.00,
    unit: "L"
  },
  {
    name: "Oil Filter Premium",
    description: "High-quality oil filter for extended protection",
    unit_price: 15.00,
    unit: "unit"
  },
  {
    name: "Air Filter AF-255",
    description: "High performance pleated paper air filter",
    unit_price: 25.00,
    unit: "unit"
  },
  {
    name: "Brake Fluid DOT 4",
    description: "High temperature brake fluid",
    unit_price: 12.00,
    unit: "L"
  },
  {
    name: "Brake Pads Front",
    description: "Premium brake pads for front wheels",
    unit_price: 45.00,
    unit: "kit"
  },
  {
    name: "Transmission Fluid ATF",
    description: "Automatic transmission fluid",
    unit_price: 18.00,
    unit: "L"
  },
  {
    name: "Coolant Antifreeze",
    description: "Long-life coolant for all vehicles",
    unit_price: 22.00,
    unit: "L"
  },
  {
    name: "Battery 12V 60Ah",
    description: "High-performance car battery",
    unit_price: 95.00,
    unit: "unit"
  }
]

products.each do |product_attrs|
  Product.find_or_create_by!(name: product_attrs[:name]) do |product|
    product.description = product_attrs[:description]
    product.unit_price = product_attrs[:unit_price]
    product.unit = product_attrs[:unit]
  end
end

# Crear Customers con Vehicles
puts "👥 Creando clientes y vehículos..."

customers_data = [
  {
    name: "Juan Pérez",
    phone: "11-1234-5678",
    email: "juan.perez@email.com",
    address: "Av. Corrientes 1234, CABA",
    vehicles: [
      { brand: "Toyota", model: "Corolla", license_plate: "ABC123", year: "2020" },
      { brand: "Honda", model: "Civic", license_plate: "XYZ789", year: "2018" }
    ]
  },
  {
    name: "María González",
    phone: "11-9876-5432",
    email: "maria.gonzalez@email.com",
    address: "Belgrano 567, CABA",
    vehicles: [
      { brand: "Ford", model: "Focus", license_plate: "DEF456", year: "2021" }
    ]
  },
  {
    name: "Carlos Rodríguez",
    phone: "11-5555-1111",
    email: "carlos.rodriguez@email.com",
    address: "Palermo 890, CABA",
    vehicles: [
      { brand: "Chevrolet", model: "Cruze", license_plate: "GHI789", year: "2019" },
      { brand: "Nissan", model: "Sentra", license_plate: "JKL012", year: "2022" }
    ]
  },
  {
    name: "Ana Martínez",
    phone: "11-2222-3333",
    email: "ana.martinez@email.com",
    address: "Recoleta 345, CABA",
    vehicles: [
      { brand: "Volkswagen", model: "Golf", license_plate: "MNO345", year: "2020" }
    ]
  },
  {
    name: "Roberto Silva",
    phone: "11-7777-8888",
    email: "roberto.silva@email.com",
    address: "San Telmo 678, CABA",
    vehicles: [
      { brand: "Peugeot", model: "208", license_plate: "PQR678", year: "2021" },
      { brand: "Renault", model: "Clio", license_plate: "STU901", year: "2019" }
    ]
  }
]

customers_data.each do |customer_data|
  customer = Customer.create!(
    name: customer_data[:name],
    phone: customer_data[:phone],
    email: customer_data[:email],
    address: customer_data[:address]
  )

  customer_data[:vehicles].each do |vehicle_data|
    Vehicle.create!(
      brand: vehicle_data[:brand],
      model: vehicle_data[:model],
      license_plate: vehicle_data[:license_plate],
      year: vehicle_data[:year],
      customer: customer
    )
  end
end

# Crear Appointments
puts "📅 Creando turnos..."

customers = Customer.all
vehicles = Vehicle.all

# Turnos pasados (completados) - usar save! para evitar validación de fecha futura
5.times do |i|
  customer = customers.sample
  vehicle = customer.vehicles.sample

  appointment = Appointment.new(
    scheduled_at: i.days.ago,
    status: "completed",
    notes: Faker::Lorem.sentence(word_count: 8, supplemental: false, random_words_to_add: 4),
    customer: customer,
    vehicle: vehicle
  )
  appointment.save!(validate: false) # Evitar validación de fecha futura para turnos completados
end

# Turnos futuros (agendados)
8.times do |i|
  customer = customers.sample
  vehicle = customer.vehicles.sample

  Appointment.create!(
    scheduled_at: (i + 1).days.from_now,
    status: [ "scheduled", "confirmed" ].sample,
    notes: Faker::Lorem.sentence(word_count: 8, supplemental: false, random_words_to_add: 4),
    customer: customer,
    vehicle: vehicle
  )
end

# Turnos urgentes (hoy)
3.times do |i|
  customer = customers.sample
  vehicle = customer.vehicles.sample

  Appointment.create!(
    scheduled_at: (i + 1).hours.from_now,
    status: "scheduled",
    notes: "URGENTE - " + Faker::Lorem.sentence(word_count: 6, supplemental: false, random_words_to_add: 3),
    customer: customer,
    vehicle: vehicle
  )
end

# Crear Service Records
puts "🔧 Creando registros de servicio..."

customers.each do |customer|
  customer.vehicles.each do |vehicle|
    # Registros pasados
    rand(1..3).times do |i|
      service_date = (i + 1).months.ago.to_date
      total_amount = rand(50.0..500.0).round(2)

      ServiceRecord.create!(
        service_date: service_date,
        total_amount: total_amount,
        notes: Faker::Lorem.sentence(word_count: 10, supplemental: false, random_words_to_add: 5),
        mileage: rand(10000..150000),
        next_service_date: service_date + 6.months,
        customer: customer,
        vehicle: vehicle
      )
    end

    # Registro reciente
    ServiceRecord.create!(
      service_date: 2.weeks.ago.to_date,
      total_amount: rand(100.0..300.0).round(2),
      notes: Faker::Lorem.sentence(word_count: 10, supplemental: false, random_words_to_add: 5),
      mileage: rand(50000..120000),
      next_service_date: 4.months.from_now.to_date,
      customer: customer,
      vehicle: vehicle
    )
  end
end

# Crear algunos registros vencidos para testing
puts "⚠️ Creando registros vencidos para testing..."

customers.sample(3).each do |customer|
  vehicle = customer.vehicles.sample

  ServiceRecord.create!(
    service_date: 8.months.ago.to_date,
    total_amount: rand(80.0..200.0).round(2),
    notes: "Servicio vencido - " + Faker::Lorem.sentence(word_count: 8, supplemental: false, random_words_to_add: 4),
    mileage: rand(80000..180000),
    next_service_date: 2.months.ago.to_date, # Vencido
    customer: customer,
    vehicle: vehicle
  )
end

# Crear algunos registros próximos para testing
puts "📋 Creando registros próximos para testing..."

customers.sample(2).each do |customer|
  vehicle = customer.vehicles.sample

  ServiceRecord.create!(
    service_date: 5.months.ago.to_date,
    total_amount: rand(90.0..250.0).round(2),
    notes: "Servicio próximo - " + Faker::Lorem.sentence(word_count: 8, supplemental: false, random_words_to_add: 4),
    mileage: rand(60000..140000),
    next_service_date: 2.weeks.from_now.to_date, # Próximo
    customer: customer,
    vehicle: vehicle
  )
end

# Crear clientes adicionales para testing
additional_customers = [
  {
    name: "Roberto Silva",
    email: "roberto.silva@email.com",
    phone: "11-7777-8888",
    address: "San Telmo 678, CABA"
  },
  {
    name: "Laura Fernández",
    email: "laura.fernandez@email.com",
    phone: "11-3333-4444",
    address: "Palermo 123, CABA"
  },
  {
    name: "Diego Morales",
    email: "diego.morales@email.com",
    phone: "11-5555-6666",
    address: "Recoleta 456, CABA"
  },
  {
    name: "Carmen Ruiz",
    email: "carmen.ruiz@email.com",
    phone: "11-9999-0000",
    address: "Belgrano 789, CABA"
  },
  {
    name: "Fernando López",
    email: "fernando.lopez@email.com",
    phone: "11-1111-2222",
    address: "Villa Crespo 321, CABA"
  },
  {
    name: "Patricia Torres",
    email: "patricia.torres@email.com",
    phone: "11-4444-5555",
    address: "San Telmo 654, CABA"
  },
  {
    name: "Miguel Herrera",
    email: "miguel.herrera@email.com",
    phone: "11-6666-7777",
    address: "Palermo 987, CABA"
  },
  {
    name: "Isabel Vargas",
    email: "isabel.vargas@email.com",
    phone: "11-8888-9999",
    address: "Recoleta 147, CABA"
  },
  {
    name: "Carlos Mendoza",
    email: "carlos.mendoza@email.com",
    phone: "11-2222-3333",
    address: "Belgrano 258, CABA"
  },
  {
    name: "Ana Jiménez",
    email: "ana.jimenez@email.com",
    phone: "11-7777-8888",
    address: "Villa Crespo 369, CABA"
  }
]

puts "Creando #{additional_customers.length} clientes adicionales..."

additional_customers.each do |customer_data|
  customer = Customer.find_or_create_by(email: customer_data[:email]) do |c|
    c.name = customer_data[:name]
    c.phone = customer_data[:phone]
    c.address = customer_data[:address]
  end

  if customer.persisted?
    puts "✅ Cliente creado: #{customer.name}"
  else
    puts "❌ Error creando cliente: #{customer.name} - #{customer.errors.full_messages.join(', ')}"
  end
end

# Estadísticas finales
puts "\n✅ Seeds completados exitosamente!"
puts "📊 Resumen de datos creados:"
puts "   👥 Customers: #{Customer.count}"
puts "   🚗 Vehicles: #{Vehicle.count}"
puts "   🔧 Services: #{Service.count}"
puts "   📦 Products: #{Product.count}"
puts "   📅 Appointments: #{Appointment.count}"
puts "   🔧 Service Records: #{ServiceRecord.count}"

puts "\n🎯 Datos de prueba disponibles:"
puts "   • Usuarios con múltiples vehículos"
puts "   • Turnos en diferentes estados (pasados, futuros, urgentes)"
puts "   • Registros de servicio con fechas variadas"
puts "   • Algunos registros vencidos para testing"
puts "   • Algunos registros próximos para testing"

puts "\n🚀 Para probar la API:"
puts "   • Inicia el servidor: rails server"
puts "   • Usa la colección de Postman: postman_examples.json"
puts "   • O visita: http://localhost:3000/api/v1/customers"
