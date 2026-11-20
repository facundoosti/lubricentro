# Línea de ítem (BudgetItem, ServiceRecordItem): importe neto, alícuota, % de ganancia y total.
# iva_rate nil = sin IVA (precio final). Ganancia compuesta: se aplica sobre neto + IVA de la línea
# (ver ItemizedTotals).
module ItemizedTotals
  module Line
    extend ActiveSupport::Concern

    included do
      # true al copiar ítems (duplicar presupuesto, atención desde presupuesto): conserva el % anterior.
      attr_accessor :legacy_iva_rate_ok

      validates :description, presence: true, length: { maximum: 500 }
      validates :quantity, presence: true, numericality: { greater_than: 0 }
      validates :unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
      # Solo si cambia: los ítems guardados con el % libre anterior se pueden volver a guardar.
      validates :iva_rate, inclusion: { in: Product::IVA_RATES, message: "debe ser 21, 10,5 o vacío" },
                           allow_nil: true, if: -> { will_save_change_to_iva_rate? && !legacy_iva_rate_ok }
      validates :margin_percentage, numericality: { greater_than_or_equal_to: 0, less_than: 1000 }

      before_validation :default_margin_percentage
      before_save :compute_total

      default_scope { order(:position) }
    end

    # Importe neto de la línea (sin IVA ni ganancia)
    def line_net
      ((quantity || 0) * (unit_price || 0)).round(2)
    end

    # IVA de la línea (0 sin alícuota). Solo es la base de la ganancia: los totales redondean
    # el IVA por alícuota (ItemizedTotals#iva_breakdown).
    def line_iva
      return 0.to_d unless iva_rate

      (line_net * iva_rate / 100).round(2)
    end

    # Ganancia de la línea, sobre el neto con IVA
    def line_margin
      ((line_net + line_iva) * (margin_percentage || 0) / 100).round(2)
    end

    private

    # nil o "" → 0 (sin ganancia)
    def default_margin_percentage
      self.margin_percentage = 0 if margin_percentage.blank?
    end

    def compute_total
      self.total = line_net
    end
  end
end
