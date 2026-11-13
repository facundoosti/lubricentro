import { Controller } from 'react-hook-form';
import Select from '@ui/Select';
import { PRODUCT_IVA_OPTIONS, priceWithIva } from '@utils/iva';
import { formatCurrency } from '@utils/money';

// Selector de alícuota del producto + vista previa del precio final.
const ProductIvaField = ({ control, unitPrice, ivaRate, className }) => {
  const hasPrice = unitPrice !== '' && !Number.isNaN(parseFloat(unitPrice));

  return (
    <div>
      <label id="iva_rate-label" htmlFor="iva_rate" className="block text-sm font-medium text-on-surface mb-1.5">
        IVA
      </label>
      <Controller
        name="iva_rate"
        control={control}
        render={({ field }) => (
          <Select
            id="iva_rate"
            aria-labelledby="iva_rate-label"
            options={PRODUCT_IVA_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            className={className}
          />
        )}
      />
      {hasPrice && (
        <p className="mt-1 text-xs text-on-surface-variant" data-testid="price-with-iva">
          Con IVA: <span className="font-medium text-on-surface">{formatCurrency(priceWithIva(unitPrice, ivaRate))}</span>
        </p>
      )}
    </div>
  );
};

export default ProductIvaField;
