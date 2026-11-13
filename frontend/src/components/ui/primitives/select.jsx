// Primitiva shadcn/ui (base-nova) sobre Base UI, con las clases ajustadas a los tokens del design system.
// No se importa desde features/ ni pages/: usar el wrapper @ui/Select.
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

function SelectValue({ className, ...props }) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("truncate text-left text-on-surface data-placeholder:text-secondary", className)}
      {...props}
    />
  )
}

function SelectTrigger({ className, children, ...props }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-surface-variant px-3 py-2 text-sm transition-colors outline-none hover:border-outline focus:border-primary data-popup-open:border-primary disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="flex shrink-0 text-secondary transition-transform data-popup-open:rotate-180">
        <ChevronDownIcon className="pointer-events-none size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

// Lista desplegable debajo del trigger, con su ancho. Va en un portal (z-50): por encima de los diálogos.
function SelectContent({ className, children, side = "bottom", sideOffset = 4, align = "start", ...props }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignItemWithTrigger={false}
        className="z-50 outline-none"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "w-(--anchor-width) overflow-hidden rounded-lg border border-outline-variant bg-surface-container text-on-surface shadow-xl outline-none",
            className
          )}
          {...props}
        >
          <SelectPrimitive.List className="max-h-52 overflow-y-auto">{children}</SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "w-full cursor-default px-3 py-2 text-left text-sm text-on-surface outline-none select-none data-highlighted:bg-accent data-selected:font-medium data-selected:text-primary data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="line-clamp-2 break-words">{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
