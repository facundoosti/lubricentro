require 'rails_helper'

RSpec.describe Vehicle, type: :model do
  let(:customer) { create(:customer) }
  let(:vehicle) { create(:vehicle, customer: customer) }

  describe 'associations' do
    it { should belong_to(:customer) }
  end

  describe 'validations' do
    subject { build(:vehicle) }

    it { should validate_presence_of(:brand) }
    it { should validate_presence_of(:model) }
    it { should validate_presence_of(:license_plate) }
    it { should validate_presence_of(:year) }

    it { should validate_length_of(:brand).is_at_least(2).is_at_most(50) }
    it { should validate_length_of(:model).is_at_least(2).is_at_most(50) }
    it { should validate_length_of(:year).is_equal_to(4) }

    it { should validate_uniqueness_of(:license_plate).case_insensitive }
  end

  describe 'license_plate format validation' do
    it 'accepts valid license_plates' do
      valid_license_plates = [ 'ABC123', 'XYZ 789', 'AB123CD', 'A123BCD' ]
      valid_license_plates.each do |license_plate|
        vehicle = build(:vehicle, license_plate: license_plate, customer: customer)
        expect(vehicle).to be_valid, "Expected #{license_plate} to be valid"
      end
    end

    it 'rejects invalid license_plates' do
      invalid_license_plates = [ 'AB12', 'ABCDEFGHIJK', '123' ]
      invalid_license_plates.each do |license_plate|
        vehicle = build(:vehicle, license_plate: license_plate, customer: customer)
        expect(vehicle).not_to be_valid, "Expected #{license_plate} to be invalid"
      end
    end
  end

  describe 'callbacks' do
    describe '#normalize_license_plate' do
      it 'converts license_plate to uppercase' do
        vehicle = create(:vehicle, license_plate: 'abc123', customer: customer)
        expect(vehicle.license_plate).to eq('ABC123')
      end

      it 'strips whitespace' do
        vehicle = create(:vehicle, license_plate: ' ABC123 ', customer: customer)
        expect(vehicle.license_plate).to eq('ABC123')
      end
    end
  end

  describe 'scopes' do
    let(:other_customer) { create(:customer) }
    let!(:customer_vehicle) { create(:vehicle, brand: 'Honda', customer: customer) }
    let!(:other_vehicle) { create(:vehicle, customer: other_customer) }
    let!(:toyota_vehicle) { create(:vehicle, :toyota, customer: customer) }

    describe '.by_customer' do
      it 'returns vehicles for specified customer' do
        vehicles = Vehicle.by_customer(customer.id)
        expect(vehicles).to include(customer_vehicle, toyota_vehicle)
        expect(vehicles).not_to include(other_vehicle)
      end
    end

    describe '.by_brand' do
      it 'returns vehicles of specified brand' do
        vehicles = Vehicle.by_brand('Toyota')
        expect(vehicles).to include(toyota_vehicle)
        expect(vehicles).not_to include(customer_vehicle)
      end
    end
  end

  describe 'factory' do
    it 'creates valid vehicle' do
      vehicle = build(:vehicle)
      expect(vehicle).to be_valid
    end

    it 'creates vehicle with customer association' do
      vehicle = create(:vehicle)
      expect(vehicle.customer).to be_present
      expect(vehicle.customer).to be_a(Customer)
    end
  end
end
