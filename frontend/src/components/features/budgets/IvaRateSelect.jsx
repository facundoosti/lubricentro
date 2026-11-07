import { ITEM_IVA_OPTIONS, ivaRateToOption } from '@utils/iva';

// Alícuota de una línea del presupuesto: 21% · 10,5% · Sin IVA ('' = precio final).
const IvaRateSelect = ({ value, onChange, id, className = '' }) => (
  <select
    id={id}
    aria-label="IVA"
    value={ivaRateToOption(value)}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full px-2 py-1.5 bg-surface-variant border border-outline-variant rounded text-on-surface text-sm focus:outline-none focus:border-primary ${className}`}
  >
    {ITEM_IVA_OPTIONS.map((opt) => (
      <option key={opt.value || 'none'} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

export default IvaRateSelect;
