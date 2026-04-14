module ToolRegistry
  class ConsultarPrecios < Base
    DEFINITION = {
      type: "function",
      function: {
        name: "consultar_precios",
        description: "Consulta precio y disponibilidad de un producto o servicio.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string" }
          },
          required: [ "query" ]
        }
      }
    }.freeze

    COSINE_DISTANCE_THRESHOLD = 0.4

    def self.definition = DEFINITION

    def call
      { reply: search_prices(@arguments[:query]) }
    end

    private

    def search_prices(query)
      embedding = EmbeddingService.generate(query)

      if embedding && postgresql?
        products = relevant_neighbors(Product, embedding)
        services = relevant_neighbors(Service, embedding)
      else
        products = Product.limit(5)
        services = Service.limit(5)
      end

      lines = []
      if products.any?
        lines << "Productos:"
        products.each { |p| lines << "  - #{p.name}: #{p.formatted_price}" }
      end
      if services.any?
        lines << "Servicios:"
        services.each { |s| lines << "  - #{s.name}: #{s.formatted_price}" }
      end

      lines.any? ? lines.join("\n") : "No encontré productos o servicios para esa consulta."
    rescue => e
      Rails.logger.error("[ToolRegistry::ConsultarPrecios] search_prices failed: #{e.message}")
      fallback_context
    end

    def relevant_neighbors(model, embedding)
      model.nearest_neighbors(:embedding, embedding, distance: "cosine")
           .limit(5)
           .select { |r| r.neighbor_distance < COSINE_DISTANCE_THRESHOLD }
           .first(3)
    end

    def fallback_context
      products = Product.limit(5).map { |p| "- #{p.name}: $#{p.formatted_price}" }.join("\n")
      services = Service.limit(5).map { |s| "- #{s.name}: $#{s.formatted_price}" }.join("\n")
      "Productos:\n#{products}\n\nServicios:\n#{services}"
    end
  end
end
