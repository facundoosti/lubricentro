module ToolRegistry
  class ScheduleAppointment < Base
    DEFINITION = {
      type: "function",
      function: {
        name: "schedule_appointment",
        description: "Registra un turno para el cliente en una fecha y hora específica.",
        parameters: {
          type: "object",
          properties: {
            preferred_date: { type: "string", description: "Fecha y hora en formato YYYY-MM-DD HH:MM" },
            vehicle:        { type: "string" }
          },
          required: [ "preferred_date" ]
        }
      }
    }.freeze

    def self.definition = DEFINITION

    def call
      { reply: schedule_appointment(@arguments) }
    end

    private

    def schedule_appointment(args)
      preferred_date = args[:preferred_date]
      customer       = @conversation.customer

      return escalate_to_human(preferred_date) unless customer

      vehicle = find_vehicle(customer, args[:vehicle])
      return escalate_to_human(preferred_date) unless vehicle

      scheduled_at = parse_datetime(preferred_date)
      unless scheduled_at&.future?
        return "No pude interpretar la fecha '#{preferred_date}'. ¿Podés indicarme día y hora? Por ejemplo: '15/04 a las 10:00'."
      end

      appointment = Appointment.create!(
        customer:     customer,
        vehicle:      vehicle,
        scheduled_at: scheduled_at,
        status:       "scheduled",
        notes:        "Agendado por WhatsApp"
      )

      "Perfecto, te agendamos para el #{appointment.scheduled_at.strftime('%d/%m/%Y a las %H:%M')}. ¡Nos vemos!"
    rescue => e
      Rails.logger.error("[ToolRegistry::ScheduleAppointment] schedule_appointment failed: #{e.message}")
      escalate_to_human(nil)
      "Hubo un problema al agendar el turno. Un agente te va a contactar a la brevedad."
    end

    def escalate_to_human(preferred_date)
      @conversation.update!(status: "needs_human")
      broadcast_status_update
      "Anotamos tu pedido de turno#{" para #{preferred_date}" if preferred_date}. Un agente te va a confirmar los detalles a la brevedad."
    end

    def parse_datetime(date_str)
      Time.zone.parse(date_str.to_s)
    rescue ArgumentError, TypeError
      nil
    end

    def find_vehicle(customer, vehicle_desc)
      vehicles = customer.vehicles
      return vehicles.first if vehicles.count == 1
      return nil unless vehicle_desc.present?

      term = vehicle_desc.downcase.strip
      vehicles.find do |v|
        [ v.brand, v.model, v.license_plate, v.year ].any? do |attr|
          attr.to_s.downcase.include?(term) || term.include?(attr.to_s.downcase)
        end
      end
    end
  end
end
