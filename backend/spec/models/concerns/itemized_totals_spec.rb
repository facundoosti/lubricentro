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

    it 'acepta 21, 10,5 o vacío como alícuota' do
      [ 21, 10.5, '10.5', nil, '' ].each do |rate|
        expect(build(:service_record_item, iva_rate: rate)).to be_valid, "#{rate.inspect} debería ser válido"
      end
    end

    it 'rechaza cualquier otra alícuota nueva' do
      [ 15, 0, 100, -1, 'abc' ].each do |rate|
        item = build(:service_record_item, iva_rate: rate)
        expect(item).not_to be_valid, "#{rate.inspect} debería ser inválido"
        expect(item.errors[:iva_rate]).to be_present
      end
    end

    it 'rechaza cambiar la alícuota de un ítem guardado a un % fuera de la lista' do
      item = create(:service_record_item, iva_rate: 21)
      item.iva_rate = 15
      expect(item).not_to be_valid
    end

    context 'con un ítem viejo guardado con % libre' do
      let(:item) do
        create(:service_record_item, iva_rate: 21).tap { |i| i.update_column(:iva_rate, 15) }.reload
      end

      it 'se vuelve a guardar sin tocar la alícuota' do
        expect(item.update(quantity: 3)).to be(true)
        expect(item.reload.iva_rate).to eq(15)
      end
    end

    describe 'ganancia' do
      it 'arranca en 0' do
        expect(ServiceRecordItem.new.margin_percentage).to eq(0)
      end

      it 'acepta de 0 a 999,99' do
        [ 0, 30, 12.5, 999.99 ].each do |margin|
          expect(build(:service_record_item, margin_percentage: margin)).to be_valid
        end
      end

      it 'rechaza negativos, 1000 o más y no numéricos' do
        [ -5, 1000, 'abc' ].each do |margin|
          item = build(:service_record_item, margin_percentage: margin)
          expect(item).not_to be_valid, "#{margin.inspect} debería ser inválido"
          expect(item.errors[:margin_percentage]).to be_present
        end
      end

      it 'toma vacío o nil como 0' do
        [ nil, '' ].each do |margin|
          item = build(:service_record_item, margin_percentage: margin)
          expect(item).to be_valid, "#{margin.inspect} debería ser válido"
          expect(item.margin_percentage).to eq(0)
        end
      end

      it 'calcula la ganancia de la línea sobre el neto, redondeada a 2 decimales' do
        expect(build(:service_record_item, quantity: 2, unit_price: 500, margin_percentage: 20).line_margin).to eq(200)
        expect(build(:service_record_item, quantity: 1, unit_price: 10.01, margin_percentage: 33.33).line_margin)
          .to eq(BigDecimal('3.34'))
      end

      it 'no cambia el total guardado de la línea (sigue siendo el neto)' do
        item = create(:service_record_item, quantity: 1, unit_price: 1000, margin_percentage: 30)
        expect(item.reload.total).to eq(1000)
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

    it 'sin ganancia cargada, margin_total es 0' do
      expect(record.margin_total).to eq(0)
    end

    it 'suma la ganancia de todos los ítems (con y sin IVA) al total' do
      record.items.first.margin_percentage = 10   # 20.000 al 21% → 2.000
      record.items.last.margin_percentage = 12.5  # 15.000 sin IVA → 1.875
      expect(record.margin_total).to eq(3_875)
      expect(record.items_iva_total).to eq(4_770)
      expect(record.items_grand_total).to eq(48_645)
    end

    it 'ignora los ítems marcados para borrar' do
      record.items.last.mark_for_destruction
      expect(record.exempt_total).to eq(0)
      expect(record.items_grand_total).to eq(29_770)
    end
  end
end
