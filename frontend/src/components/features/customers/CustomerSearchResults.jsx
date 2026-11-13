import React from 'react';
import { createPortal } from 'react-dom';
import { UserPlus } from 'lucide-react';

/**
 * CustomerSearchResults - Lista flotante de resultados de CustomerSearchInput.
 * Se renderiza en un portal (con position fixed) para que el overflow del diálogo contenedor no la recorte:
 * dentro de un diálogo va al panel del diálogo (`container`), así sigue interactiva; fuera, al body.
 * "+ Crear cliente" (si canCreate) es la última opción, con índice customers.length.
 */
const CustomerSearchResults = ({
  container,
  listRef,
  style,
  isLoading,
  customers,
  highlightedIndex,
  onHighlight,
  onSelect,
  hasSearchTerm,
  canCreate,
  searchText,
  onCreateNew,
}) => createPortal(
  <div
    ref={listRef}
    style={style}
    data-testid="customer-search-results"
    className="bg-surface-container border border-outline-variant rounded-lg shadow-lg max-h-60 overflow-auto"
  >
    {isLoading ? (
      <div className="px-4 py-2 text-sm text-on-surface-variant">Buscando...</div>
    ) : customers.length > 0 ? (
      <div>
        {customers.map((customer, index) => (
          <button
            key={customer.id}
            type="button"
            onClick={() => onSelect(customer)}
            className={`w-full px-4 py-2 text-left focus:outline-none transition-colors ${
              index === highlightedIndex
                ? 'bg-primary/10 text-on-surface'
                : 'hover:bg-surface-container-high focus:bg-surface-container-high'
            }`}
            onMouseEnter={() => onHighlight(index)}
          >
            <div className="font-medium text-on-surface">{customer.name}</div>
            <div className="text-sm text-on-surface-variant">{customer.email || customer.phone || 'Sin contacto'}</div>
          </button>
        ))}
      </div>
    ) : (
      <div className="px-4 py-2 text-sm text-on-surface-variant">
        {hasSearchTerm ? 'No se encontraron clientes' : 'Escribe para buscar'}
      </div>
    )}
    {canCreate && (
      <button
        type="button"
        onClick={onCreateNew}
        onMouseEnter={() => onHighlight(customers.length)}
        className={`flex w-full items-center gap-2 border-t border-outline-variant px-4 py-2.5 text-left text-sm font-medium text-primary ${
          highlightedIndex === customers.length ? 'bg-primary/10' : 'hover:bg-surface-container-high'
        }`}
      >
        <UserPlus className="h-4 w-4 shrink-0" />
        <span className="truncate">+ Crear cliente "{searchText}"</span>
      </button>
    )}
  </div>,
  container ?? document.body,
);

export default CustomerSearchResults;
