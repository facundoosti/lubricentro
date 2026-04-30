import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import ImageUpload from '@ui/ImageUpload';
import SingleSelectSearch from '@ui/SingleSelectSearch';
import { useSuppliers } from '@services/suppliersService';
import { useCategories } from '@services/categoriesService';

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
  } = useForm({
    defaultValues: {
      name: product?.name || '',
      sku: product?.sku || '',
      brand: product?.brand || '',
      description: product?.description || '',
      unit_price: product?.unit_price || '',
      unit: product?.unit || '',
      stock: product?.stock ?? 0,
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

  const inputClass = (hasError) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`;

  const commonUnits = [
    { value: '', label: 'Seleccionar unidad' },
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
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Nombre del Producto *
        </label>
        <input
          type="text"
          id="name"
          {...register('name', {
            required: 'El nombre es requerido',
            maxLength: { value: 100, message: 'El nombre no puede exceder 100 caracteres' },
          })}
          className={inputClass(errors.name)}
          placeholder="Ej: Aceite de Motor 5W-30"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
      </div>

      {/* SKU + Marca */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            SKU
            <span className="ml-1.5 text-xs text-gray-500 font-normal">(auto si vacío)</span>
          </label>
          <input
            type="text"
            id="sku"
            {...register('sku', {
              maxLength: { value: 50, message: 'El SKU no puede exceder 50 caracteres' },
            })}
            className={`${inputClass(errors.sku)} font-mono uppercase`}
            placeholder="PRD-ABC123"
            style={{ textTransform: 'uppercase' }}
          />
          {errors.sku && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.sku.message}</p>}
        </div>

        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Marca
          </label>
          <input
            type="text"
            id="brand"
            {...register('brand', {
              maxLength: { value: 100, message: 'La marca no puede exceder 100 caracteres' },
            })}
            className={inputClass(errors.brand)}
            placeholder="Ej: Castrol, Bosch"
          />
          {errors.brand && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.brand.message}</p>}
        </div>
      </div>

      {/* Proveedor + Categoría */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Proveedor
          </label>
          <select
            id="supplier_id"
            {...register('supplier_id')}
            className={inputClass(false)}
          >
            <option value="">Sin proveedor</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Categoría
          </label>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <SingleSelectSearch
                options={categoryOptions}
                value={field.value}
                onChange={field.onChange}
                onSearch={setCategorySearch}
                placeholder="Seleccionar..."
                clearable
              />
            )}
          />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Descripción
        </label>
        <textarea
          id="description"
          rows={2}
          {...register('description', {
            maxLength: { value: 1000, message: 'La descripción no puede exceder 1000 caracteres' },
          })}
          className={inputClass(errors.description)}
          placeholder="Descripción opcional del producto..."
        />
        {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>}
      </div>

      {/* Precio + Unidad + Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Precio Unitario (ARS) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              id="unit_price"
              step="0.01"
              min="0"
              {...register('unit_price', {
                required: 'El precio es requerido',
                min: { value: 0, message: 'El precio debe ser mayor o igual a 0' },
                validate: (v) => (!isNaN(parseFloat(v)) && parseFloat(v) >= 0) || 'Precio inválido',
              })}
              className={`${inputClass(errors.unit_price)} pl-8`}
              placeholder="0.00"
            />
          </div>
          {errors.unit_price && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.unit_price.message}</p>}
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Unidad
          </label>
          <select
            id="unit"
            {...register('unit', {
              maxLength: { value: 50, message: 'La unidad no puede exceder 50 caracteres' },
            })}
            className={inputClass(errors.unit)}
          >
            {commonUnits.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
          {errors.unit && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.unit.message}</p>}
        </div>
      </div>

      {/* Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Stock
          </label>
          <input
            type="number"
            id="stock"
            min="0"
            step="1"
            {...register('stock', {
              min: { value: 0, message: 'El stock no puede ser negativo' },
              validate: (v) => Number.isInteger(Number(v)) || 'El stock debe ser un número entero',
            })}
            className={inputClass(errors.stock)}
            placeholder="0"
          />
          {errors.stock && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.stock.message}</p>}
        </div>
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
