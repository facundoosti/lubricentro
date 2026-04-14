module ToolRegistry
  class AgendarTurno < Base
    DEFINITION = {
      type: "function",
      function: {
        name: "agendar_turno",
        description: "Registra un turno para el cliente en una fecha y hora específica.",
        parameters: {
          type: "object",
          properties: {
            fecha_preferida: { type: "string", description: "Fecha y hora en formato YYYY-MM-DD HH:MM" },
            vehiculo:        { type: "string" }
          },
          required: [ "fecha_preferida" ]
        }
      }
    }.freeze

    def self.definition = DEFINITION

    def call
      { reply: schedule_appointment(@arguments) }
    end

    private

    def schedule_appointment(args)
      fecha_preferida = args[:fecha_preferida]
      vehiculo_desc   = args[:vehiculo]
      customer        = @conversation.customer

      unless customer
        @conversation.update!(status: "needs_human")
        broadcast_status_update
        return "Anotamos tu pedido de turno para #{fecha_preferida}. Un agente te va a confirmar los detalles a la brevedad."
      end

      vehicle = find_vehicle(customer, vehiculo_desc)
      unless vehicle
        @conversation.update!(status: "needs_human")
        broadcast_status_update
        return "Anotamos tu pedido de turno para #{fecha_preferida}. Un agente te va a confirmar los detalles a la brevedad."
      end

      scheduled_at = begin
        Time.zone.parse(fecha_preferida.to_s)
      rescue ArgumentError, TypeError
        nil
      end

      unless scheduled_at&.future?
        return "No pude interpretar la fecha '#{fecha_preferida}'. ¿Podés indicarme día y hora? Por ejemplo: '15/04 a las 10:00'."
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
      Rails.logger.error("[ToolRegistry::AgendarTurno] schedule_appointment failed: #{e.message}")
      @conversation.update!(status: "needs_human")
      broadcast_status_update
      "Hubo un problema al agendar el turno. Un agente te va a contactar a la brevedad."
    end

    def find_vehicle(customer, vehiculo_desc)
      vehicles = customer.vehicles
      return vehicles.first if vehicles.count == 1
      return nil unless vehiculo_desc.present?

      term = vehiculo_desc.downcase.strip
      vehicles.find do |v|
        [ v.brand, v.model, v.license_plate, v.year ].any? do |attr|
          attr.to_s.downcase.include?(term) || term.include?(attr.to_s.downcase)
        end
      end
    end
  end
end
