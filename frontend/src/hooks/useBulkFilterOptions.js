import { useState } from 'react';
import { useSuppliers } from '@services/suppliersService';
import { useProductBrands } from '@services/productsService';
import { useCategories } from '@services/categoriesService';
import { buildCategoryOptions } from '@utils/categoryOptions';

export const EMPTY_BULK_FILTERS = { search: '', brands: [], supplierIds: [], categoryIds: [] };

export const hasBulkFilters = (f) =>
  Boolean(f.search) || f.brands.length > 0 || f.supplierIds.length > 0 || f.categoryIds.length > 0;

/**
 * Criterios del ajuste masivo en modo libre: nombre, marcas, proveedores y categorías (combinables, AND).
 * Devuelve también las opciones cargadas para que el modal muestre etiquetas en el resumen.
 */
export const useBulkFilterOptions = () => {
  const [brandSearch, setBrandSearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  const brands = useProductBrands(brandSearch);
  const suppliers = useSuppliers({ search: supplierSearch, per_page: 50 });
  const categories = useCategories(categorySearch);

  return {
    brand: {
      options: (brands.data?.data?.brands || []).map((b) => ({ value: b, label: b })),
      loading: brands.isLoading,
      onSearch: setBrandSearch,
    },
    supplier: {
      options: (suppliers.data?.data?.suppliers || []).map((s) => ({ value: String(s.id), label: s.name })),
      loading: suppliers.isLoading,
      onSearch: setSupplierSearch,
    },
    category: {
      options: buildCategoryOptions(categories.data?.data?.categories || []),
      loading: categories.isLoading,
      onSearch: setCategorySearch,
    },
  };
};

const splitCsv = (v) => (v ? String(v).split(',').filter(Boolean) : []);
const labelsFor = (ids, options) => ids.map((id) => options.find((o) => o.value === id)?.label ?? id);
const plural = (n) => `${n} producto${n !== 1 ? 's' : ''}`;

/**
 * Resumen legible de qué productos ajusta el lote.
 * @param {null|{type:'ids',ids:number[]}|{type:'filters',search,brand,supplierId,categoryId,active}} target
 * @param {typeof EMPTY_BULK_FILTERS} filters - filtros del modo libre (target null)
 */
export const bulkCriteriaSummary = (target, filters, options) => {
  if (target?.type === 'ids') {
    const n = target.ids.length;
    return `${plural(n)} seleccionado${n !== 1 ? 's' : ''}`;
  }
  const src = target?.type === 'filters'
    ? {
      search: target.search,
      brands: splitCsv(target.brand),
      supplierIds: splitCsv(target.supplierId),
      categoryIds: splitCsv(target.categoryId),
    }
    : filters;
  const parts = [];
  if (src.search) parts.push(`nombre contiene "${src.search}"`);
  if (src.brands.length) parts.push(`marca: ${src.brands.join(', ')}`);
  if (src.categoryIds.length) parts.push(`categoría: ${labelsFor(src.categoryIds, options.category.options).join(', ')}`);
  if (src.supplierIds.length) parts.push(`proveedor: ${labelsFor(src.supplierIds, options.supplier.options).join(', ')}`);
  if (target?.active) parts.push(target.active === 'true' ? 'con stock' : 'sin stock');
  return parts.length ? `Productos con ${parts.join(' · ')}` : 'Todos los productos';
};
