require 'rails_helper'

# El concern se prueba con ServiceRecord / ServiceRecordItem; Budget y BudgetItem lo comparten
# (ver budget_spec y budget_item_spec).
RSpec.describe ItemizedTotals do
  describe ItemizedTotals::Line do
    subject(:line) { build(:service_record_item, quantity: 2, unit_price: 10_000) }

    it 'calcula el neto de la línea' do
      expect(line.line_net).to eq(20_000)
    end

    it 'guarda el neto como total de la línea' do
      item = create(:service_record_item, quantity: 2, unit_price: 10_000, iva_rate: 21)
      expect(item.reload.total).to eq(20_000)
    end

    it 'acepta cualquier % entre 0 y 99,99' do
      [ 15, 15.75, 99.99, 21, 10.5, nil ].each do |rate|
        expect(build(:service_record_item, iva_rate: rate)).to be_valid
      end
    end

    it 'rechaza 100 y negativos' do
      [ 100, -1 ].each do |rate|
        item = build(:service_record_item, iva_rate: rate)
        expect(item).not_to be_valid
        expect(item.errors[:iva_rate]).to be_present
      end
    end

    it 'guarda 0 como sin IVA' do
      [ 0, '0', '0.00' ].each do |rate|
        item = build(:service_record_item, iva_rate: rate)
        expect(item).to be_valid
        expect(item.iva_rate).to be_nil
      end
    end

    it 'rechaza un % no numérico o apenas negativo en vez de pasarlo a sin IVA' do
      [ 'abc', -0.001, '-0.001' ].each do |rate|
        item = build(:service_record_item, iva_rate: rate)
        expect(item).not_to be_valid, "#{rate.inspect} debería ser inválido"
        expect(item.errors[:iva_rate]).to be_present
      end
    end

    it 'redondea el neto de la línea a 2 decimales' do
      expect(build(:service_record_item, quantity: 0.33, unit_price: 10.01).line_net).to eq(BigDecimal('3.30'))
    end
  end

  describe 'totales del padre' do
    subject(:record) do
      record = build(:service_record)
      [
        { quantity: 2, unit_price: 10_000, iva_rate: 21 },
        { quantity: 1, unit_price: 4_000, iva_rate: 10.5 },
        { quantity: 1, unit_price: 1_000, iva_rate: 15 },
        { quantity: 1, unit_price: 15_000, iva_rate: nil }
      ].each { |attrs| record.items.build(attrs.merge(description: 'Ítem')) }
      record
    end

    it 'desglosa el IVA por alícuota, de mayor a menor' do
      expect(record.iva_breakdown).to eq([
        { rate: 21, base: 20_000, amount: 4_200 },
        { rate: 15, base: 1_000, amount: 150 },
        { rate: 10.5, base: 4_000, amount: 420 }
      ])
    end

    it 'calcula neto, IVA, sin IVA y total' do
      expect(record.items_net_total).to eq(25_000)
      expect(record.items_iva_total).to eq(4_770)
      expect(record.exempt_total).to eq(15_000)
      expect(record.items_grand_total).to eq(44_770)
    end

    it 'ignora los ítems marcados para borrar' do
      record.items.last.mark_for_destruction
      expect(record.exempt_total).to eq(0)
      expect(record.items_grand_total).to eq(29_770)
    end
  end
end
