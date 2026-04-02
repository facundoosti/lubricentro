class EmbeddingService
  MODEL = "text-embedding-3-small"

  def self.generate(text)
    new.generate(text)
  end

  def self.reindex_catalog!
    new.reindex_catalog!
  end

  def generate(text)
    response = client.embeddings(
      parameters: {
        model: MODEL,
        input: text.to_s.strip
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
    @client ||= OpenAI::Client.new(access_token: ENV.fetch("OPENAI_API_KEY"))
  end
end
