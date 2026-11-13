import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import ImageUpload from '@ui/ImageUpload';
import Combobox from '@ui/Combobox';
import Select from '@ui/Select';
import Field from '@ui/Field';
import Input from '@ui/Input';
import Textarea from '@ui/Textarea';
import { useSuppliers } from '@services/suppliersService';
import { useCategories } from '@services/categoriesService';
import { ivaRateToOption, DEFAULT_IVA_RATE } from '@utils/iva';
import ProductIvaField from '@components/features/products/ProductIvaField';

const buildCategoryOptions = (categories) => {
  const byParent = {};
  categories.forEach((c) => {
    const key = c.parent_id ?? 'root';
    if (!byParent[key]) byParent[key] = [];
    byParent[key].push(c);
  });

  const flatten = (parentId, depth) => {
    const children = byParent[parentId] || [];
    return children.flatMap((c) => [
      { value: String(c.id), label: c.name, depth },
      ...flatten(c.id, depth + 1),
    ]);
  };

  return flatten('root', 0);
};

// "Sin proveedor" es '' en el formulario; en la lista usa un valor propio (el Select trata '' como "sin elegir").
const NO_SUPPLIER = 'none';
// Ídem "Sin unidad" (la unidad es opcional en el backend).
const NO_UNIT = 'none';

