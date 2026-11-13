import { useEffect, useMemo, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Combobox as ComboboxRoot,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxSearch,
  ComboboxStatus,
  ComboboxTrigger,
} from '@/components/ui/primitives/combobox';

const SEARCH_DEBOUNCE_MS = 300;
const MAX_CHIPS = 2;

const sameValue = (a, b) => String(a?.value) === String(b?.value);

/**
 * Lista de selección con buscador (Combobox de Base UI), simple o múltiple.
 *
 * - Sin `onSearch` filtra las opciones localmente; con `onSearch` lo llama (debounce 300ms) con el texto
 *   y no filtra (filtra el backend). Al cerrar la lista vuelve a llamarlo con '' (solo si había una búsqueda aplicada).
 * - `multiple`: la selección se ve como chips (hasta 2; después "N seleccionados"), cada uno con su ✕.
 * - `clearable`: botón "Limpiar" → `onChange(null)` (simple) o `onChange([])` (múltiple).
 * - Dentro de un Dialog: la lista va por encima, acepta clicks y Escape cierra solo la lista.
 *
 * @param {{ value: string, label: string, depth?: number }[]} options - `depth` indenta (árbol de categorías)
 * @param {string|null|string[]} value - valor (simple) o valores (múltiple)
 * @param {(value: string|null|string[]) => void} onChange
 * @param {boolean} [multiple]
 * @param {(q: string) => void} [onSearch]
 * @param {boolean} [loading] - muestra "Cargando…"
 * @param {boolean} [clearable] - default true en simple, false en múltiple
 */
