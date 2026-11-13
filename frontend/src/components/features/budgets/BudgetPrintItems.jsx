import { formatCurrency } from '@utils/money';
import { lineGrossTotal, unitFinalPrice } from '@utils/budgetMath';

const MIN_ROWS = 12;
const cell = { border: '1px solid #ccc', padding: '3px 6px' };
const head = { border: '1px solid #999', padding: '4px 6px' };
// Nombres de producto largos (hasta 500 caracteres): máximo 2 líneas para que el presupuesto siga entrando en una hoja.
const clamp2 = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'break-word' };

// Tabla de ítems de la hoja impresa: precio unitario e importe finales (neto × (1 + IVA% + ganancia%)).
// Sin columna de alícuota: la hoja es para el cliente y no muestra neto, base ni ganancia.
const BudgetPrintItems = ({ items = [] }) => {
  const padded = [...items, ...Array.from({ length: Math.max(0, MIN_ROWS - items.length) }, () => null)];
  const blank = (item) => ({ color: item ? '#000' : 'transparent' });

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
      <thead>
        <tr style={{ backgroundColor: '#cc2200', color: '#fff' }}>
          <th style={{ ...head, textAlign: 'center', width: '40px' }}>CANT</th>
          <th style={{ ...head, textAlign: 'left' }}>ARTÍCULO</th>
          <th style={{ ...head, textAlign: 'right', width: '80px' }}>P. UNIT.</th>
          <th style={{ ...head, textAlign: 'right', width: '90px' }}>IMPORTE</th>
        </tr>
      </thead>
      <tbody>
        {padded.map((item, idx) => (
          <tr key={idx} style={{ height: '22px' }}>
            <td style={{ ...cell, textAlign: 'center', ...blank(item) }}>{item ? Number(item.quantity) : '.'}</td>
            <td style={{ ...cell, padding: '3px 8px', ...blank(item) }}>
              {item ? <span style={clamp2}>{item.description}</span> : '.'}
            </td>
            <td style={{ ...cell, textAlign: 'right', ...blank(item) }}>{item ? formatCurrency(unitFinalPrice(item)) : '.'}</td>
            <td style={{ ...cell, padding: '3px 8px', textAlign: 'right', fontWeight: item ? 600 : 'normal', ...blank(item) }}>
              {item ? formatCurrency(lineGrossTotal(item)) : '.'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default BudgetPrintItems;
