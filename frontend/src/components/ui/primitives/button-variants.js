// Variantes de la primitiva Button (shadcn/ui). Van en un archivo aparte para que button.jsx
// exporte solo componentes (react-refresh/only-export-components).
import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary-container text-on-primary hover:brightness-110",
        outline: "border-outline-variant bg-surface-container-high text-on-surface hover:bg-surface-variant",
        ghost: "text-on-surface hover:bg-surface-container-high aria-expanded:bg-surface-container-high",
      },
      size: {
        default: "h-8 gap-1.5 px-2.5",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
