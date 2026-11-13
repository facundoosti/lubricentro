import { formatCurrency } from '@utils/money';
import { lineGrossTotal } from '@utils/budgetMath';
import { BRAND, GRAY } from '@components/features/budgets/printTheme';

const MIN_ROWS = 12;
const cell = { backgroundColor: 'rgba(255,255,255,0.92)', padding: '4px 8px', height: '16px' };
const head = { backgroundColor: BRAND, color: '#fff', padding: '5px 8px' };
// Nombres de producto largos (hasta 500 caracteres): máximo 2 líneas para que el presupuesto siga entrando en una hoja.
const clamp2 = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'break-word' };
const code = { color: GRAY.muted, fontSize: '9px', fontFamily: 'monospace', marginRight: '6px' };

// Tabla de ítems de la hoja impresa: solo el importe final de la línea (neto × (1 + IVA% + ganancia%)) y,
// si el ítem salió del catálogo, su código. Sin precio unitario, alícuota, neto ni ganancia.
const BudgetPrintItems = ({ items = [] }) => {
  const padded = [...items, ...Array.from({ length: Math.max(0, MIN_ROWS - items.length) }, () => null)];
  const blank = (item) => ({ color: item ? '#000' : 'transparent' });

  return (
    <div style={{ position: 'relative', backgroundColor: GRAY.table, borderRadius: '10px', padding: '6px' }}>
      <div
        data-testid="print-watermark"
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}
      >
        <img src="/logo.webp" alt="" crossOrigin="anonymous" style={{ width: '60%', opacity: 0.07 }} />
      </div>
      <table style={{ position: 'relative', width: '100%', borderCollapse: 'separate', borderSpacing: '0 3px', fontSize: '11px' }}>
        <thead>
          <tr>
            <th style={{ ...head, textAlign: 'center', width: '40px', borderRadius: '6px 0 0 6px' }}>CANT</th>
            <th style={{ ...head, textAlign: 'left' }}>ARTÍCULO</th>
            <th style={{ ...head, textAlign: 'right', width: '90px', borderRadius: '0 6px 6px 0' }}>IMPORTE</th>
          </tr>
        </thead>
        <tbody>
          {padded.map((item, idx) => (
            <tr key={item?.id ?? `blank-${idx}`}>
              <td style={{ ...cell, textAlign: 'center', borderRadius: '4px 0 0 4px', ...blank(item) }}>
                {item ? Number(item.quantity) : '.'}
              </td>
              <td style={{ ...cell, ...blank(item) }}>
                {item ? (
                  <span style={clamp2}>
                    {item.product_code && <span data-testid="print-product-code" style={code}>{item.product_code}</span>}
                    {item.description}
                  </span>
                ) : '.'}
              </td>
              <td style={{ ...cell, textAlign: 'right', fontWeight: item ? 600 : 'normal', borderRadius: '0 4px 4px 0', ...blank(item) }}>
                {item ? formatCurrency(lineGrossTotal(item)) : '.'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BudgetPrintItems;