const ProductForm = ({ product = null, onSubmit, formId = 'product-form' }) => {
  const [imageFile, setImageFile] = useState(null);
  const [categorySearch, setCategorySearch] = useState('');

  const { data: suppliersData } = useSuppliers({ per_page: 200 });
  const suppliers = suppliersData?.data?.suppliers || [];

  const { data: categoriesData } = useCategories(categorySearch);
  const rawCategories = categoriesData?.data?.categories || [];

  const categoryOptions = buildCategoryOptions(rawCategories);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: product?.name || '',
      sku: product?.sku || '',
      brand: product?.brand || '',
      description: product?.description || '',
      unit_price: product?.unit_price || '',
      unit: product?.unit || '',
      stock: product?.stock ?? 0,
      iva_rate: ivaRateToOption(product?.iva_rate ?? DEFAULT_IVA_RATE),
      supplier_id: product?.supplier_id || '',
      category_id: product?.category_id ? String(product.category_id) : null,
    },
  });

  const handleFormSubmit = async (data) => {
    try {
      const formData = {
        ...data,
        unit_price: parseFloat(data.unit_price),
        stock: parseInt(data.stock, 10) || 0,
        iva_rate: parseFloat(data.iva_rate),
        supplier_id: data.supplier_id || null,
        category_id: data.category_id || null,
      };
      if (imageFile) formData.image = imageFile;
      await onSubmit(formData);
      reset();
      setImageFile(null);
    } catch (error) {
      console.error('Error submitting product form:', error);
    }
  };

  const supplierOptions = [
    { value: NO_SUPPLIER, label: 'Sin proveedor' },
    ...suppliers.map((s) => ({ value: String(s.id), label: s.name })),
  ];

  const commonUnits = [
    { value: NO_UNIT, label: 'Sin unidad' },
    { value: 'unidad', label: 'Unidad' },
    { value: 'litro', label: 'Litro' },
    { value: 'kg', label: 'Kilogramo' },
    { value: 'metro', label: 'Metro' },
    { value: 'hora', label: 'Hora' },
    { value: 'servicio', label: 'Servicio' },
    { value: 'paquete', label: 'Paquete' },
    { value: 'caja', label: 'Caja' },
    { value: 'botella', label: 'Botella' },
  ];

  return (
    <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Nombre */}
      <Field label="Nombre del Producto" required error={errors.name?.message}>
        <Input
          id="name"
          {...register('name', {
            required: 'El nombre es requerido',
            maxLength: { value: 500, message: 'El nombre no puede exceder 500 caracteres' },
          })}
          placeholder="Ej: Aceite de Motor 5W-30"
        />
      </Field>

      {/* SKU + Marca */}
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="SKU"
          error={errors.sku?.message}
          labelAddon={<span className="text-xs text-on-surface-variant font-normal">(auto si vacío)</span>}
        >
          <Input
            id="sku"
            {...register('sku', {
              maxLength: { value: 50, message: 'El SKU no puede exceder 50 caracteres' },
            })}
            className="font-mono uppercase"
            placeholder="PRD-ABC123"
            style={{ textTransform: 'uppercase' }}
          />
        </Field>

        <Field label="Marca" error={errors.brand?.message}>
          <Input
            id="brand"
            {...register('brand', {
              maxLength: { value: 100, message: 'La marca no puede exceder 100 caracteres' },
            })}
            placeholder="Ej: Castrol, Bosch"
          />
        </Field>
      </div>

      {/* Proveedor + Categoría */}
      <div className="grid grid-cols-2 gap-4">
        <Field id="supplier_id" label="Proveedor">
          <Controller
            name="supplier_id"
            control={control}
            render={({ field }) => (
              <Select
                id="supplier_id"
                aria-labelledby="supplier_id-label"
                options={supplierOptions}
                value={field.value ? String(field.value) : NO_SUPPLIER}
                onChange={(v) => field.onChange(v === NO_SUPPLIER ? '' : v)}
              />
            )}
          />
        </Field>

        <Field id="product-category" label="Categoría">
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <Combobox
                aria-labelledby="product-category-label"
                options={categoryOptions}
                value={field.value}
                onChange={field.onChange}
                onSearch={setCategorySearch}
                placeholder="Seleccionar..."
                clearable
              />
            )}
          />
        </Field>
      </div>

      {/* Descripción */}
      <Field label="Descripción" error={errors.description?.message}>
        <Textarea
          id="description"
          rows={2}
          {...register('description', {
            maxLength: { value: 1000, message: 'La descripción no puede exceder 1000 caracteres' },
          })}
          placeholder="Descripción opcional del producto..."
        />
      </Field>

      {/* Precio + Unidad + Stock */}
      <div className="grid grid-cols-2 gap-4">
        <Field id="unit_price" label="Precio sin IVA (ARS)" required error={errors.unit_price?.message}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">$</span>
            <Input
              type="number"
              id="unit_price"
              step="0.01"
              min="0"
              {...register('unit_price', {
                required: 'El precio es requerido',
                min: { value: 0, message: 'El precio debe ser mayor o igual a 0' },
                validate: (v) => (!isNaN(parseFloat(v)) && parseFloat(v) >= 0) || 'Precio inválido',
              })}
              error={!!errors.unit_price}
              className="pl-8"
              placeholder="0.00"
            />
          </div>
        </Field>

        <Field id="unit" label="Unidad" error={errors.unit?.message}>
          <Controller
            name="unit"
            control={control}
            rules={{ maxLength: { value: 50, message: 'La unidad no puede exceder 50 caracteres' } }}
            render={({ field }) => (
              <Select
                id="unit"
                aria-labelledby="unit-label"
                options={commonUnits}
                value={field.value}
                onChange={(v) => field.onChange(v === NO_UNIT ? '' : v)}
                placeholder="Seleccionar unidad"
                error={!!errors.unit}
              />
            )}
          />
        </Field>
      </div>

      {/* Stock */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Stock" error={errors.stock?.message}>
          <Input
            type="number"
            id="stock"
            min="0"
            step="1"
            {...register('stock', {
              min: { value: 0, message: 'El stock no puede ser negativo' },
              validate: (v) => Number.isInteger(Number(v)) || 'El stock debe ser un número entero',
            })}
            placeholder="0"
          />
        </Field>

        <ProductIvaField
          control={control}
          unitPrice={watch('unit_price')}
          ivaRate={watch('iva_rate')}
        />
      </div>

      {/* Imagen */}
      <ImageUpload
        label="Imagen del Producto"
        currentUrl={product?.image_url}
        onChange={setImageFile}
      />
    </form>
  );
};

export default ProductForm;
