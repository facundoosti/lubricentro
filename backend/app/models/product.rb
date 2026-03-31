# == Schema Information
#
# Table name: products
#
#  id          :integer          not null, primary key
#  name        :string(100)      not null
#  description :text
#  unit_price  :decimal(10, 2)   not null
#  unit        :string(50)
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_products_on_name        (name) UNIQUE
#  index_products_on_unit_price  (unit_price)
#

class Product < ApplicationRecord
  # Vector embeddings configuration
  # normalize: true es requerido para distancia coseno con cube extension
  has_neighbors :embedding, dimensions: 4096

  # Relaciones
  has_many :service_record_products, dependent: :destroy
  has_many :service_records, through: :service_record_products

  # Validaciones
  validates :name, presence: true, length: { maximum: 100 }, uniqueness: { case_sensitive: false }
  validates :description, length: { maximum: 1000 }, allow_blank: true
  validates :unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :unit, length: { maximum: 50 }, allow_blank: true

  # Callbacks para generar embeddings automáticamente
  before_save :generate_embedding, if: :should_generate_embedding?

  # Scopes
  scope :by_name, ->(name) { where("name ILIKE ?", "%#{name}%") }
  scope :by_price_range, ->(min, max) { where(unit_price: min..max) }

  # Métodos
  def formatted_price
    "$#{unit_price.to_f}"
  end

  # Método para buscar productos similares usando embeddings
  def self.search_similar(query_text, limit: 10)
    return none if query_text.blank?

    query_embedding = generate_query_embedding(query_text)
    return none unless query_embedding

    # Usar el método de clase de Neighbor para buscar vecinos más cercanos
    nearest_neighbors(:embedding, query_embedding, distance: "cosine")
      .where.not(embedding: nil)
      .limit(limit)
  end

  private

  # Determina si se debe generar un nuevo embedding
  def should_generate_embedding?
    # Generar si es nuevo o si cambió el nombre o descripción
    new_record? || name_changed? || description_changed?
  end

  # Genera el embedding usando RubyLLM
  def generate_embedding
    text_to_embed = embedding_text
    return if text_to_embed.blank?

    begin
      embedding_result = RubyLLM.embed(
        text_to_embed,
        model: 'text-embedding-qwen3-embedding-8b',
        provider: :openai,
        assume_model_exists: true
      )

      if embedding_result&.vectors
        self.embedding = embedding_result.vectors
      else
        Rails.logger.warn "Failed to generate embedding for product #{id || 'new'}: No vectors returned"
      end
    rescue StandardError => e
      Rails.logger.error "Error generating embedding for product #{id || 'new'}: #{e.message}"
      # No lanzar excepción para no bloquear la creación/actualización del producto
    end
  end

  # Genera el texto que se usará para crear el embedding
  def embedding_text
    parts = [name]
    parts << description if description.present?
    parts << "Unidad: #{unit}" if unit.present?
    parts.join(". ")
  end

  # Método de clase para generar embedding de una query
  def self.generate_query_embedding(query_text)
    return nil if query_text.blank?

    begin
      embedding_result = RubyLLM.embed(
        query_text,
        model: 'text-embedding-qwen3-embedding-8b',
        provider: :openai,
        assume_model_exists: true
      )

      embedding_result&.vectors
    rescue StandardError => e
      Rails.logger.error "Error generating query embedding: #{e.message}"
      nil
    end
  end
end
