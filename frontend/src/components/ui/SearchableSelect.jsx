import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';

/**
 * SearchableSelect — dropdown con buscador integrado.
 * Usa createPortal para no verse clipado por overflow del padre.
 * Compatible con react-hook-form via Controller.
 *
 * Props:
 *   options     — [{ value, label }]
 *   value       — valor seleccionado actualmente
 *   onChange    — callback(value)
 *   placeholder — texto cuando no hay selección
 *   disabled    — boolean
 */
const SearchableSelect = ({ options = [], value, onChange, placeholder = 'Seleccionar...', disabled = false }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Calcular posición del dropdown relativa al trigger
  const calcDropdownStyle = () => {
    if (!triggerRef.current) return {};
    const rect = triggerRef.current.getBoundingClientRect();
    return {
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    };
  };

  const handleOpen = () => {
    if (disabled) return;
    setDropdownStyle(calcDropdownStyle());
    setIsOpen(true);
    setSearch('');
  };

  // Cerrar al hacer click fuera o al scrollear
  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => setIsOpen(false);

    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSelect = (opt) => {
    onChange(opt.value);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  const baseClass =
    'w-full flex items-center gap-2 px-3 py-2 bg-surface-variant border border-outline-variant rounded-lg text-sm transition-colors focus:outline-none focus:border-primary';

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`${baseClass} justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-outline cursor-pointer'} ${isOpen ? 'border-primary' : ''}`}
      >
        <span className={selected ? 'text-on-surface truncate' : 'text-secondary'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {selected && (
            <span
              role="button"
              tabIndex={-1}
              onMouseDown={(e) => { e.preventDefault(); handleClear(e); }}
              className="p-0.5 rounded hover:bg-surface-container-high text-secondary hover:text-on-surface"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {/* Dropdown — renderizado fuera del árbol via portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-surface-container border border-outline-variant rounded-lg shadow-xl overflow-hidden"
        >
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-outline-variant">
            <Search className="w-3.5 h-3.5 text-secondary shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-secondary focus:outline-none"
            />
          </div>

          {/* Options */}
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-secondary">Sin resultados</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-surface-container-high ${
                      String(opt.value) === String(value) ? 'text-primary font-medium' : 'text-on-surface'
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>,
        document.body
      )}
    </>
  );
};

export default SearchableSelect;