const Combobox = ({
  options = [],
  value,
  onChange,
  multiple = false,
  onSearch,
  loading = false,
  clearable,
  placeholder = 'Seleccionar...',
  disabled = false,
  error = false,
  id,
  'aria-labelledby': ariaLabelledBy,
  className,
}) => {
  const isClearable = clearable ?? !multiple;
  const debounceRef = useRef(null);
  const onSearchRef = useRef(onSearch);
  // Último texto enviado a onSearch: evita llamadas repetidas y el '' al cerrar si no hubo búsqueda.
  const sentQueryRef = useRef('');
  // Etiquetas ya vistas: con búsqueda remota el valor elegido puede no estar en las opciones actuales
  const labelsRef = useRef(new Map());

  useEffect(() => {
    onSearchRef.current = onSearch;
  });
  useEffect(() => {
    options.forEach((o) => labelsRef.current.set(String(o.value), o.label));
  }, [options]);
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const values = useMemo(() => (multiple ? (value ?? []).map(String) : []), [multiple, value]);
  // Referencia estable mientras no cambien valor u opciones (Base UI compara la selección por referencia).
  const selected = useMemo(() => {
    const toOption = (v) => {
      const match = options.find((o) => String(o.value) === String(v));
      return match ?? { value: String(v), label: labelsRef.current.get(String(v)) ?? String(v) };
    };
    if (multiple) return values.map(toOption);
    return value === null || value === undefined || value === '' ? null : toOption(value);
  }, [multiple, value, values, options]);
  const hasSelection = multiple ? values.length > 0 : selected !== null;

  const handleValueChange = (next) => {
    if (multiple) onChange?.((next ?? []).map((o) => String(o.value)));
    else onChange?.(next ? String(next.value) : null);
  };

  const handleInputValueChange = (q) => {
    if (!onSearchRef.current) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (q === sentQueryRef.current) return;
      sentQueryRef.current = q;
      onSearchRef.current?.(q);
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleOpenChange = (open) => {
    if (open || !onSearchRef.current) return;
    clearTimeout(debounceRef.current);
    if (sentQueryRef.current === '') return;
    sentQueryRef.current = '';
    onSearchRef.current('');
  };

  const clear = () => onChange?.(multiple ? [] : null);
  const removeValue = (v) => onChange?.(values.filter((item) => item !== v));

  // Los botones dentro del trigger (✕ de chip) no lo abren
  const stop = (e) => e.stopPropagation();
  // Enter/Espacio en la ✕ no llegan al trigger; Escape sí sigue (cierra el Dialog).
  const stopActivationKeys = (e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); };

  const triggerClass = cn(
    error && 'border-error',
    isClearable && hasSelection && 'pr-14',
  );

  const renderTriggerContent = () => {
    if (!hasSelection) return <span className="flex-1 truncate text-secondary">{placeholder}</span>;
    if (!multiple) return <span className="flex-1 truncate text-on-surface">{selected.label}</span>;
    if (values.length > MAX_CHIPS) {
      return (
        <span className="flex flex-1 items-center">
          <span className="rounded bg-primary-container/20 px-1.5 py-0.5 text-xs text-primary">{values.length} seleccionados</span>
        </span>
      );
    }
    return (
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
        {selected.map((opt) => (
          <span key={opt.value} className="flex shrink-0 items-center gap-0.5 rounded bg-primary-container/20 px-1.5 py-0.5 text-xs text-primary">
            <span className="max-w-[80px] truncate">{opt.label}</span>
            <button
              type="button"
              aria-label={`Quitar ${opt.label}`}
              onPointerDown={stop}
              onMouseDown={stop}
              onKeyDown={stopActivationKeys}
              onClick={(e) => { stop(e); removeValue(opt.value); }}
              className="shrink-0 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className={cn('relative', className)}>
      <ComboboxRoot
        items={options}
        value={selected}
        onValueChange={handleValueChange}
        onInputValueChange={handleInputValueChange}
        onOpenChange={handleOpenChange}
        isItemEqualToValue={sameValue}
        itemToStringLabel={(o) => o?.label ?? ''}
        itemToStringValue={(o) => String(o?.value ?? '')}
        filter={onSearch ? null : undefined}
        multiple={multiple}
        disabled={disabled}
      >
        <ComboboxTrigger
          id={id}
          aria-labelledby={ariaLabelledBy}
          aria-invalid={error || undefined}
          nativeButton={!multiple}
          render={multiple ? <div /> : undefined}
          className={triggerClass}
        >
          {renderTriggerContent()}
        </ComboboxTrigger>

        <ComboboxContent aria-labelledby={ariaLabelledBy} className={cn(multiple && 'min-w-[200px]')}>
          <ComboboxSearch placeholder="Buscar..." aria-label="Buscar" />
          {loading ? (
            <ComboboxStatus>Cargando…</ComboboxStatus>
          ) : (
            <>
              <ComboboxEmpty>Sin resultados</ComboboxEmpty>
              <ComboboxList className={cn(multiple && 'max-h-48')}>
                {(opt) => {
                  const depth = opt.depth ?? 0;
                  return (
                    <ComboboxItem
                      key={opt.value}
                      value={opt}
                      multiple={multiple}
                      title={opt.label}
                      style={{ paddingLeft: `${12 + depth * 14}px` }}
                      className={cn(depth === 0 ? 'text-on-surface' : 'text-on-surface-variant')}
                      leading={depth > 0 && (
                        <span data-slot="combobox-item-guide" className="h-3 w-px shrink-0 self-center bg-outline-variant" />
                      )}
                    >
                      <span className={cn('min-w-0 flex-1 truncate', depth === 0 && 'font-medium')}>{opt.label}</span>
                    </ComboboxItem>
                  );
                }}
              </ComboboxList>
            </>
          )}
          {multiple && hasSelection && (
            <div className="border-t border-outline-variant p-2">
              <button
                type="button"
                onClick={clear}
                className="w-full py-1 text-center text-xs text-secondary hover:text-on-surface"
              >
                Limpiar selección
              </button>
            </div>
          )}
        </ComboboxContent>
      </ComboboxRoot>

      {isClearable && hasSelection && !disabled && (
        <button
          type="button"
          aria-label="Limpiar"
          onClick={clear}
          className="absolute top-1/2 right-8 -translate-y-1/2 rounded p-0.5 text-secondary hover:text-on-surface"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default Combobox;
