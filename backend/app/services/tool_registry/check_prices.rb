module ToolRegistry
  class CheckPrices < Base
    DEFINITION = {
      type: "function",
      function: {
        name: "check_prices",
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
      products  = fetch_products(embedding)
      services  = fetch_services(embedding)

      lines = format_items("Productos", products) + format_items("Servicios", services)
      lines.any? ? lines.join("\n") : "No encontré productos o servicios para esa consulta."
    rescue => e
      Rails.logger.error("[ToolRegistry::CheckPrices] search_prices failed: #{e.message}")
      fallback_context
    end

    def fetch_products(embedding)
      embedding && postgresql? ? relevant_neighbors(Product, embedding) : Product.limit(5)
    end

    def fetch_services(embedding)
      embedding && postgresql? ? relevant_neighbors(Service, embedding) : Service.limit(5)
    end

    def format_items(label, items)
      return [] unless items.any?

      [ "#{label}:" ] + items.map { |i| "  - #{i.name}: #{i.formatted_price}" }
    end

    def relevant_neighbors(model, embedding)
      model.nearest_neighbors(:embedding, embedding, distance: "cosine")
           .limit(5)
           .select { |r| r.neighbor_distance < COSINE_DISTANCE_THRESHOLD }
           .first(3)
    end

    def fallback_context
      products = format_items("Productos", Product.limit(5)).join("\n")
      services = format_items("Servicios", Service.limit(5)).join("\n")
      "#{products}\n\n#{services}"
    end
  end
end
