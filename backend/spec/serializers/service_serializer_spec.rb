require 'rails_helper'

RSpec.describe ServiceSerializer, type: :serializer do
  let(:service) { create(:service, :oil_change) }

  describe 'default view' do
    let(:serialized) { ServiceSerializer.render_as_hash(service) }

    it 'includes basic fields' do
      expect(serialized[:id]).to eq(service.id)
      expect(serialized[:name]).to eq(service.name)
      expect(serialized[:description]).to eq(service.description)
      expect(serialized[:base_price]).to eq(service.base_price.to_s)
      expect(serialized[:created_at]).to be_present
      expect(serialized[:updated_at]).to be_present
    end

    it 'serializes all required attributes' do
      expected_keys = [ :id, :name, :description, :base_price, :created_at, :updated_at ]
      expect(serialized.keys).to match_array(expected_keys)
    end
  end

  describe 'summary view' do
    let(:serialized) { ServiceSerializer.render_as_hash(service, view: :summary) }

    it 'includes only essential fields' do
      expect(serialized[:id]).to eq(service.id)
      expect(serialized[:name]).to eq(service.name)
      expect(serialized[:base_price]).to eq(service.base_price.to_s)
    end

    it 'excludes non-essential fields' do
      expect(serialized).not_to have_key(:description)
      expect(serialized).not_to have_key(:created_at)
      expect(serialized).not_to have_key(:updated_at)
    end

    it 'serializes expected attributes for summary' do
      expected_keys = [ :id, :name, :base_price ]
      expect(serialized.keys).to match_array(expected_keys)
    end
  end

  describe 'formatted view' do
    let(:serialized) { ServiceSerializer.render_as_hash(service, view: :formatted) }

    it 'includes basic fields except base_price' do
      expect(serialized[:id]).to eq(service.id)
      expect(serialized[:name]).to eq(service.name)
      expect(serialized[:description]).to eq(service.description)
      expect(serialized[:created_at]).to be_present
      expect(serialized[:updated_at]).to be_present
    end

    it 'includes formatted_price instead of base_price' do
      expect(serialized[:formatted_price]).to eq(service.formatted_price)
      expect(serialized).not_to have_key(:base_price)
    end

    it 'serializes expected attributes for formatted view' do
      expected_keys = [ :id, :name, :description, :created_at, :updated_at, :formatted_price ]
      expect(serialized.keys).to match_array(expected_keys)
    end
  end

  describe 'collection serialization' do
    let!(:services) { create_list(:service, 3) }
    let(:serialized) { ServiceSerializer.render_as_hash(services, root: :services) }

    it 'serializes collection with root key' do
      expect(serialized).to have_key(:services)
      expect(serialized[:services]).to be_an(Array)
      expect(serialized[:services].count).to eq(3)
    end

    it 'each item contains expected fields' do
      serialized[:services].each do |service_data|
        expect(service_data).to have_key(:id)
        expect(service_data).to have_key(:name)
        expect(service_data).to have_key(:description)
        expect(service_data).to have_key(:base_price)
      end
    end
  end

  describe 'with different service traits' do
    let(:brake_service) { create(:service, :brake_service) }
    let(:tire_rotation) { create(:service, :tire_rotation) }

    it 'serializes oil change service correctly' do
      serialized = ServiceSerializer.render_as_hash(service)
      expect(serialized[:name]).to eq('Oil Change')
      expect(serialized[:base_price]).to eq('8500.0')
    end

    it 'serializes brake service correctly' do
      serialized = ServiceSerializer.render_as_hash(brake_service)
      expect(serialized[:name]).to eq('Brake Service')
      expect(serialized[:base_price]).to eq('25000.0')
    end

    it 'serializes tire rotation correctly' do
      serialized = ServiceSerializer.render_as_hash(tire_rotation)
      expect(serialized[:name]).to eq('Tire Rotation')
      expect(serialized[:base_price]).to eq('3500.0')
    end
  end
end
