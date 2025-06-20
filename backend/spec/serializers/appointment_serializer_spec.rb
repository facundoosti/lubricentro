require 'rails_helper'

RSpec.describe AppointmentSerializer do
  let(:customer) { create(:customer) }
  let(:vehicle) { create(:vehicle, customer: customer) }
  let(:appointment) { create(:appointment, customer: customer, vehicle: vehicle) }

  describe 'default view' do
    let(:serialized) { AppointmentSerializer.render_as_hash(appointment) }

    it 'includes basic fields' do
      expect(serialized).to include(
        id: appointment.id,
        scheduled_at: appointment.scheduled_at,
        status: appointment.status,
        notes: appointment.notes,
        created_at: appointment.created_at,
        updated_at: appointment.updated_at
      )
    end

    it 'includes customer and vehicle associations' do
      expect(serialized).to have_key(:customer)
      expect(serialized).to have_key(:vehicle)
      expect(serialized[:customer][:id]).to eq(customer.id)
      expect(serialized[:vehicle][:id]).to eq(vehicle.id)
    end
  end

  describe 'summary view' do
    let(:serialized) { AppointmentSerializer.render_as_hash(appointment, view: :summary) }

    it 'includes only summary fields' do
      expect(serialized).to include(
        id: appointment.id,
        scheduled_at: appointment.scheduled_at,
        status: appointment.status
      )
    end

    it 'excludes detailed fields' do
      expect(serialized).not_to have_key(:notes)
      expect(serialized).not_to have_key(:created_at)
      expect(serialized).not_to have_key(:updated_at)
    end

    it 'includes customer and vehicle summary' do
      expect(serialized).to have_key(:customer)
      expect(serialized).to have_key(:vehicle)
    end
  end

  describe 'with_details view' do
    let(:serialized) { AppointmentSerializer.render_as_hash(appointment, view: :with_details) }

    it 'includes all detailed fields' do
      expect(serialized).to include(
        id: appointment.id,
        scheduled_at: appointment.scheduled_at,
        status: appointment.status,
        notes: appointment.notes,
        created_at: appointment.created_at,
        updated_at: appointment.updated_at
      )
    end

    it 'includes full customer and vehicle details' do
      expect(serialized).to have_key(:customer)
      expect(serialized).to have_key(:vehicle)
    end
  end

  describe 'formatted view' do
    let(:serialized) { AppointmentSerializer.render_as_hash(appointment, view: :formatted) }

    it 'includes formatted fields' do
      expect(serialized).to include(
        id: appointment.id,
        scheduled_at: appointment.scheduled_at,
        status: appointment.status,
        notes: appointment.notes,
        display_status: appointment.display_status,
        formatted_date: appointment.scheduled_at.strftime("%d/%m/%Y %H:%M"),
        can_be_cancelled: appointment.can_be_cancelled?,
        can_be_confirmed: appointment.can_be_confirmed?,
        can_be_completed: appointment.can_be_completed?,
        is_overdue: appointment.is_overdue?
      )
    end

    it 'excludes timestamp fields' do
      expect(serialized).not_to have_key(:created_at)
      expect(serialized).not_to have_key(:updated_at)
    end

    it 'includes customer and vehicle summary' do
      expect(serialized).to have_key(:customer)
      expect(serialized).to have_key(:vehicle)
    end

    context 'with different statuses' do
      it 'returns correct display_status for scheduled' do
        appointment.update(status: 'scheduled')
        serialized = AppointmentSerializer.render_as_hash(appointment, view: :formatted)
        expect(serialized[:display_status]).to eq('Agendado')
      end

      it 'returns correct display_status for confirmed' do
        appointment.update(status: 'confirmed')
        serialized = AppointmentSerializer.render_as_hash(appointment, view: :formatted)
        expect(serialized[:display_status]).to eq('Confirmado')
      end

      it 'returns correct display_status for completed' do
        appointment.update(status: 'completed')
        serialized = AppointmentSerializer.render_as_hash(appointment, view: :formatted)
        expect(serialized[:display_status]).to eq('Completado')
      end

      it 'returns correct display_status for cancelled' do
        appointment.update(status: 'cancelled')
        serialized = AppointmentSerializer.render_as_hash(appointment, view: :formatted)
        expect(serialized[:display_status]).to eq('Cancelado')
      end
    end

    context 'with different scheduled times' do
      it 'returns correct can_be_cancelled for future appointment' do
        appointment.update(scheduled_at: 1.day.from_now, status: 'scheduled')
        serialized = AppointmentSerializer.render_as_hash(appointment, view: :formatted)
        expect(serialized[:can_be_cancelled]).to be true
      end

      it 'returns correct can_be_cancelled for past appointment' do
        appointment.update_column(:scheduled_at, 1.day.ago)
        appointment.update(status: 'scheduled')
        serialized = AppointmentSerializer.render_as_hash(appointment, view: :formatted)
        expect(serialized[:can_be_cancelled]).to be false
      end

      it 'returns correct is_overdue for past appointment' do
        appointment.update_column(:scheduled_at, 1.day.ago)
        appointment.update(status: 'scheduled')
        serialized = AppointmentSerializer.render_as_hash(appointment, view: :formatted)
        expect(serialized[:is_overdue]).to be true
      end

      it 'returns correct is_overdue for future appointment' do
        appointment.update(scheduled_at: 1.day.from_now, status: 'scheduled')
        serialized = AppointmentSerializer.render_as_hash(appointment, view: :formatted)
        expect(serialized[:is_overdue]).to be false
      end
    end
  end

  describe 'collection serialization' do
    let!(:appointments) do
      a1 = create(:appointment, :scheduled, customer: customer, vehicle: vehicle)
      a2 = create(:appointment, :confirmed, customer: customer, vehicle: vehicle)
      a3 = create(:appointment, :completed, customer: customer, vehicle: vehicle, scheduled_at: 1.day.from_now)
      a3.update_column(:scheduled_at, 1.day.ago)
      [ a1, a2, a3 ]
    end

    it 'serializes collection correctly' do
      serialized = AppointmentSerializer.render_as_hash(appointments, view: :formatted)
      expect(serialized).to be_an(Array)
      expect(serialized.length).to eq(3)
      expect(serialized.first).to have_key(:id)
      expect(serialized.first).to have_key(:display_status)
    end
  end
end
