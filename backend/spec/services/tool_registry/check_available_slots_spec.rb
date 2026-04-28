require 'rails_helper'

RSpec.describe ToolRegistry::CheckAvailableSlots do
  include ActiveSupport::Testing::TimeHelpers

  let(:conversation) { create(:conversation) }

  def call_tool(date_str)
    described_class.call({ date: date_str }, conversation)
  end

  before do
    allow(ActionCable.server).to receive(:broadcast)
    setting = Setting.instance
    setting.update!(opening_hours: {
      "lunes"     => { "open" => true,  "from" => "08:00", "to" => "17:00" },
      "martes"    => { "open" => true,  "from" => "08:00", "to" => "17:00" },
      "miercoles" => { "open" => true,  "from" => "08:00", "to" => "17:00" },
      "jueves"    => { "open" => true,  "from" => "08:00", "to" => "17:00" },
      "viernes"   => { "open" => true,  "from" => "08:00", "to" => "17:00" },
      "sabado"    => { "open" => false },
      "domingo"   => { "open" => false }
    })
  end

  describe '#call' do
    it 'returns a hash with :reply key' do
      result = described_class.call({ date: Date.current.next_occurring(:monday).to_s }, conversation)
      expect(result).to have_key(:reply)
    end

    context 'when date is "hoy"' do
      it 'interprets hoy as today' do
        travel_to Date.new(2025, 5, 5) do # lunes
          result = call_tool("hoy")
          expect(result[:reply]).to include("05/05")
        end
      end
    end

    context 'when date is "mañana"' do
      it 'interprets mañana as tomorrow' do
        travel_to Date.new(2025, 5, 5) do # lunes → mañana = martes
          result = call_tool("mañana")
          expect(result[:reply]).to include("06/05")
        end
      end
    end

    context 'when the day is closed (saturday)' do
      it 'returns a message saying the lubricentro is closed' do
        next_saturday = Date.current.next_occurring(:saturday)
        result = call_tool(next_saturday.to_s)
        expect(result[:reply]).to include("no atendemos")
      end
    end

    context 'when the day has no opening_hours entry' do
      before do
        Setting.instance.update!(opening_hours: {})
      end

      it 'returns a closed message' do
        next_monday = Date.current.next_occurring(:monday)
        result = call_tool(next_monday.to_s)
        expect(result[:reply]).to include("no atendemos")
      end
    end

    context 'when all slots are booked' do
      let(:date) { Date.current.next_occurring(:monday) }
      let(:customer) { create(:customer) }
      let(:vehicle) { create(:vehicle, customer: customer) }

      before do
        [ 8, 11, 14 ].each do |hour|
          create(:appointment,
            customer: customer,
            vehicle: vehicle,
            scheduled_at: date.to_time.change(hour: hour),
            status: "scheduled"
          )
        end
      end

      it 'returns no available slots message' do
        result = call_tool(date.to_s)
        expect(result[:reply]).to include("no quedan turnos disponibles")
      end
    end

    context 'when slots are available' do
      let(:date) { Date.current.next_occurring(:tuesday) }

      it 'lists available time ranges' do
        result = call_tool(date.to_s)
        expect(result[:reply]).to include("turno(s) disponible(s)")
        expect(result[:reply]).to include("08:00")
      end
    end
  end
end
