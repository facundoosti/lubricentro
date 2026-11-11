import { useEffect, useRef } from 'react';
import { useFieldArray } from 'react-hook-form';
import { Plus } from 'lucide-react';
import ItemRow from '@components/features/items/ItemRow';
import { emptyItem } from '@utils/items';

const HEADERS = [
  { label: 'Cant.', className: 'text-center' },
  { label: 'Producto / servicio' },
  { label: 'Precio unit. s/IVA', className: 'text-right' },
  { label: '% IVA', className: 'text-right' },
  { label: 'Importe c/IVA', className: 'text-right' },
  { label: '' },
];

/**
 * ItemsEditor — sección "Productos y Servicios" (presupuesto y atención).
 *
 * @param {string} [name='items_attributes'] - Nombre del field array en el form
 * @param {Function} onRemoveSaved - Recibe los ids ya guardados que se quitan (para enviarlos con _destroy)
 * @param {React.ReactNode} [headerAction] - Acción extra en la cabecera de la sección
 * @param {React.ReactNode} [children] - Contenido bajo la cabecera (ej. un aviso o chip)
 */
const ItemsEditor = ({
  name = 'items_attributes',
  control,
  register,
  setValue,
  getValues,
  errors,
  onRemoveSaved,
  headerAction,
  children,
}) => {
  const { fields, append, remove } = useFieldArray({ control, name });
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
    const savedId = getValues(`${name}.${index}.id`);
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
          Productos y Servicios <span className="text-secondary font-normal normal-case">({fields.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          {headerAction}
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-container/20 text-primary rounded-lg hover:bg-primary-container/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar ítem
          </button>
        </div>
      </div>

      {children}

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
          <ItemRow
            key={field.id}
            name={name}
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
        Dejá el % vacío (o en 0) para cargar una línea sin IVA.
      </p>
    </section>
  );
};

export default ItemsEditor;
