import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, X, Search, Check } from "lucide-react";

/**
 * Searchable single-select dropdown.
 *
 * Props:
 *   options       [{ value: string, label: string, depth?: number }]
 *   value         string | null — selected value
 *   onChange      (value: string | null) => void
 *   onSearch      (q: string) => void — called after 300ms debounce
 *   placeholder   string
 *   loading       boolean
 *   className     string
 *   clearable     boolean
 */

const SCROLL_KEYFRAMES_ID = "sss-keyframes";
const SCROLL_KEYFRAMES = `
  @keyframes sss-scroll {
    0%   { transform: translateX(0); }
    15%  { transform: translateX(0); }
    85%  { transform: translateX(var(--sss-offset, 0px)); }
    100% { transform: translateX(var(--sss-offset, 0px)); }
  }
  .sss-scrolling {
    animation: sss-scroll 3s ease-in-out forwards;
    will-change: transform;
  }
`;

const useScrollKeyframes = () => {
  useEffect(() => {
    if (document.getElementById(SCROLL_KEYFRAMES_ID)) return;
    const el = document.createElement("style");
    el.id = SCROLL_KEYFRAMES_ID;
    el.textContent = SCROLL_KEYFRAMES;
    document.head.appendChild(el);
  }, []);
};

const OptionLabel = ({ label, isRoot }) => {
  const spanRef = useRef(null);

  const handleMouseEnter = () => {
    const el = spanRef.current;
    if (!el) return;
    const overflow = el.scrollWidth - el.clientWidth;
    if (overflow <= 2) return;
    el.style.setProperty("--sss-offset", `-${overflow}px`);
    el.classList.remove("sss-scrolling");
    void el.offsetWidth;
    el.classList.add("sss-scrolling");
  };

  const handleMouseLeave = () => {
    const el = spanRef.current;
    if (!el) return;
    el.classList.remove("sss-scrolling");
    el.style.removeProperty("--sss-offset");
  };

  return (
    <span
      className="overflow-hidden flex-1 min-w-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        ref={spanRef}
        className={`inline-block whitespace-nowrap ${isRoot ? "font-medium" : ""}`}
      >
        {label}
      </span>
    </span>
  );
};

const SingleSelectSearch = ({
  options = [],
  value = null,
  onChange,
  onSearch,
  placeholder = "Seleccionar...",
  loading = false,
  className = "",
  clearable = true,
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

  const select = (optionValue) => {
    onChange?.(optionValue === value ? null : optionValue);
    setIsOpen(false);
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange?.(null);
  };

  const selectedLabel = options.find((o) => String(o.value) === String(value))?.label;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-sm bg-surface-variant border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent text-left min-h-[36px]"
      >
        <span className="flex-1 min-w-0 truncate">
          {selectedLabel ? (
            <span className="text-on-surface">{selectedLabel}</span>
          ) : (
            <span className="text-secondary">{placeholder}</span>
          )}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {clearable && selectedLabel && (
            <X
              className="w-3.5 h-3.5 text-secondary hover:text-on-surface"
              onClick={clear}
            />
          )}
          <ChevronDown
            className={`w-4 h-4 text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full mt-1 w-full min-w-[220px] bg-surface-container border border-outline-variant rounded-lg shadow-lg overflow-hidden">
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

          <div className="max-h-52 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-4 text-center text-xs text-secondary">Cargando...</div>
            ) : options.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-secondary">Sin resultados</div>
            ) : (
              options.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                const depth = opt.depth ?? 0;
                const isRoot = depth === 0;
                const indentPx = 12 + depth * 14;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => select(String(opt.value))}
                    style={{ paddingLeft: `${indentPx}px` }}
                    className={`w-full flex items-center gap-2 pr-3 py-2 text-sm text-left hover:bg-surface-container-high transition-colors ${
                      isSelected ? "text-primary" : isRoot ? "text-on-surface" : "text-on-surface-variant"
                    }`}
                  >
                    {depth > 0 && (
                      <span className="shrink-0 w-px h-3 bg-outline-variant self-center" />
                    )}

                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-primary border-2 border-primary"
                          : "bg-surface-container-high border-2 border-outline"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-on-primary" strokeWidth={3} />}
                    </div>

                    <OptionLabel label={opt.label} isRoot={isRoot} />
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleSelectSearch;
