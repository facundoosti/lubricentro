# Línea de ítem (BudgetItem, ServiceRecordItem): importe neto, % de IVA libre y total.
# iva_rate nil = sin IVA (precio final); 0 se guarda como nil para no generar "IVA 0%".
module ItemizedTotals
  module Line
    extend ActiveSupport::Concern

    included do
      validates :description, presence: true, length: { maximum: 500 }
      validates :quantity, presence: true, numericality: { greater_than: 0 }
      validates :unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
      validates :iva_rate, numericality: { greater_than_or_equal_to: 0, less_than: 100 }, allow_nil: true

      validate :iva_rate_not_rounded_from_negative
      before_validation :normalize_iva_rate
      before_save :compute_total

      default_scope { order(:position) }
    end

    # Importe neto de la línea (sin IVA)
    def line_net
      ((quantity || 0) * (unit_price || 0)).round(2)
    end

    private

    def compute_total
      self.total = line_net
    end

    # Solo un 0 numérico real pasa a nil: "abc" también castea a 0 y debe fallar la validación.
    def normalize_iva_rate
      raw = raw_iva_rate_decimal
      self.iva_rate = nil if raw&.zero?
    end

    # La columna tiene 2 decimales: -0.001 castea a 0 y pasaría la validación de numericality.
    def iva_rate_not_rounded_from_negative
      raw = raw_iva_rate_decimal
      return unless raw&.negative? && iva_rate.present? && iva_rate >= 0

      errors.add(:iva_rate, :greater_than_or_equal_to, count: 0)
    end

    # Valor crudo como BigDecimal, o nil si no es un número
    def raw_iva_rate_decimal
      raw = iva_rate_before_type_cast
      return raw.to_d if raw.is_a?(Numeric)

      raw.to_d if raw.is_a?(String) && raw.strip.match?(/\A[+-]?\d+(\.\d+)?\z/)
    end
  end
end
