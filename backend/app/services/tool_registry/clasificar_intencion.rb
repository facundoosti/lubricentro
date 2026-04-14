module ToolRegistry
  class ClasificarIntencion < Base
    DEFINITION = {
      type: "function",
      function: {
        name: "clasificar_intencion",
        description: "Clasifica si el mensaje es de un cliente o un proveedor.",
        parameters: {
          type: "object",
          properties: {
            tipo: { type: "string", enum: [ "cliente", "proveedor" ] }
          },
          required: [ "tipo" ]
        }
      }
    }.freeze

    def self.definition = DEFINITION

    def call
      return nil unless @arguments[:tipo] == "proveedor"

      @conversation.update!(status: "supplier")
      broadcast_status_update
      { reply: "Gracias. Tu mensaje fue recibido y lo revisamos a la brevedad." }
    end
  end
end
