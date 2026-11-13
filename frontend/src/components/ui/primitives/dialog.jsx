// Primitiva shadcn/ui (base-nova) sobre Base UI, con las clases ajustadas a los tokens del design system.
// No se importa desde features/ ni pages/: usar el wrapper @ui/Dialog.
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "@/lib/utils"

function Dialog({ ...props }) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

// Fondo del diálogo. Los diálogos anidados no lo renderizan salvo con `forceRender`.
function DialogOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-sm", className)}
      {...props}
    />
  )
}

// Panel del diálogo (sin portal ni fondo), superficie del design system. Lo centra el Viewport.
// Contenedor que centra el panel. Sin transform: los autocompletes con lista fixed dentro del panel
// se posicionan respecto del viewport.
function DialogViewport({ className, ...props }) {
  return (
    <DialogPrimitive.Viewport
      data-slot="dialog-viewport"
      className={cn("fixed inset-0 z-50 flex items-center justify-center p-4", className)}
      {...props}
    />
  )
}

function DialogPopup({ className, ...props }) {
  return (
    <DialogPrimitive.Popup
      data-slot="dialog-content"
      className={cn(
        "relative w-full bg-card text-card-foreground outline-none",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-xl font-bold text-on-surface tracking-tight", className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DialogViewport,
}
