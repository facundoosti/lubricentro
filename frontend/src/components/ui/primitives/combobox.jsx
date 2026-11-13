// Primitiva shadcn/ui (base-nova) sobre Base UI, con las clases ajustadas a los tokens del design system.
// Patrón "buscador dentro de la lista": el trigger muestra la selección y el input va en el popup.
// No se importa desde features/ ni pages/: usar el wrapper @ui/Combobox.
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const Combobox = ComboboxPrimitive.Root

function ComboboxTrigger({ className, children, ...props }) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn(
        "flex min-h-[36px] w-full items-center gap-1.5 rounded-lg border border-input bg-surface-variant px-3 py-2 text-left text-sm text-on-surface outline-none focus:border-transparent focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="size-4 shrink-0 text-secondary transition-transform in-data-popup-open:rotate-180" />
    </ComboboxPrimitive.Trigger>
  )
}

// Lista desplegable en un portal (z-50): queda por encima de los diálogos y acepta clicks.
function ComboboxContent({ className, children, side = "bottom", sideOffset = 4, align = "start", ...props }) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner side={side} sideOffset={sideOffset} align={align} className="z-50 outline-none">
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(
            "w-(--anchor-width) min-w-[220px] overflow-hidden rounded-lg border border-outline-variant bg-surface-container text-on-surface shadow-lg outline-none",
            className
          )}
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxSearch({ className, ...props }) {
  return (
    <div className="border-b border-outline-variant p-2">
      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-secondary" />
        <ComboboxPrimitive.Input
          data-slot="combobox-input"
          autoComplete="off"
          className={cn(
            "w-full rounded border border-input bg-surface-variant py-1.5 pr-3 pl-7 text-xs text-on-surface outline-none placeholder:text-secondary focus:border-transparent focus:ring-1 focus:ring-ring",
            className
          )}
          {...props}
        />
      </div>
    </div>
  )
}

function ComboboxList({ className, ...props }) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn("max-h-52 overflow-y-auto overscroll-contain outline-none empty:hidden", className)}
      {...props}
    />
  )
}

// Indicador de opción: círculo (simple) o casilla (múltiple), como los selects anteriores.
function ComboboxItemIndicator({ multiple }) {
  return (
    <span
      className={cn(
        "flex size-4 shrink-0 items-center justify-center border-2 border-outline bg-surface-container-high transition-colors in-data-selected:border-primary-container in-data-selected:bg-primary-container",
        multiple ? "rounded" : "rounded-full"
      )}
    >
      <ComboboxPrimitive.ItemIndicator>
        <CheckIcon className={cn("text-on-primary", multiple ? "size-3" : "size-2.5")} strokeWidth={3} />
      </ComboboxPrimitive.ItemIndicator>
    </span>
  )
}

function ComboboxItem({ className, children, multiple = false, ...props }) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "flex w-full cursor-default items-center gap-2 py-2 pr-3 text-left text-sm outline-none select-none data-highlighted:bg-accent data-selected:text-primary",
        className
      )}
      {...props}
    >
      <ComboboxItemIndicator multiple={multiple} />
      {children}
    </ComboboxPrimitive.Item>
  )
}

function ComboboxEmpty({ className, ...props }) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn("px-3 py-4 text-center text-xs text-secondary empty:hidden", className)}
      {...props}
    />
  )
}

function ComboboxStatus({ className, ...props }) {
  return (
    <ComboboxPrimitive.Status
      data-slot="combobox-status"
      className={cn("px-3 py-4 text-center text-xs text-secondary empty:hidden", className)}
      {...props}
    />
  )
}

export {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxSearch,
  ComboboxStatus,
  ComboboxTrigger,
}
