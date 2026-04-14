# == Schema Information
#
# Table name: services
#
#  id          :bigint           not null, primary key
#  base_price  :decimal(10, 2)   not null
#  description :text
#  embedding   :vector(768)
#  name        :string(100)      not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_services_on_base_price  (base_price)
#  index_services_on_name        (name) UNIQUE
#

class Service < ApplicationRecord
  # Relaciones
  has_many :service_record_services, dependent: :destroy
  has_many :service_records, through: :service_record_services

  # Validaciones (siguiendo BD constraints)
  validates :name, presence: true, length: { maximum: 100 }, uniqueness: { case_sensitive: false }
  validates :description, length: { maximum: 1000 }, allow_blank: true
  validates :base_price, presence: true, numericality: { greater_than: 0 }

  # Scopes útiles
  scope :by_name, ->(name) { where("name ILIKE ?", "%#{name}%") }
  scope :by_price_range, ->(min, max) { where(base_price: min..max) }
  scope :active, -> { where(active: true) } # Para futuro soft delete
  scope :nearest_by_embedding, ->(embedding) { nearest_neighbors(:embedding, embedding, distance: "cosine").limit(5) }

  has_neighbors :embedding

  after_save :generate_embedding, if: :embedding_text_changed?

  # Métodos helper
  def display_name
    name.presence || "Service ##{id}"
  end

  def formatted_price
    "$#{base_price.to_f}"
  end

  private

  def generate_embedding
    embedding = EmbeddingService.generate("#{name} #{description}")
    update_column(:embedding, embedding) if embedding
  end

  def embedding_text_changed?
    saved_change_to_name? || saved_change_to_description?
  end
end
