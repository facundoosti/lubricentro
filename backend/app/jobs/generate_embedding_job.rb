class GenerateEmbeddingJob < ApplicationJob
  queue_as :default

  def perform(product_id)
    product = Product.find_by(id: product_id)
    return unless product

    embedding = EmbeddingService.generate("#{product.name} #{product.description}")
    product.update_column(:embedding, embedding) if embedding
  end
end
