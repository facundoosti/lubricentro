import { useRef } from 'react';
import Select from '@ui/Select';
import { ITEM_IVA_OPTIONS, itemIvaOptions, ivaRateToOption } from '@utils/iva';

const isStandard = (option) => ITEM_IVA_OPTIONS.some((opt) => opt.value === option);

// "Sin IVA" es '' en el formulario; en la lista usa un valor propio (el Select trata '' como "sin elegir").
const NONE = 'none';
const toSelect = (option) => (option === '' ? NONE : option);
const fromSelect = (value) => (value === NONE ? '' : value);

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
  const options = itemIvaOptions(legacy.current ?? current).map((opt) => ({ ...opt, value: toSelect(opt.value) }));

  return (
    <Select
      id={id}
      aria-label={ariaLabel}
      options={options}
      value={toSelect(current)}
      onChange={(next) => onChange(fromSelect(next))}
      className={`rounded px-2 py-1.5 ${className}`}
    />
  );
};

export default IvaRateSelect;
