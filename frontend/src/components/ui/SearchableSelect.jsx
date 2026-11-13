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
 *   searchable  — muestra el buscador (default true; false para listas cortas)
 *   clearable   — muestra la X para limpiar (default true; false si el campo no admite vacío)
 *   className   — clases extra para el trigger
 *   error       — boolean, marca el borde en rojo
 *   id / aria-labelledby — para asociar el trigger con su <label>
 */
const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
  searchable = true,
  clearable = true,
  className = '',
  error = false,
  id,
  'aria-labelledby': ariaLabelledBy,
}) => {
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
    // Solo el scroll de la página cierra; el de la propia lista no
    const handleScroll = (e) => {
      if (dropdownRef.current?.contains(e.target)) return;
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  // Al abrir: foco en el buscador, o (sin buscador) en la opción elegida / la primera
  useEffect(() => {
    if (!isOpen) return;
    if (searchable) {
      inputRef.current?.focus();
      return;
    }
    const opts = dropdownRef.current?.querySelectorAll('[role="option"]') || [];
    const current = Array.from(opts).find((el) => el.getAttribute('aria-selected') === 'true');
    (current || opts[0])?.focus();
  }, [isOpen, searchable]);

  const handleSelect = (opt) => {
    onChange(opt.value);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  // Escape con la lista abierta cierra solo la lista (el diálogo contenedor lo ignora)
  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }
    // Tab con la lista abierta: se cierra y el foco sigue desde el trigger
    if (e.key === 'Tab') {
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const opts = Array.from(dropdownRef.current?.querySelectorAll('[role="option"]') || []);
      if (opts.length === 0) return;
      e.preventDefault();
      const idx = opts.indexOf(document.activeElement);
      const next = e.key === 'ArrowDown'
        ? (idx + 1) % opts.length
        : (idx <= 0 ? opts.length - 1 : idx - 1);
      opts[next].focus();
    }
  };

  const baseClass =
    `w-full flex items-center gap-2 px-3 py-2 bg-surface-variant border rounded-lg text-sm transition-colors focus:outline-none focus:border-primary ${
      error ? 'border-error' : 'border-outline-variant'
    }`;

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-labelledby={ariaLabelledBy}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`${baseClass} justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-outline cursor-pointer'} ${isOpen && !error ? 'border-primary' : ''} ${className}`}
      >
        <span className={selected ? 'text-on-surface truncate' : 'text-secondary'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {selected && clearable && (
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
          onKeyDown={handleKeyDown}
          className="bg-surface-container border border-outline-variant rounded-lg shadow-xl overflow-hidden"
        >
          {/* Search input */}
          {searchable && (
            <div className="flex items-center gap-2 px-3 py-2 border-b border-outline-variant">
              <Search className="w-3.5 h-3.5 text-secondary shrink-0" />
              <input
                autoComplete="off"
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-secondary focus:outline-none"
              />
            </div>
          )}

          {/* Options */}
          <ul role="listbox" aria-labelledby={ariaLabelledBy} className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-secondary">Sin resultados</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={String(opt.value) === String(value)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(opt)}
                    title={opt.label}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-surface-container-high focus:bg-surface-container-high focus:outline-none ${
                      String(opt.value) === String(value) ? 'text-primary font-medium' : 'text-on-surface'
                    }`}
                  >
                    <span className="line-clamp-2 break-words">{opt.label}</span>
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
