// Primitiva shadcn/ui (base-nova) sobre Base UI, con las clases ajustadas a los tokens del design system.
// No se importa desde features/ ni pages/: usar el wrapper @ui/ConfirmDialog.
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"
import { cn } from "@/lib/utils"

function AlertDialog({ ...props }) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogPortal({ ...props }) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

function AlertDialogOverlay({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn("fixed inset-0 z-50 bg-black/50 backdrop-blur-[32px]", className)}
      {...props}
    />
  )
}

// Contenedor que centra el panel. Sin transform: los autocompletes con lista fixed dentro del panel
// se posicionan respecto del viewport.
function AlertDialogViewport({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Viewport
      data-slot="alert-dialog-viewport"
      className={cn("fixed inset-0 z-50 flex items-center justify-center p-4", className)}
      {...props}
    />
  )
}

function AlertDialogPopup({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Popup
      data-slot="alert-dialog-content"
      className={cn(
        "relative w-full bg-card text-card-foreground outline-none",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-medium text-on-surface", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function AlertDialogClose({ ...props }) {
  return <AlertDialogPrimitive.Close data-slot="alert-dialog-close" {...props} />
}

export {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPopup,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogViewport,
}
