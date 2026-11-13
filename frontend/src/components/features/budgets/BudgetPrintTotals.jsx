import { formatCurrency } from '@utils/money';
import { formatIvaRate } from '@utils/iva';
import { BRAND, HIGHLIGHT, GRAY } from '@components/features/budgets/printTheme';

const MAX_INSTALLMENT_ROWS = 3;
const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 10px' };
const divider = { borderTop: '1px solid #eeeeee' };
const label = { backgroundColor: HIGHLIGHT, padding: '1px 5px', fontWeight: 'bold', fontSize: '10px' };
const amount = { fontSize: '15px', fontWeight: 900 };

// Totales de la hoja impresa en un recuadro a la derecha: IVA por alícuota (sin base, solo si hay IVA), los dos
// totales que calcula el backend, hasta 3 planes de cuotas y la leyenda de no comprobante. No muestra neto ni ganancia.
const BudgetPrintTotals = ({ budget }) => {
  const breakdown = (budget.iva_breakdown || []).filter((r) => Number(r.amount) > 0);
  const hasIva = Number(budget.total_iva) > 0 && breakdown.length > 0;
  const installments = (budget.installment_options || []).slice(0, MAX_INSTALLMENT_ROWS);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        <div data-testid="print-totals-box" style={{ width: '330px', border: `2px solid ${BRAND}`, borderRadius: '8px', overflow: 'hidden' }}>
          {hasIva && (
            <div data-testid="print-iva-breakdown" style={{ padding: '4px 10px', fontSize: '11px', color: GRAY.text }}>
              {breakdown.map((r) => (
                <div key={r.rate} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{`IVA ${formatIvaRate(r.rate)}`}</span>
                  <span data-testid={`print-iva-${Number(r.rate)}`}>{formatCurrency(r.amount)}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ ...row, ...(hasIva ? divider : {}) }}>
            <span style={label}>PRECIO D/LISTA – EFT/DEB</span>
            <span style={amount} data-testid="print-total-list">{formatCurrency(budget.total_list)}</span>
          </div>
          <div style={{ ...row, ...divider }}>
            <span style={label}>TARJETA D/CRED</span>
            <span style={amount} data-testid="print-total-card">{formatCurrency(budget.total_card)}</span>
          </div>
          {installments.map((opt, index) => (
            <div
              key={opt.id ?? index}
              data-testid="print-installment"
              style={{ ...row, ...divider, backgroundColor: '#fafafa', fontSize: '10px', color: GRAY.text }}
            >
              <span>{`${opt.name} ${opt.installments} cuotas de`}</span>
              <span style={{ fontSize: '11px', fontWeight: 700 }}>{formatCurrency(opt.installment_amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {budget.notes && (
        <div style={{ marginTop: '6px', fontSize: '10px', color: '#444', fontStyle: 'italic' }}>{budget.notes}</div>
      )}

      <div
        data-testid="print-legend"
        style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', border: '1px dashed #999', borderRadius: '6px', padding: '4px' }}
      >
        NO VÁLIDO COMO COMPROBANTE DE FACTURACIÓN
      </div>
    </>
  );
};

export default BudgetPrintTotals;
