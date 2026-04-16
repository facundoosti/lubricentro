module ToolRegistry
  class EscalateToHuman < Base
    DEFINITION = {
      type: "function",
      function: {
        name: "escalate_to_human",
        description: "Deriva la conversación a atención humana. Usar ante quejas, preguntas complejas o pedidos de hablar con el dueño.",
        parameters: {
          type: "object",
          properties: {
            reason: { type: "string" }
          },
          required: [ "reason" ]
        }
      }
    }.freeze

    def self.definition = DEFINITION

    def call
      @conversation.update!(status: "needs_human")
      broadcast_status_update
      { reply: "Entendido, te comunico con una persona ahora mismo. Un momento." }
    end
  end
end
