module ToolRegistry
  class CheckAvailableSlots < Base
    SLOT_DURATION_HOURS = 3
    MAX_DAILY_SLOTS     = 3
    DAY_KEYS            = %w[domingo lunes martes miercoles jueves viernes sabado].freeze

    DEFINITION = {
      type: "function",
      function: {
        name: "check_available_slots",
        description: "Consulta qué horarios quedan libres en un día específico. Usarla cuando el cliente pregunta por turnos disponibles antes de agendar.",
        parameters: {
          type: "object",
          properties: {
            date: { type: "string", description: "Fecha en formato YYYY-MM-DD" }
          },
          required: [ "date" ]
        }
      }
    }.freeze

    def self.definition = DEFINITION

    def call
      { reply: available_slots(@arguments[:date]) }
    end

    private

    def available_slots(date_str)
      date = parse_date(date_str)
      return "No pude interpretar la fecha '#{date_str}'. ¿Podés decirme el día con más detalle? Por ejemplo: 'el lunes 14'." unless date

      day_key = DAY_KEYS[date.wday]
      hours   = Setting.instance.opening_hours&.dig(day_key) || {}
      return "El #{day_key.capitalize} no atendemos. ¿Querés consultar otro día?" unless hours["open"]

      available = filter_booked(generate_slots(date, hours), date)
      format_response(available, date, day_key)
    rescue => e
      Rails.logger.error("[ToolRegistry::CheckAvailableSlots] available_slots failed: #{e.message}")
      "No pude consultar los turnos. Intentalo de nuevo o escribinos directamente."
    end

    def generate_slots(date, hours)
      day_open  = Time.zone.parse("#{date} #{hours['from']}")
      day_close = Time.zone.parse("#{date} #{hours['to']}")
      slots     = []
      current   = day_open
      while current + SLOT_DURATION_HOURS.hours <= day_close && slots.size < MAX_DAILY_SLOTS
        slots << current
        current += SLOT_DURATION_HOURS.hours
      end
      slots
    end

    def filter_booked(slots, date)
      booked = Appointment
        .where(scheduled_at: date.beginning_of_day..date.end_of_day, status: %w[scheduled confirmed])
        .pluck(:scheduled_at)

      slots.reject { |slot| booked.any? { |b| b >= slot && b < slot + SLOT_DURATION_HOURS.hours } }
    end

    def format_response(available, date, day_key)
      date_label = "#{date.strftime('%d/%m')} (#{day_key})"

      if available.empty?
        "Para el #{date_label} no quedan turnos disponibles. ¿Querés que te anote para otro día?"
      else
        list = available.map { |s| "  • #{s.strftime('%H:%M')} a #{(s + SLOT_DURATION_HOURS.hours).strftime('%H:%M')}" }.join("\n")
        "Para el #{date_label} hay #{available.size} turno(s) disponible(s):\n#{list}\n¿Querés reservar alguno?"
      end
    end

    def parse_date(date_str)
      str = date_str.to_s.strip.downcase
      return Date.current     if str.match?(/\bhoy\b/)
      return Date.current + 1 if str.match?(/\bma[ñn]ana\b/)

      Date.parse(str)
    rescue ArgumentError, TypeError
      nil
    end
  end
end
