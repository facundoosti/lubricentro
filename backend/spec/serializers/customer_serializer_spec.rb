require 'rails_helper'

RSpec.describe CustomerSerializer, type: :serializer do
  let(:customer) { create(:customer) }
  let(:customer_with_vehicles) { create(:customer_with_vehicles) }

  describe 'default view' do
    let(:serialized_customer) { CustomerSerializer.render_as_hash(customer) }

    it 'includes basic customer fields' do
      expect(serialized_customer).to include(
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address
      )
    end

    it 'includes timestamps' do
      expect(serialized_customer).to include(
        :created_at,
        :updated_at
      )
    end

    it 'does not include vehicles by default' do
      expect(serialized_customer).not_to have_key(:vehicles)
      expect(serialized_customer).to have_key(:vehicles_count)
    end
  end

  describe ':with_vehicles view' do
    let(:serialized_customer) { CustomerSerializer.render_as_hash(customer_with_vehicles, view: :with_vehicles) }

    it 'includes all basic fields' do
      expect(serialized_customer).to include(
        id: customer_with_vehicles.id,
        name: customer_with_vehicles.name,
        phone: customer_with_vehicles.phone,
        email: customer_with_vehicles.email,
        address: customer_with_vehicles.address
      )
    end

    it 'includes vehicles association' do
      expect(serialized_customer).to have_key(:vehicles)
      expect(serialized_customer[:vehicles]).to be_an(Array)
      expect(serialized_customer[:vehicles].size).to eq(customer_with_vehicles.vehicles.count)
    end

    it 'includes vehicles_count' do
      expect(serialized_customer).to have_key(:vehicles_count)
      expect(serialized_customer[:vehicles_count]).to eq(customer_with_vehicles.vehicles.count)
    end

    it 'vehicles include summary fields' do
      vehicle_data = serialized_customer[:vehicles].first
      expect(vehicle_data).to include(
        :id, :brand, :model, :license_plate, :year
      )
    end
  end

  describe ':summary view' do
    let(:serialized_customer) { CustomerSerializer.render_as_hash(customer, view: :summary) }

    it 'includes only summary fields' do
      expect(serialized_customer).to include(
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email
      )
    end

    it 'excludes detailed fields' do
      expect(serialized_customer).not_to have_key(:address)
      expect(serialized_customer).not_to have_key(:created_at)
    end
  end

  describe 'collection serialization' do
    let(:customers) { create_list(:customer, 3) }
    let(:serialized_customers) { CustomerSerializer.render_as_hash(customers) }

    it 'serializes multiple customers' do
      expect(serialized_customers).to be_an(Array)
      expect(serialized_customers.size).to eq(3)
    end

    it 'each customer includes all basic fields' do
      serialized_customers.each do |customer_data|
        expect(customer_data).to include(
          :id, :name, :phone, :email, :address, :created_at, :updated_at
        )
      end
    end
  end
end
