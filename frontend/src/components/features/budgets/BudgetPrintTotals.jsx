import { formatCurrency } from '@utils/money';
import { formatIvaRate } from '@utils/iva';

const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };

const Line = ({ label, value, testId }) => (
  <div style={{ ...row, fontSize: '11px', color: '#333' }}>
    <span>{label}</span>
    <span data-testid={testId}>{formatCurrency(value)}</span>
  </div>
);

// Pie de la hoja impresa: IVA por alícuota (sin base, solo si hay IVA) y los dos totales que calcula
// el backend. No muestra neto, subtotales, importe sin IVA ni ganancia (la ganancia es interna).
const BudgetPrintTotals = ({ budget }) => {
  const breakdown = (budget.iva_breakdown || []).filter((r) => Number(r.amount) > 0);
  const hasIva = Number(budget.total_iva) > 0 && breakdown.length > 0;

  return (
    <div
      style={{ border: '1px solid #ccc', borderTop: 'none', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}
    >
      {hasIva && (
        <div data-testid="print-iva-breakdown" style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '4px', borderBottom: '1px dashed #ccc' }}>
          {breakdown.map((r) => (
            <Line key={r.rate} label={`IVA ${formatIvaRate(r.rate)}`} value={r.amount} testId={`print-iva-${Number(r.rate)}`} />
          ))}
        </div>
      )}

      <div style={row}>
        <div style={{ fontSize: '11px' }}>
          <span style={{ backgroundColor: '#ffe066', padding: '1px 4px', fontWeight: 'bold' }}>EFECTIVO / DÉBITO</span>
          <strong> TOTAL $</strong>
        </div>
        <div style={{ fontSize: '14px', fontWeight: 900 }} data-testid="print-total-list">{formatCurrency(budget.total_list)}</div>
      </div>
      <div style={row}>
        <div style={{ fontSize: '11px' }}>
          <strong>TARJETA DE CRÉDITO TOTAL $</strong>
        </div>
        <div style={{ fontSize: '14px', fontWeight: 900 }} data-testid="print-total-card">{formatCurrency(budget.total_card)}</div>
      </div>

      {budget.notes && (
        <div style={{ marginTop: '4px', fontSize: '10px', color: '#444', fontStyle: 'italic' }}>{budget.notes}</div>
      )}
    </div>
  );
};

export default BudgetPrintTotals;
