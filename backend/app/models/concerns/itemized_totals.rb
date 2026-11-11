# Totales con IVA discriminado para un padre con `has_many :items` (presupuesto, atención).
# unit_price de los ítems es neto; los ítems sin alícuota (servicios, datos anteriores al IVA)
# se suman como precio final. El IVA se redondea por alícuota, no por línea.
# Los ítems marcados para borrar (nested attributes) no cuentan.
module ItemizedTotals
  extend ActiveSupport::Concern

  # [{ rate: 21.0, base: 20000.0, amount: 4200.0 }, ...] ordenado por alícuota descendente
  def iva_breakdown
    taxed_items.group_by { |i| i.iva_rate.to_d }.sort_by { |rate, _| -rate }.map do |rate, group|
      base = group.sum(&:line_net)
      { rate: rate, base: base, amount: (base * rate / 100).round(2) }
    end
  end

  def exempt_total
    active_items.reject(&:iva_rate).sum(&:line_net)
  end

  # Neto de los ítems con alícuota
  def items_net_total
    taxed_items.sum(&:line_net)
  end

  def items_iva_total
    iva_breakdown.sum { |row| row[:amount] }
  end

  # Neto + IVA + sin IVA (= total efectivo/débito del presupuesto)
  def items_grand_total
    items_net_total + items_iva_total + exempt_total
  end

  private

  def active_items
    items.reject(&:marked_for_destruction?)
  end

  def taxed_items
    active_items.select(&:iva_rate)
  end
end
