import { PRODUCT_IVA_OPTIONS, priceWithIva } from '@utils/iva';
import { formatCurrency } from '@utils/money';

// Selector de alícuota del producto + vista previa del precio final.
const ProductIvaField = ({ register, unitPrice, ivaRate, className }) => {
  const hasPrice = unitPrice !== '' && !Number.isNaN(parseFloat(unitPrice));

  return (
    <div>
      <label htmlFor="iva_rate" className="block text-sm font-medium text-on-surface mb-1.5">
        IVA
      </label>
      <select id="iva_rate" {...register('iva_rate')} className={className}>
        {PRODUCT_IVA_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {hasPrice && (
        <p className="mt-1 text-xs text-on-surface-variant" data-testid="price-with-iva">
          Con IVA: <span className="font-medium text-on-surface">{formatCurrency(priceWithIva(unitPrice, ivaRate))}</span>
        </p>
      )}
    </div>
  );
};

export default ProductIvaField;
