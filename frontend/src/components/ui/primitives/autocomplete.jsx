// Primitiva shadcn/ui sobre Base UI Autocomplete: el input es el valor y los ítems lo completan.
// No se importa desde features/ ni pages/: usar el wrapper @ui/Autocomplete.
import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete"
import { cn } from "@/lib/utils"
import { inputVariants } from "@ui/inputVariants"
import { useDialogPortalContainer } from "@ui/dialogContext"

const Autocomplete = AutocompletePrimitive.Root
const AutocompleteTrigger = AutocompletePrimitive.Trigger
const AutocompleteClear = AutocompletePrimitive.Clear
// Agrupa input + botones y es el ancla de la lista. Con la lista abierta Base UI marca aria-hidden todo
// menos el input y el Trigger; Clear queda oculto pero con tabIndex -1 (no enfocable) y clickeable.
const AutocompleteInputGroup = AutocompletePrimitive.InputGroup

// Caja = la de los campos de texto (inputVariants), con el mismo foco y error.
function AutocompleteInput({ className, size = "default", ...props }) {
  return (
    <AutocompletePrimitive.Input
      data-slot="autocomplete-input"
      autoComplete="off"
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  )
}

// Lista en un portal: dentro de un Dialog va a su panel (sigue interactiva con modal y Escape cierra solo
// la lista); fuera, al body. z-50 como el resto de las listas flotantes.
function AutocompleteContent({ className, children, sideOffset = 4, ...props }) {
  const container = useDialogPortalContainer()
  return (
    <AutocompletePrimitive.Portal container={container ?? undefined}>
      <AutocompletePrimitive.Positioner side="bottom" align="start" sideOffset={sideOffset} className="z-50 outline-none">
        <AutocompletePrimitive.Popup
          data-slot="autocomplete-content"
          className={cn(
            "w-(--anchor-width) overflow-y-auto overscroll-contain rounded-lg border border-outline-variant bg-surface-container text-on-surface shadow-lg outline-none",
            className
          )}
          {...props}
        >
          {children}
        </AutocompletePrimitive.Popup>
      </AutocompletePrimitive.Positioner>
    </AutocompletePrimitive.Portal>
  )
}

function AutocompleteList({ className, ...props }) {
  return (
    <AutocompletePrimitive.List
      data-slot="autocomplete-list"
      className={cn("outline-none empty:hidden", className)}
      {...props}
    />
  )
}

function AutocompleteItem({ className, ...props }) {
  return (
    <AutocompletePrimitive.Item
      data-slot="autocomplete-item"
      className={cn(
        "w-full cursor-default text-left outline-none select-none data-highlighted:bg-primary/10",
        className
      )}
      {...props}
    />
  )
}

function AutocompleteStatus({ className, ...props }) {
  return (
    <AutocompletePrimitive.Status
      data-slot="autocomplete-status"
      className={cn("text-sm text-on-surface-variant empty:hidden", className)}
      {...props}
    />
  )
}

export {
  Autocomplete,
  AutocompleteClear,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteInputGroup,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteStatus,
  AutocompleteTrigger,
}
