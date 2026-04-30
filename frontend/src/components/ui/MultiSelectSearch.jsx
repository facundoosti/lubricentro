import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, X, Search, Check } from "lucide-react";

/**
 * Multi-select dropdown with debounced search.
 *
 * Props:
 *   options       [{ value: string, label: string, depth?: number }]
 *   value         string[]  — selected values
 *   onChange      (values: string[]) => void
 *   onSearch      (q: string) => void — called after 300ms debounce
 *   placeholder   string
 *   loading       boolean
 *   className     string
 */

const SCROLL_KEYFRAMES = `
  @keyframes mss-scroll {
    0%   { transform: translateX(0); }
    15%  { transform: translateX(0); }
    85%  { transform: translateX(var(--mss-offset, 0px)); }
    100% { transform: translateX(var(--mss-offset, 0px)); }
  }
  .mss-scrolling {
    animation: mss-scroll 3s ease-in-out forwards;
    will-change: transform;
  }
`;

const useScrollKeyframes = () => {
  useEffect(() => {
    if (document.getElementById("mss-keyframes")) return;
    const el = document.createElement("style");
    el.id = "mss-keyframes";
    el.textContent = SCROLL_KEYFRAMES;
    document.head.appendChild(el);
  }, []);
};

const OptionLabel = ({ label }) => {
  const spanRef = useRef(null);

  const handleMouseEnter = () => {
    const el = spanRef.current;
    if (!el) return;
    const overflow = el.scrollWidth - el.clientWidth;
    if (overflow <= 2) return;
    el.style.setProperty("--mss-offset", `-${overflow}px`);
    el.classList.remove("mss-scrolling");
    // Force reflow to restart animation
    void el.offsetWidth;
    el.classList.add("mss-scrolling");
  };

  const handleMouseLeave = () => {
    const el = spanRef.current;
    if (!el) return;
    el.classList.remove("mss-scrolling");
    el.style.removeProperty("--mss-offset");
  };

  return (
    <span
      className="overflow-hidden flex-1 min-w-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        ref={spanRef}
        className="inline-block whitespace-nowrap"
      >
        {label}
      </span>
    </span>
  );
};

const MultiSelectSearch = ({
  options = [],
  value = [],
  onChange,
  onSearch,
  placeholder = "Seleccionar...",
  loading = false,
  className = "",
}) => {
  useScrollKeyframes();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset search when closed
  useEffect(() => {
    if (!isOpen) {
      setInputValue("");
      onSearch?.("");
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = useCallback(
    (e) => {
      const q = e.target.value;
      setInputValue(q);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearch?.(q), 300);
    },
    [onSearch]
  );

  const toggle = (optionValue) => {
    const next = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange?.(next);
  };

  const removeValue = (e, v) => {
    e.stopPropagation();
    onChange?.(value.filter((item) => item !== v));
  };

  const getLabelForValue = (v) =>
    options.find((o) => String(o.value) === String(v))?.label ?? v;

  const hasSelection = value.length > 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-sm bg-surface-variant border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent text-left min-h-[36px]"
      >
        <span className="flex-1 flex items-center gap-1 flex-wrap min-w-0">
          {!hasSelection && (
            <span className="text-secondary truncate">{placeholder}</span>
          )}
          {hasSelection && value.length <= 2 &&
            value.map((v) => (
              <span
                key={v}
                className="flex items-center gap-0.5 px-1.5 py-0.5 bg-primary-container/20 text-primary rounded text-xs shrink-0"
              >
                <span className="max-w-[80px] truncate">{getLabelForValue(v)}</span>
                <X
                  className="w-3 h-3 cursor-pointer shrink-0"
                  onClick={(e) => removeValue(e, v)}
                />
              </span>
            ))}
          {hasSelection && value.length > 2 && (
            <span className="px-1.5 py-0.5 bg-primary-container/20 text-primary rounded text-xs">
              {value.length} seleccionados
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-secondary shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 top-full mt-1 w-full min-w-[200px] bg-surface-container border border-outline-variant rounded-lg shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-outline-variant">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary" />
              <input
                type="text"
                autoFocus
                value={inputValue}
                onChange={handleSearchChange}
                placeholder="Buscar..."
                className="w-full pl-7 pr-3 py-1.5 text-xs bg-surface-variant border border-outline-variant rounded text-on-surface placeholder:text-secondary focus:ring-1 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-4 text-center text-xs text-secondary">
                Cargando...
              </div>
            ) : options.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-secondary">
                Sin resultados
              </div>
            ) : (
              options.map((opt) => {
                const selected = value.includes(String(opt.value));
                const depth = opt.depth ?? 0;
                const isRoot = depth === 0;
                const indentPx = 12 + depth * 14;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(String(opt.value))}
                    style={{ paddingLeft: `${indentPx}px` }}
                    className={`w-full flex items-center gap-2 pr-3 py-2 text-sm text-left hover:bg-surface-container-high transition-colors ${
                      selected ? "text-primary" : isRoot ? "text-on-surface" : "text-on-surface-variant"
                    } ${isRoot && !selected ? "font-medium" : ""}`}
                  >
                    {/* Depth indicator line for nested items */}
                    {depth > 0 && (
                      <span className="shrink-0 w-px h-3 bg-outline-variant self-center" />
                    )}

                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                        selected
                          ? "bg-primary border-2 border-primary"
                          : "bg-surface-container-high border-2 border-outline"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 text-on-primary" strokeWidth={3} />}
                    </div>

                    <OptionLabel label={opt.label} />
                  </button>
                );
              })
            )}
          </div>

          {/* Clear all */}
          {hasSelection && (
            <div className="p-2 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => onChange?.([])}
                className="w-full text-xs text-secondary hover:text-on-surface text-center py-1"
              >
                Limpiar selección
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectSearch;
