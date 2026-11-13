// Campo y estilo de input de la pantalla de Configuración (compartidos con los planes de cuotas).
export const Field = ({ label, error, htmlFor, children }) => (
  <div className="space-y-1">
    <label htmlFor={htmlFor} className="block text-sm text-secondary">{label}</label>
    {children}
    {error && <p className="text-xs text-error">{error}</p>}
  </div>
);

export const inputCls =
  "w-full px-3 py-2 bg-surface-container border border-outline-variant text-on-surface placeholder:text-secondary rounded-lg text-sm focus:outline-none focus:border-primary transition-colors";
