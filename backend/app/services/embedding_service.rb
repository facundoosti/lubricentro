class EmbeddingService
  # Interruptor: AI_EMBEDDINGS_ENABLED=false corta toda llamada a la API de embeddings
  def self.enabled?
    ENV.fetch("AI_EMBEDDINGS_ENABLED", "true") != "false"
  end

  def self.generate(text)
    new.generate(text)
  end

  def self.reindex_catalog!
    new.reindex_catalog!
  end

  def generate(text)
    return nil unless self.class.enabled?

    response = client.embeddings(
      parameters: {
        model:      ENV.fetch("AI_MODEL_EMBEDDING", nil),
        input:      text.to_s.strip,
        dimensions: ENV.fetch("AI_EMBEDDING_DIMENSION").to_i
      }
    )
    response.dig("data", 0, "embedding")
  rescue => e
    Rails.logger.error("[EmbeddingService] Error generating embedding: #{e.message}")
    nil
  end

  def reindex_catalog!
    Product.find_each do |product|
      embedding = generate("#{product.name} #{product.description}")
      product.update_column(:embedding, embedding) if embedding
    end
    Service.find_each do |service|
      embedding = generate("#{service.name} #{service.description}")
      service.update_column(:embedding, embedding) if embedding
    end
  end

  private

  def client
    @client ||= OpenAI::Client.new(
      uri_base:      ENV.fetch("AI_EMBEDDING_URL"),
      access_token:  ENV.fetch("AI_EMBEDDING_KEY"),
      extra_headers: {
        "HTTP-Referer" => "https://lubricentro.app",
        "X-Title"      => "Lubricentro"
      }
    )
  end
end
