module ToolRegistry
  class ConsultarTurnosDisponibles < Base
    SLOT_DURATION_HOURS = 3
    MAX_DAILY_SLOTS     = 3
    DAY_KEYS            = %w[domingo lunes martes miercoles jueves viernes sabado].freeze

    DEFINITION = {
      type: "function",
      function: {
        name: "consultar_turnos_disponibles",
        description: "Consulta qué horarios quedan libres en un día específico. Usarla cuando el cliente pregunta por turnos disponibles antes de agendar.",
        parameters: {
          type: "object",
          properties: {
            fecha: { type: "string", description: "Fecha en formato YYYY-MM-DD" }
          },
          required: [ "fecha" ]
        }
      }
    }.freeze

    def self.definition = DEFINITION

    def call
      { reply: available_slots(@arguments[:fecha]) }
    end

    private

    def available_slots(fecha_str)
      date = parse_date(fecha_str)
      return "No pude interpretar la fecha '#{fecha_str}'. ¿Podés decirme el día con más detalle? Por ejemplo: 'el lunes 14'." unless date

      day_key = DAY_KEYS[date.wday]
      hours   = Setting.instance.opening_hours&.dig(day_key) || {}

      unless hours["open"]
        return "El #{day_key.capitalize} no atendemos. ¿Querés consultar otro día?"
      end

      day_open  = Time.zone.parse("#{date} #{hours['from']}")
      day_close = Time.zone.parse("#{date} #{hours['to']}")

      slots = []
      current = day_open
      while current + SLOT_DURATION_HOURS.hours <= day_close && slots.size < MAX_DAILY_SLOTS
        slots << current
        current += SLOT_DURATION_HOURS.hours
      end

      booked = Appointment
        .where(scheduled_at: date.beginning_of_day..date.end_of_day, status: %w[scheduled confirmed])
        .pluck(:scheduled_at)

      available = slots.reject do |slot|
        booked.any? { |b| b >= slot && b < slot + SLOT_DURATION_HOURS.hours }
      end

      fecha_label = "#{date.strftime('%d/%m')} (#{day_key})"

      if available.empty?
        "Para el #{fecha_label} no quedan turnos disponibles. ¿Querés que te anote para otro día?"
      else
        list = available.map do |s|
          "  • #{s.strftime('%H:%M')} a #{(s + SLOT_DURATION_HOURS.hours).strftime('%H:%M')}"
        end.join("\n")
        "Para el #{fecha_label} hay #{available.size} turno(s) disponible(s):\n#{list}\n¿Querés reservar alguno?"
      end
    rescue => e
      Rails.logger.error("[ToolRegistry::ConsultarTurnosDisponibles] available_slots failed: #{e.message}")
      "No pude consultar los turnos. Intentalo de nuevo o escribinos directamente."
    end

    def parse_date(fecha_str)
      str = fecha_str.to_s.strip.downcase
      return Date.current     if str.match?(/\bhoy\b/)
      return Date.current + 1 if str.match?(/\bma[ñn]ana\b/)

      Date.parse(str)
    rescue ArgumentError, TypeError
      nil
    end
  end
end
