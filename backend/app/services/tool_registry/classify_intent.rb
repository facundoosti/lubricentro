module ToolRegistry
  class ClassifyIntent < Base
    DEFINITION = {
      type: "function",
      function: {
        name: "classify_intent",
        description: "Clasifica si el mensaje es de un cliente o un proveedor.",
        parameters: {
          type: "object",
          properties: {
            type: { type: "string", enum: [ "cliente", "proveedor" ] }
          },
          required: [ "type" ]
        }
      }
    }.freeze

    def self.definition = DEFINITION

    def call
      return nil unless @arguments[:type] == "proveedor"

      @conversation.update!(status: "supplier")
      broadcast_status_update
      { reply: "Gracias. Tu mensaje fue recibido y lo revisamos a la brevedad." }
    end
  end
end
