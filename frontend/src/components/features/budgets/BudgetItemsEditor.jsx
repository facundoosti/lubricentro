import { useEffect, useRef } from 'react';
import { useFieldArray } from 'react-hook-form';
import { Plus } from 'lucide-react';
import BudgetItemRow from '@components/features/budgets/BudgetItemRow';
import { emptyItem } from '@utils/budget';

const HEADERS = [
  { label: 'Cant.', className: 'text-center' },
  { label: 'Artículo / descripción' },
  { label: 'Precio unit. s/IVA', className: 'text-right' },
  { label: 'IVA' },
  { label: 'Importe c/IVA', className: 'text-right' },
  { label: '' },
];

// Lista editable de ítems. `onRemoveSaved(id)` recibe los ids ya guardados que se
// quitan, para enviarlos con _destroy al backend.
const BudgetItemsEditor = ({ control, register, setValue, getValues, errors, onRemoveSaved }) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'items_attributes' });
  const descriptionRefs = useRef({});
  const focusIndexRef = useRef(null);

  useEffect(() => {
    if (focusIndexRef.current === null) return;
    const field = fields[focusIndexRef.current];
    focusIndexRef.current = null;
    if (field) descriptionRefs.current[field.id]?.focus();
  }, [fields]);

  const addItem = () => {
    focusIndexRef.current = fields.length;
    append(emptyItem(fields.length), { shouldFocus: false });
  };

  const handleRemove = (index) => {
    const savedId = getValues(`items_attributes.${index}.id`);
    if (savedId) onRemoveSaved?.(savedId);
    if (fields.length === 1) {
      remove(0);
      append(emptyItem(0), { shouldFocus: false });
      return;
    }
    remove(index);
  };

  // Enter en el precio: en la última línea agrega otra; si no, pasa a la siguiente.
  const handlePriceEnter = (index) => {
    if (index === fields.length - 1) {
      addItem();
    } else {
      descriptionRefs.current[fields[index + 1].id]?.focus();
    }
  };

  return (
    <section className="bg-surface-container border border-outline-variant rounded-lg p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
          Artículos <span className="text-secondary font-normal normal-case">({fields.length})</span>
        </h2>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-container/20 text-primary rounded-lg hover:bg-primary-container/30 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar ítem
        </button>
      </div>

      <div
        aria-hidden="true"
        className="hidden md:grid md:grid-cols-[4.5rem_minmax(0,1fr)_8rem_6.5rem_7rem_2.25rem] md:gap-2 pb-2 border-b border-outline-variant text-xs font-medium text-secondary"
      >
        {HEADERS.map((h, i) => (
          <span key={i} className={h.className}>{h.label}</span>
        ))}
      </div>

      <div className="space-y-3 md:space-y-0 md:divide-y md:divide-outline-variant">
        {fields.map((field, index) => (
          <BudgetItemRow
            key={field.id}
            index={index}
            control={control}
            register={register}
            setValue={setValue}
            errors={errors?.[index]}
            onRemove={handleRemove}
            onPriceEnter={handlePriceEnter}
            descriptionRef={(el) => { descriptionRefs.current[field.id] = el; }}
          />
        ))}
      </div>

      <p className="text-xs text-secondary">
        Tip: Enter en el precio de la última línea agrega otra. Los productos traen su IVA; los servicios van sin IVA.
      </p>
    </section>
  );
};

export default BudgetItemsEditor;
