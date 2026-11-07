import { formatIvaRate, priceWithIva } from '@utils/iva';

const formatARS = (value) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 })
    .format(parseFloat(value) || 0);

// Precio neto (como se guarda) + alícuota y precio final con IVA.
const ProductPriceCell = ({ product }) => {
  const final = product.unit_price_with_iva ?? priceWithIva(product.unit_price, product.iva_rate);

  return (
    <div className="flex flex-col gap-0.5 whitespace-nowrap">
      <span className="text-on-surface text-sm font-medium">{formatARS(product.unit_price)}</span>
      <span className="text-xs text-on-surface-variant">
        <span className="inline-block px-1.5 py-px mr-1 rounded bg-primary-container/20 text-primary font-medium">
          IVA {formatIvaRate(product.iva_rate ?? 21)}
        </span>
        {formatARS(final)}
      </span>
    </div>
  );
};

export default ProductPriceCell;
