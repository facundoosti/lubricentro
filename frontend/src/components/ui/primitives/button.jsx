// Primitiva shadcn/ui (base-nova) sobre Base UI, con las clases ajustadas a los tokens del design system.
// La agregó el CLI como dependencia de `calendar` (botones de navegación y días). No es el Button de la app:
// features/ y pages/ usan @ui/Button.
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/primitives/button-variants"

function Button({ className, variant = "default", size = "default", ...props }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }
