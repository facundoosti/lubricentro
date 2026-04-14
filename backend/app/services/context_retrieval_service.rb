class ContextRetrievalService
  DISTANCE_THRESHOLD = 0.4
  SEMANTIC_LIMIT     = 3
  FALLBACK_LIMIT     = 5

  def self.call(query)
    new.call(query)
  end

  def call(query)
    return fallback_context unless postgresql?

    embedding = EmbeddingService.generate(query)
    return fallback_context unless embedding

    products = Product.nearest_by_embedding(embedding)
                      .select { |r| r.neighbor_distance < DISTANCE_THRESHOLD }
                      .first(SEMANTIC_LIMIT)
    services = Service.nearest_by_embedding(embedding)
                      .select { |r| r.neighbor_distance < DISTANCE_THRESHOLD }
                      .first(SEMANTIC_LIMIT)

    format_context(products, services)
  end

  private

  def fallback_context
    format_context(Product.limit(FALLBACK_LIMIT), Service.limit(FALLBACK_LIMIT))
  end

  def format_context(products, services)
    "Productos:\n#{format_items(products)}\n\nServicios:\n#{format_items(services)}"
  end

  def format_items(items)
    items.map { |i| "- #{i.name}: #{i.formatted_price}" }.join("\n")
  end

  def postgresql?
    ActiveRecord::Base.connection.adapter_name == "PostgreSQL"
  end
end
