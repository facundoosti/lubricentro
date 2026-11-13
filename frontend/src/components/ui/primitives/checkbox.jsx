// Primitiva shadcn/ui (base-nova) sobre Base UI, con las clases ajustadas a los tokens del design system
// (mismo aspecto que el checkbox nativo estilado de index.css). Suma el indicador de indeterminado:
// caja con fondo de superficie, borde violeta y guion (no se confunde con una casilla marcada).
// No se importa desde features/ ni pages/: usar el wrapper @ui/Checkbox.
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function Checkbox({ className, ...props }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border-[1.5px] border-outline bg-surface-container transition-colors outline-none hover:bg-surface-container-high focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] data-disabled:cursor-not-allowed data-disabled:opacity-50 data-checked:border-primary-container data-checked:bg-primary-container data-checked:text-on-primary data-indeterminate:border-primary-container data-indeterminate:bg-surface-container-high data-indeterminate:text-on-surface",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="group/indicator grid place-content-center text-current transition-none [&>svg]:size-3 [&>svg]:stroke-[3]"
      >
        {props.indeterminate ? <MinusIcon /> : <CheckIcon />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
