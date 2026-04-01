# == Schema Information
#
# Table name: service_record_products
#
#  id                :bigint           not null, primary key
#  quantity          :integer          default(1), not null
#  unit_price        :decimal(10, 2)   not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  product_id        :bigint           not null
#  service_record_id :bigint           not null
#
# Indexes
#
#  index_service_record_products_on_product_id         (product_id)
#  index_service_record_products_on_quantity           (quantity)
#  index_service_record_products_on_service_record_id  (service_record_id)
#  index_service_record_products_on_unit_price         (unit_price)
#  index_service_record_products_unique                (service_record_id,product_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (product_id => products.id)
#  fk_rails_...  (service_record_id => service_records.id)
#
class ServiceRecordProduct < ApplicationRecord
  belongs_to :service_record
  belongs_to :product

  # Validaciones
  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :service_record_id, uniqueness: { scope: :product_id }

  # Callbacks
  before_save :set_unit_price_from_product, if: :product_id_changed?

  # Métodos
  def total_price
    quantity * unit_price
  end

  def formatted_total_price
    ActionController::Base.helpers.number_to_currency(total_price, unit: "$", separator: ",", delimiter: ".")
  end

  def formatted_unit_price
    ActionController::Base.helpers.number_to_currency(unit_price, unit: "$", separator: ",", delimiter: ".")
  end

  private

  def set_unit_price_from_product
    self.unit_price = product.unit_price if product.present?
  end
end
