import { cn } from '@/lib/utils';
import { Tabs as TabsRoot, TabsContent, TabsList, TabsTrigger } from '@/components/ui/primitives/tabs';

/**
 * Pestañas de Base UI (`tablist`/`tab`/`tabpanel` vinculados, flechas para moverse y Enter/Espacio para
 * activar). Monta **solo el panel activo** (`children`), así los paneles que consultan datos no lo hacen
 * hasta abrirse.
 *
 * @param {{ value: string, label: string, icon?: React.ComponentType }[]} items
 * @param {string} value - pestaña activa
 * @param {(value: string) => void} onValueChange
 * @param {React.ReactNode} children - contenido del panel activo
 */
const Tabs = ({ items = [], value, onValueChange, children, className, listClassName, tabClassName, panelClassName }) => (
  <TabsRoot value={value} onValueChange={(next) => onValueChange?.(next)} className={className}>
    <TabsList className={listClassName}>
      {items.map(({ value: itemValue, label, icon: Icon }) => (
        <TabsTrigger key={itemValue} value={itemValue} className={tabClassName}>
          {Icon && <Icon className="hidden w-4 h-4 shrink-0 sm:inline" />}
          <span className="truncate">{label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
    <TabsContent value={value} className={cn(panelClassName)}>
      {children}
    </TabsContent>
  </TabsRoot>
);

export default Tabs;
