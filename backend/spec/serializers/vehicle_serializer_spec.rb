require 'rails_helper'

RSpec.describe VehicleSerializer, type: :serializer do
  let(:customer) { create(:customer) }
  let(:vehicle) { create(:vehicle, customer: customer) }

  describe 'default view' do
    let(:serialized_vehicle) { VehicleSerializer.render_as_hash(vehicle) }

    it 'includes basic vehicle fields' do
      expect(serialized_vehicle).to include(
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        license_plate: vehicle.license_plate,
        year: vehicle.year,
        customer_id: vehicle.customer_id
      )
    end

    it 'includes customer_name field' do
      expect(serialized_vehicle).to include(customer_name: customer.name)
    end

    it 'includes timestamps' do
      expect(serialized_vehicle).to include(
        :created_at,
        :updated_at
      )
    end

    it 'does not include customer association by default' do
      expect(serialized_vehicle).not_to have_key(:customer)
      expect(serialized_vehicle).not_to have_key(:appointments_count)
      expect(serialized_vehicle).not_to have_key(:service_records_count)
    end
  end

  describe ':with_customer view' do
    let(:serialized_vehicle) { VehicleSerializer.render_as_hash(vehicle, view: :with_customer) }

    it 'includes all basic fields' do
      expect(serialized_vehicle).to include(
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        license_plate: vehicle.license_plate,
        year: vehicle.year,
        customer_id: vehicle.customer_id,
        customer_name: customer.name
      )
    end

    it 'includes customer association' do
      expect(serialized_vehicle).to have_key(:customer)
      expect(serialized_vehicle[:customer]).to be_a(Hash)
      expect(serialized_vehicle[:customer]).to include(
        id: customer.id,
        name: customer.name,
        phone: customer.phone
      )
    end

    it 'includes count fields' do
      expect(serialized_vehicle).to have_key(:appointments_count)
      expect(serialized_vehicle).to have_key(:service_records_count)
      expect(serialized_vehicle[:appointments_count]).to eq(0) # TODO: when appointments model exists
      expect(serialized_vehicle[:service_records_count]).to eq(0) # TODO: when service_records model exists
    end
  end

  describe ':summary view' do
    let(:serialized_vehicle) { VehicleSerializer.render_as_hash(vehicle, view: :summary) }

    it 'includes only summary fields' do
      expect(serialized_vehicle).to include(
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        license_plate: vehicle.license_plate,
        year: vehicle.year
      )
    end

    it 'excludes detailed fields' do
      expect(serialized_vehicle).not_to have_key(:customer_id)
      expect(serialized_vehicle).not_to have_key(:customer_name)
      expect(serialized_vehicle).not_to have_key(:created_at)
    end
  end

  describe 'collection serialization' do
    let(:vehicles) { create_list(:vehicle, 3, customer: customer) }
    let(:serialized_vehicles) { VehicleSerializer.render_as_hash(vehicles) }

    it 'serializes multiple vehicles' do
      expect(serialized_vehicles).to be_an(Array)
      expect(serialized_vehicles.size).to eq(3)
    end

    it 'each vehicle includes all basic fields' do
      serialized_vehicles.each do |vehicle_data|
        expect(vehicle_data).to include(
          :id, :brand, :model, :license_plate, :year, :customer_id, :customer_name, :created_at, :updated_at
        )
      end
    end
  end

  describe 'customer_name field' do
    context 'when customer exists' do
      it 'returns customer name' do
        serialized_vehicle = VehicleSerializer.render_as_hash(vehicle)
        expect(serialized_vehicle[:customer_name]).to eq(customer.name)
      end
    end

    context 'when customer is nil' do
      let(:vehicle_without_customer) { build(:vehicle, customer: nil) }

      it 'returns nil safely' do
        # This scenario might not happen due to validations, but testing safe navigation
        serialized_vehicle = VehicleSerializer.render_as_hash(vehicle_without_customer)
        expect(serialized_vehicle[:customer_name]).to be_nil
      end
    end
  end
end
