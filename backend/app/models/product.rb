# == Schema Information
#
# Table name: products
#
#  id          :bigint           not null, primary key
#  brand       :string(100)
#  description :text
#  embedding   :vector(768)
#  name        :string(100)      not null
#  sku         :string(50)
#  unit        :string(50)
#  unit_price  :decimal(10, 2)   not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  supplier_id :bigint
#
# Indexes
#
#  index_products_on_name         (name) UNIQUE
#  index_products_on_sku          (sku) UNIQUE WHERE (sku IS NOT NULL)
#  index_products_on_supplier_id  (supplier_id)
#  index_products_on_unit_price   (unit_price)
#
# Foreign Keys
#
#  fk_rails_...  (supplier_id => suppliers.id)
#

class Product < ApplicationRecord
  # Relaciones
  belongs_to :supplier, optional: true
  has_many :service_record_products, dependent: :destroy
  has_many :service_records, through: :service_record_products
  has_one_attached :image

  # Validaciones
  validates :name, presence: true, length: { maximum: 100 }, uniqueness: { case_sensitive: false }
  validates :sku, length: { maximum: 50 }, allow_blank: true,
                  uniqueness: { case_sensitive: false, allow_blank: true }
  validates :description, length: { maximum: 1000 }, allow_blank: true
  validates :unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :unit, length: { maximum: 50 }, allow_blank: true
  validates :brand, length: { maximum: 100 }, allow_blank: true

  before_validation :assign_sku, on: :create

  # Scopes
  scope :by_name, ->(name) { where("name ILIKE ?", "%#{name}%") }
  scope :by_brand, ->(brand) { where("brand ILIKE ?", "%#{brand}%") }
  scope :by_price_range, ->(min, max) { where(unit_price: min..max) }
  scope :by_supplier, ->(id) { where(supplier_id: id) }
  scope :nearest_by_embedding, ->(embedding) { nearest_neighbors(:embedding, embedding, distance: "cosine").limit(5) }

  has_neighbors :embedding

  after_save { GenerateEmbeddingJob.perform_later(id) if embedding_text_changed? }

  def formatted_price
    "$#{unit_price.to_f}"
  end

  private

  def assign_sku
    self.sku = generate_unique_sku if sku.blank?
  end

  def generate_unique_sku
    loop do
      candidate = "PRD-#{SecureRandom.alphanumeric(6).upcase}"
      break candidate unless Product.exists?(sku: candidate)
    end
  end

  def embedding_text_changed?
    saved_change_to_name? || saved_change_to_description?
  end
end
