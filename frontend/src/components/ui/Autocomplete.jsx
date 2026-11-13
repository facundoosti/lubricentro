import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Autocomplete as AutocompleteRoot,
  AutocompleteClear,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteInputGroup,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteStatus,
  AutocompleteTrigger,
} from '@/components/ui/primitives/autocomplete';

const SEARCH_DEBOUNCE_MS = 300;
const ACTION_ITEM = { __action: true };

/**
 * Campo de texto con sugerencias (Autocomplete de Base UI) y búsqueda remota.
 *
 * - Controlado por texto: `value` + `onValueChange(text)` (solo al tipear; elegir un ítem no lo llama).
 * - `onSearch(q)`: se llama con debounce de 300 ms al tipear (no filtra localmente: filtra el backend).
 * - `onItemSelect(item)`: al elegir un ítem con el mouse o con ↑/↓ + Enter.
 * - `action = { label, icon, onSelect }`: ítem final navegable (p. ej. "+ Crear cliente").
 * - `clearable` + `onClear`: botón ✕ (`clearLabel`) cuando hay texto.
 * - Dentro de un Dialog la lista va a su panel; Escape cierra solo la lista.
 *
 * @param {any[]} items - resultados actuales
 * @param {(item) => string|number} getItemKey
 * @param {(item) => string} itemToString - texto del ítem (accesible)
 * @param {(item) => React.ReactNode} renderItem
 * @param {boolean} [loading] - "Buscando..."
 * @param {string} [emptyText] - sin resultados (después de buscar)
 * @param {string} [idleText] - sin texto buscado (p. ej. "Escribe para buscar")
 * @param {React.ReactNode} [leading] - ícono a la izquierda del input (posicionado por el consumidor)
 * @param {boolean} [showTrigger] - botón ▾ para abrir/cerrar la lista
 */
const Autocomplete = ({
  value = '',
  onValueChange,
  items = [],
  getItemKey = (item) => item.id,
  itemToString = (item) => String(item?.label ?? ''),
  renderItem,
  onItemSelect,
  onSearch,
  loading = false,
  emptyText = 'Sin resultados',
  idleText = null,
  action = null,
  clearable = true,
  onClear,
  clearLabel = 'Limpiar',
  showTrigger = false,
  triggerLabel = 'Mostrar/ocultar opciones',
  openOnInputClick = false,
  error = false,
  disabled = false,
  placeholder,
  leading,
  inputClassName,
  contentClassName,
  itemClassName,
  statusClassName,
  className,
  ...inputProps
}) => {
  const debounceRef = useRef(null);
  const onSearchRef = useRef(onSearch);
  // Último texto enviado a onSearch: distingue "sin resultados" de "todavía no se buscó"
  const [searchedQuery, setSearchedQuery] = useState('');

  useEffect(() => {
    onSearchRef.current = onSearch;
  });
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const handleValueChange = (text, details) => {
    // Escape con la lista cerrada: Base UI vacía el texto; acá no borra nada (el input sigue controlado por `value`).
    // El ✕ lo resuelve handleClear.
    if (details?.reason === 'escape-key' || details?.reason === 'clear-press') return;
    // Elegir un ítem llena el input con su texto (lo maneja onItemSelect, sin buscar de nuevo)
    if (details?.reason === 'item-press') {
      clearTimeout(debounceRef.current);
      setSearchedQuery('');
      return;
    }
    onValueChange?.(text);
    if (!text.trim()) setSearchedQuery('');
    if (!onSearchRef.current) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchedQuery(text.trim());
      onSearchRef.current?.(text.trim());
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleClear = () => {
    clearTimeout(debounceRef.current);
    setSearchedQuery('');
    if (onClear) onClear();
    else onValueChange?.('');
  };

  const toString = (item) => (item === ACTION_ITEM ? action?.label ?? '' : itemToString(item));

  let statusText = null;
  if (loading) statusText = 'Buscando...';
  else if (items.length === 0) statusText = searchedQuery && value.trim() ? emptyText : idleText;
  const hasContent = Boolean(statusText || items.length > 0 || action);
  const ActionIcon = action?.icon;

  return (
    <div className={cn('relative', className)}>
      <AutocompleteRoot
        value={value}
        onValueChange={handleValueChange}
        itemToStringValue={toString}
        filter={null}
        openOnInputClick={openOnInputClick}
        disabled={disabled}
      >
        <AutocompleteInputGroup className="relative">
          {leading}
          <AutocompleteInput
            {...inputProps}
            placeholder={placeholder}
            aria-invalid={error || inputProps['aria-invalid'] || undefined}
            className={cn(error && 'border-error', inputClassName)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            {/* AutocompleteClear: tabIndex -1 (no queda enfocable mientras Base UI lo marca aria-hidden) */}
            {clearable && value && (
              <AutocompleteClear
                onClick={handleClear}
                disabled={disabled}
                aria-label={clearLabel}
                className="mr-1 p-1 text-secondary hover:text-on-surface-variant"
              >
                <X className="h-4 w-4" />
              </AutocompleteClear>
            )}
            {showTrigger && (
              <AutocompleteTrigger
                aria-label={triggerLabel}
                className="group mr-2 p-1 text-secondary hover:text-on-surface-variant"
              >
                <ChevronDown className="h-4 w-4 transition-transform group-data-popup-open:rotate-180" />
              </AutocompleteTrigger>
            )}
          </div>
        </AutocompleteInputGroup>

        {hasContent && (
          <AutocompleteContent className={contentClassName}>
            {statusText && <AutocompleteStatus className={cn('px-4 py-2', statusClassName)}>{statusText}</AutocompleteStatus>}
            <AutocompleteList>
              {!loading && items.map((item) => (
                <AutocompleteItem
                  key={getItemKey(item)}
                  value={item}
                  onClick={() => onItemSelect?.(item)}
                  className={itemClassName}
                >
                  {renderItem ? renderItem(item) : itemToString(item)}
                </AutocompleteItem>
              ))}
              {action && (
                <AutocompleteItem
                  value={ACTION_ITEM}
                  onClick={() => action.onSelect?.()}
                  className="flex items-center gap-2 border-t border-outline-variant px-4 py-2.5 text-sm font-medium text-primary"
                >
                  {ActionIcon && <ActionIcon className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{action.label}</span>
                </AutocompleteItem>
              )}
            </AutocompleteList>
          </AutocompleteContent>
        )}
      </AutocompleteRoot>
    </div>
  );
};

export default Autocomplete;
