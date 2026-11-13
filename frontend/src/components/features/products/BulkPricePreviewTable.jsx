// Tabla de la vista previa del ajuste masivo: precio actual vs. nuevo por producto.
const BulkPricePreviewTable = ({ previews, formatPrice }) => (
  <div className="rounded-lg border border-outline-variant overflow-hidden">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-outline-variant bg-surface-container-high">
          <th className="text-left px-4 py-2.5 text-xs font-medium text-secondary uppercase">SKU</th>
          <th className="text-left px-4 py-2.5 text-xs font-medium text-secondary uppercase">Producto</th>
          <th className="text-right px-4 py-2.5 text-xs font-medium text-secondary uppercase whitespace-nowrap">Precio actual</th>
          <th className="text-right px-4 py-2.5 text-xs font-medium text-secondary uppercase whitespace-nowrap">Precio nuevo</th>
        </tr>
      </thead>
      <tbody>
        {previews.map((p) => (
          <tr key={p.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-high/50">
            <td className="px-4 py-3 font-mono text-xs text-secondary">{p.sku || '—'}</td>
            <td className="px-4 py-3 text-on-surface max-w-md">
              <span className="line-clamp-2 break-words" title={p.name}>{p.name}</span>
            </td>
            <td className="px-4 py-3 text-right text-secondary whitespace-nowrap">{formatPrice(p.current_price)}</td>
            <td className="px-4 py-3 text-right font-semibold text-tertiary whitespace-nowrap">{formatPrice(p.new_price)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default BulkPricePreviewTable;
