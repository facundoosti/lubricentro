require 'rails_helper'

RSpec.describe Appointment, type: :model do
  describe 'associations' do
    it { should belong_to(:customer) }
    it { should belong_to(:vehicle) }
  end

  describe 'validations' do
    it { should validate_presence_of(:scheduled_at) }
    it { should validate_presence_of(:status) }
    it { should validate_inclusion_of(:status).in_array(%w[scheduled confirmed completed cancelled]) }
    it { should validate_length_of(:notes).is_at_most(1000) }
  end

  describe 'custom validations' do
    describe 'scheduled_at_must_be_in_future' do
      let(:customer) { create(:customer) }
      let(:vehicle) { create(:vehicle, customer: customer) }

      context 'when creating a new appointment' do
        it 'is valid when scheduled_at is in the future' do
          appointment = build(:appointment, customer: customer, vehicle: vehicle, scheduled_at: 1.day.from_now)
          expect(appointment).to be_valid
        end

        it 'is invalid when scheduled_at is in the past' do
          appointment = build(:appointment, customer: customer, vehicle: vehicle, scheduled_at: 1.day.ago)
          expect(appointment).not_to be_valid
          expect(appointment.errors[:scheduled_at]).to include('must be in the future')
        end

        it 'is invalid when scheduled_at is now' do
          appointment = build(:appointment, customer: customer, vehicle: vehicle, scheduled_at: Time.current)
          expect(appointment).not_to be_valid
          expect(appointment.errors[:scheduled_at]).to include('must be in the future')
        end
      end

      context 'when updating an existing appointment' do
        let!(:appointment) { create(:appointment, customer: customer, vehicle: vehicle, scheduled_at: 1.day.from_now) }

        it 'allows updating to past date' do
          appointment.scheduled_at = 1.day.ago
          expect(appointment).to be_valid
        end
      end
    end
  end

  describe 'scopes' do
    let(:customer) { create(:customer) }
    let(:vehicle) { create(:vehicle, customer: customer) }

    before do
      @scheduled = create(:appointment, :scheduled, customer: customer, vehicle: vehicle, scheduled_at: 1.day.from_now)
      @confirmed = create(:appointment, :confirmed, customer: customer, vehicle: vehicle, scheduled_at: 2.days.from_now)
      @completed = create(:appointment, :completed, customer: customer, vehicle: vehicle, scheduled_at: 1.day.from_now)
      @cancelled = create(:appointment, :cancelled, customer: customer, vehicle: vehicle, scheduled_at: 3.days.from_now)
      # For completed, set scheduled_at in the past after creation
      @completed.update_column(:scheduled_at, 1.day.ago)
    end

    describe '.scheduled' do
      it 'returns only scheduled appointments' do
        expect(Appointment.scheduled.count).to eq(1)
        expect(Appointment.scheduled.first.status).to eq('scheduled')
      end
    end

    describe '.confirmed' do
      it 'returns only confirmed appointments' do
        expect(Appointment.confirmed.count).to eq(1)
        expect(Appointment.confirmed.first.status).to eq('confirmed')
      end
    end

    describe '.completed' do
      it 'returns only completed appointments' do
        expect(Appointment.completed.count).to eq(1)
        expect(Appointment.completed.first.status).to eq('completed')
      end
    end

    describe '.cancelled' do
      it 'returns only cancelled appointments' do
        expect(Appointment.cancelled.count).to eq(1)
        expect(Appointment.cancelled.first.status).to eq('cancelled')
      end
    end

    describe '.upcoming' do
      it 'returns only future appointments ordered by scheduled_at' do
        upcoming = Appointment.upcoming
        expect(upcoming.count).to eq(3) # scheduled, confirmed, cancelled
        expect(upcoming.first.scheduled_at).to be < upcoming.last.scheduled_at
      end
    end

    describe '.past' do
      it 'returns only past appointments ordered by scheduled_at desc' do
        past = Appointment.past
        expect(past.count).to eq(1)
        expect(past.first.status).to eq('completed')
      end
    end

    describe '.by_customer' do
      let(:other_customer) { create(:customer) }
      let(:other_vehicle) { create(:vehicle, customer: other_customer) }

      before do
        @other_appointment = create(:appointment, customer: other_customer, vehicle: other_vehicle, scheduled_at: 1.day.from_now)
      end

      it 'returns appointments for specific customer' do
        expect(Appointment.by_customer(customer.id).count).to eq(4)
        expect(Appointment.by_customer(other_customer.id).count).to eq(1)
      end
    end

    describe '.by_vehicle' do
      let(:other_vehicle) { create(:vehicle, customer: customer) }

      before do
        @other_vehicle_appointment = create(:appointment, customer: customer, vehicle: other_vehicle, scheduled_at: 1.day.from_now)
      end

      it 'returns appointments for specific vehicle' do
        expect(Appointment.by_vehicle(vehicle.id).count).to eq(4)
        expect(Appointment.by_vehicle(other_vehicle.id).count).to eq(1)
      end
    end

    describe '.by_date_range' do
      it 'returns appointments within date range' do
        start_date = Date.current
        end_date = 2.days.from_now.to_date

        appointments = Appointment.by_date_range(start_date, end_date)
        expect(appointments.count).to eq(2) # scheduled and confirmed
      end
    end
  end

  describe 'instance methods' do
    let(:customer) { create(:customer) }
    let(:vehicle) { create(:vehicle, customer: customer) }
    let(:appointment) { create(:appointment, customer: customer, vehicle: vehicle) }

    describe '#display_status' do
      it 'returns human readable status' do
        expect(appointment.display_status).to eq('Agendado')

        appointment.update(status: 'confirmed')
        expect(appointment.display_status).to eq('Confirmado')

        appointment.update(status: 'completed')
        expect(appointment.display_status).to eq('Completado')

        appointment.update(status: 'cancelled')
        expect(appointment.display_status).to eq('Cancelado')
      end
    end

    describe '#can_be_cancelled?' do
      it 'returns true for scheduled/confirmed future appointments' do
        appointment.update(scheduled_at: 1.day.from_now, status: 'scheduled')
        expect(appointment.can_be_cancelled?).to be true

        appointment.update(status: 'confirmed')
        expect(appointment.can_be_cancelled?).to be true
      end

      it 'returns false for past appointments' do
        appointment.update(scheduled_at: 1.day.ago, status: 'scheduled')
        expect(appointment.can_be_cancelled?).to be false
      end

      it 'returns false for completed/cancelled appointments' do
        appointment.update(scheduled_at: 1.day.from_now, status: 'completed')
        expect(appointment.can_be_cancelled?).to be false

        appointment.update(status: 'cancelled')
        expect(appointment.can_be_cancelled?).to be false
      end
    end

    describe '#can_be_confirmed?' do
      it 'returns true for scheduled future appointments' do
        appointment.update(scheduled_at: 1.day.from_now, status: 'scheduled')
        expect(appointment.can_be_confirmed?).to be true
      end

      it 'returns false for non-scheduled appointments' do
        appointment.update(scheduled_at: 1.day.from_now, status: 'confirmed')
        expect(appointment.can_be_confirmed?).to be false
      end

      it 'returns false for past appointments' do
        appointment.update(scheduled_at: 1.day.ago, status: 'scheduled')
        expect(appointment.can_be_confirmed?).to be false
      end
    end

    describe '#can_be_completed?' do
      it 'returns true for scheduled/confirmed appointments' do
        appointment.update(status: 'scheduled')
        expect(appointment.can_be_completed?).to be true

        appointment.update(status: 'confirmed')
        expect(appointment.can_be_completed?).to be true
      end

      it 'returns false for completed/cancelled appointments' do
        appointment.update(status: 'completed')
        expect(appointment.can_be_completed?).to be false

        appointment.update(status: 'cancelled')
        expect(appointment.can_be_completed?).to be false
      end
    end

    describe '#is_overdue?' do
      it 'returns true for past scheduled/confirmed appointments' do
        appointment.update(scheduled_at: 1.day.ago, status: 'scheduled')
        expect(appointment.is_overdue?).to be true

        appointment.update(status: 'confirmed')
        expect(appointment.is_overdue?).to be true
      end

      it 'returns false for future appointments' do
        appointment.update(scheduled_at: 1.day.from_now, status: 'scheduled')
        expect(appointment.is_overdue?).to be false
      end

      it 'returns false for completed/cancelled appointments' do
        appointment.update(scheduled_at: 1.day.ago, status: 'completed')
        expect(appointment.is_overdue?).to be false

        appointment.update(status: 'cancelled')
        expect(appointment.is_overdue?).to be false
      end
    end
  end
end
