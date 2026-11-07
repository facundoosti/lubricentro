import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

const ZOOM_SCALE = 2.5;

/**
 * Visor de imágenes a pantalla completa con carrusel y zoom.
 * - Clic en la imagen: alterna zoom (centrado en el punto clickeado); mover el mouse recorre la imagen.
 * - ← / → navegan, Esc cierra.
 * El overlay usa negro fijo (no tokens de tema) a propósito: es un visor de fotos.
 *
 * @param {{src: string, alt?: string, title?: string, subtitle?: string}[]} images
 * @param {number|null} index  Imagen abierta; null = cerrado.
 */
const ImageLightbox = ({ images = [], index, onClose, onIndexChange }) => {
  // Índice de la imagen ampliada: al navegar el zoom se apaga en el mismo render (sin parpadeo).
  const [zoomedAt, setZoomedAt] = useState(null);
  const [origin, setOrigin] = useState("50% 50%");
  const thumbsRef = useRef(null);
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  // Caja de la imagen sin escalar: el pan se calcula sobre ella (la caja escalada se mueve con el origen).
  const baseRectRef = useRef(null);

  const isOpen = index !== null && index !== undefined && images[index];
  const total = images.length;
  const hasMany = total > 1;
  const zoomed = zoomedAt === index;

  const go = useCallback(
    (delta) => {
      if (!hasMany) return;
      onIndexChange((index + delta + total) % total);
    },
    [hasMany, index, total, onIndexChange],
  );

  // Teclado: Esc, flechas y Tab atrapado dentro del diálogo
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "Tab" && dialogRef.current) {
        const focusables = [...dialogRef.current.querySelectorAll("button:not([disabled])")];
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const inside = dialogRef.current.contains(document.activeElement);
        if (e.shiftKey && (document.activeElement === first || !inside)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, go]);

  // Foco: al abrir va al botón Cerrar; al cerrar vuelve a quien abrió el visor
  useEffect(() => {
    if (!isOpen) return undefined;
    const opener = document.activeElement;
    closeBtnRef.current?.focus();
    return () => { if (opener?.isConnected) opener.focus(); };
  }, [isOpen]);

  // Bloquear scroll del fondo
  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Mantener visible la miniatura activa
  useEffect(() => {
    const active = thumbsRef.current?.querySelector('[aria-current="true"]');
    active?.scrollIntoView?.({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  if (!isOpen) return null;

  const current = images[index];

  const clampPct = (v) => Math.min(100, Math.max(0, v));
  const originFromEvent = (e, rect) => {
    const x = clampPct(((e.clientX - rect.left) / rect.width) * 100);
    const y = clampPct(((e.clientY - rect.top) / rect.height) * 100);
    return `${x}% ${y}%`;
  };

  const handleImageClick = (e) => {
    if (!zoomed) {
      baseRectRef.current = e.currentTarget.getBoundingClientRect();
      setOrigin(originFromEvent(e, baseRectRef.current));
    }
    setZoomedAt(zoomed ? null : index);
  };

  const handleMouseMove = (e) => {
    if (zoomed && baseRectRef.current) setOrigin(originFromEvent(e, baseRectRef.current));
  };

  const toggleZoomFromButton = () => {
    if (!zoomed) {
      baseRectRef.current = null;
      setOrigin("50% 50%");
    }
    setZoomedAt(zoomed ? null : index);
  };

  // Clic en cualquier zona vacía (fondo, costados de la foto, barras) cierra;
  // botones, imagen y el título/SKU (para poder seleccionarlos) no.
  const handleOverlayClick = (e) => {
    if (e.target.closest("button, img, [data-lightbox-keep]")) return;
    onClose();
  };

  const iconBtn =
    "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Imagen de ${current.title || current.alt || "producto"}`}
      className="fixed inset-0 z-99999 flex flex-col bg-black/90 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 text-white">
        <div className="min-w-0" data-lightbox-keep>
          {current.title && <p className="truncate text-base font-medium">{current.title}</p>}
          {current.subtitle && <p className="truncate font-mono text-xs text-white/60">{current.subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {hasMany && (
            <span className="mr-2 text-sm tabular-nums text-white/70">
              {index + 1} / {total}
            </span>
          )}
          <button
            type="button"
            onClick={toggleZoomFromButton}
            className={iconBtn}
            aria-label={zoomed ? "Alejar" : "Acercar"}
            title={zoomed ? "Alejar" : "Acercar"}
          >
            {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
          </button>
          <button ref={closeBtnRef} type="button" onClick={onClose} className={iconBtn} aria-label="Cerrar" title="Cerrar (Esc)">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Imagen + flechas */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-20">
        {hasMany && (
          <button
            type="button"
            onClick={() => go(-1)}
            className={`${iconBtn} absolute left-6 top-1/2 -translate-y-1/2`}
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <div className="flex h-full max-h-full w-full items-center justify-center overflow-hidden">
          <img
            key={current.src}
            src={current.src}
            alt={current.alt || current.title || ""}
            draggable={false}
            onClick={handleImageClick}
            onMouseMove={handleMouseMove}
            className={`max-h-full max-w-full select-none rounded-lg object-contain shadow-2xl transition-transform duration-200 ease-out ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
            style={{ transform: zoomed ? `scale(${ZOOM_SCALE})` : "scale(1)", transformOrigin: origin }}
          />
        </div>

        {hasMany && (
          <button
            type="button"
            onClick={() => go(1)}
            className={`${iconBtn} absolute right-6 top-1/2 -translate-y-1/2`}
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Miniaturas */}
      {hasMany ? (
        <div ref={thumbsRef} className="flex justify-center gap-2 overflow-x-auto px-6 py-4">
          {images.map((img, i) => (
            <button
              key={`${img.src}-${i}`}
              type="button"
              onClick={() => onIndexChange(i)}
              aria-label={`Ver ${img.title || `imagen ${i + 1}`}`}
              aria-current={i === index ? "true" : undefined}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-all ${i === index ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-80"}`}
            >
              <img src={img.src} alt="" className="h-full w-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      ) : (
        <div className="h-6" />
      )}
    </div>,
    document.body,
  );
};

export default ImageLightbox;
