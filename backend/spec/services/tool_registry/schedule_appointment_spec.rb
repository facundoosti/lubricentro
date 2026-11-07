require 'rails_helper'

RSpec.describe ToolRegistry::ScheduleAppointment do
  include ActiveSupport::Testing::TimeHelpers

  let(:customer) { create(:customer) }
  let!(:vehicle) { create(:vehicle, customer: customer) }
  let(:conversation) { create(:conversation, customer: customer) }
  let(:future_datetime) { 2.days.from_now.strftime("%Y-%m-%d %H:%M") }

  before { allow(ActionCable.server).to receive(:broadcast) }

  def call_tool(args)
    described_class.call(args, conversation)
  end

  describe '#call' do
    context 'when the customer has exactly one vehicle' do
      it 'creates an appointment and returns a confirmation message' do
        expect {
          result = call_tool({ preferred_date: future_datetime })
          expect(result[:reply]).to include("agendamos")
        }.to change(Appointment, :count).by(1)
      end

      it 'sets the appointment status to scheduled' do
        call_tool({ preferred_date: future_datetime })
        expect(Appointment.last.status).to eq("scheduled")
      end

      it 'sets notes to indicate WhatsApp origin' do
        call_tool({ preferred_date: future_datetime })
        expect(Appointment.last.notes).to include("WhatsApp")
      end
    end

    context 'when the customer has multiple vehicles' do
      let!(:second_vehicle) { create(:vehicle, customer: customer, brand: "Honda") }

      context 'and the vehicle description matches one vehicle' do
        it 'creates the appointment for the matched vehicle' do
          result = call_tool({ preferred_date: future_datetime, vehicle: vehicle.brand })
          expect(result[:reply]).to include("agendamos")
          expect(Appointment.last.vehicle).to eq(vehicle)
        end
      end

      context 'and no vehicle description is provided' do
        it 'escalates to human' do
          result = call_tool({ preferred_date: future_datetime })
          expect(result[:reply]).to include("agente")
          expect(conversation.reload.status).to eq("needs_human")
        end
      end
    end

    context 'when the conversation has no customer' do
      let(:conversation) { create(:conversation, customer: nil) }

      it 'escalates to human' do
        result = call_tool({ preferred_date: future_datetime })
        expect(result[:reply]).to include("agente")
      end
    end

    context 'when preferred_date has no offset' do
      around { |example| travel_to(Time.utc(2026, 11, 10, 15, 0)) { example.run } }

      it 'interprets it as Argentina time' do
        call_tool({ preferred_date: "2026-11-20 13:00" })
        expect(Appointment.last.scheduled_at).to eq(Time.utc(2026, 11, 20, 16, 0))
      end

      it 'confirms the same local time' do
        result = call_tool({ preferred_date: "2026-11-20 13:00" })
        expect(result[:reply]).to include("20/11/2026 a las 13:00")
      end
    end

    context 'when the date is in the past' do
      it 'escalates to human with past date' do
        result = call_tool({ preferred_date: 1.day.ago.strftime("%Y-%m-%d %H:%M") })
        expect(result[:reply]).to include("No pude interpretar")
      end
    end
  end
end
