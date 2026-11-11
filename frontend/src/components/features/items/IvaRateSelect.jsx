import { useRef } from 'react';
import { ITEM_IVA_OPTIONS, itemIvaOptions, ivaRateToOption } from '@utils/iva';

const isStandard = (option) => ITEM_IVA_OPTIONS.some((opt) => opt.value === option);

/**
 * IvaRateSelect — alícuota de una línea (presupuesto y atención): 21% · 10,5% · Sin IVA
 * ('' = precio final). Si la línea tiene guardado otro % (del % libre anterior), lo muestra
 * como "15% (anterior)" y lo conserva como opción aunque el usuario cambie a otra.
 *
 * @param {string|number|null} value - Alícuota actual ("21", 10.5, "15.0", "" o null)
 * @param {Function} onChange - Recibe el valor de la opción ("21" | "10.5" | "" | "15")
 */
const IvaRateSelect = ({ id, value, onChange, className = '', 'aria-label': ariaLabel = '% IVA' }) => {
  const current = ivaRateToOption(value);
  // Último % no estándar visto (al montar o al llegar después, ej. por un reset del form):
  // queda como opción "(anterior)" aunque se elija otra alícuota.
  const legacy = useRef(null);
  if (!isStandard(current)) legacy.current = current;
  const options = itemIvaOptions(legacy.current ?? current);

  return (
    <select
      id={id}
      aria-label={ariaLabel}
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-2 py-1.5 bg-surface-variant border border-outline-variant rounded text-on-surface text-sm focus:outline-none focus:border-primary ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value || 'none'} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
};

export default IvaRateSelect;
