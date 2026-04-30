import React, { useState, useEffect, useRef, useCallback } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@ui/Table";
import Pagination from "@ui/Pagination";
import MultiSelectSearch from "@ui/MultiSelectSearch";
import { useSuppliers } from '@services/suppliersService';
import { useProductBrands } from '@services/productsService';
import { useCategories } from '@services/categoriesService';
import {
  Search, Plus, Edit, Trash2, Eye, Package, X, TrendingUp,
} from "lucide-react";

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

const ProductsTable = ({
  products = [],
  pagination = {},
  onPageChange,
  onEdit,
  onDelete,
  onView,
  onCreate,
  loading = false,
  // Filters (URL-controlled)
  search = '',
  brands = [],
  supplierIds = [],
  categoryIds = [],
  activeFilter = '',
  onFilterChange,
  // Bulk selection
  selectedIds = new Set(),
  selectAllByFilter = false,
  allPageSelected = false,
  someSelected = false,
  totalCount = 0,
  onSelectProduct,
  onSelectAll,
  onSelectAllByFilter,
  onClearSelection,
  onBulkPriceSelected,
}) => {
  const [localSearch, setLocalSearch] = useState(search);
  const [brandSearch, setBrandSearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const headerCheckRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const { data: brandsData, isLoading: brandsLoading } = useProductBrands(brandSearch);
  const brandOptions = (brandsData?.data?.brands || []).map((b) => ({ value: b, label: b }));

  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers({ search: supplierSearch, per_page: 50 });
  const supplierOptions = (suppliersData?.data?.suppliers || []).map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories(categorySearch);
  const categoryOptions = buildCategoryOptions(categoriesData?.data?.categories || []);

  // Sync local search when URL param changes externally (browser back/forward)
  useEffect(() => { setLocalSearch(search); }, [search]);

  // Indeterminate state on header checkbox
  useEffect(() => {
    if (headerCheckRef.current) {
      const someChecked = products.some(p => selectedIds.has(p.id));
      headerCheckRef.current.indeterminate = someChecked && !allPageSelected;
    }
  }, [products, selectedIds, allPageSelected]);

  // Debounced search on input change
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      onFilterChange({ search: val });
    }, 300);
  }, [onFilterChange]);

  const handleClearSearch = () => {
    setLocalSearch('');
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    onFilterChange({ search: '' });
  };

  const removeBrand = (b) => onFilterChange({ brand: brands.filter((v) => v !== b) });
  const removeSupplierId = (id) => onFilterChange({ supplier_id: supplierIds.filter((v) => v !== id) });
  const removeCategoryId = (id) => onFilterChange({ category_id: categoryIds.filter((v) => v !== id) });

  const hasActiveFilters = search || brands.length > 0 || supplierIds.length > 0 || categoryIds.length > 0 || activeFilter;

  const getProductIcon = (name) => {
    const productColors = {
      'aceite': 'bg-blue-100 text-blue-600',
      'filtro': 'bg-green-100 text-green-600',
      'bujía': 'bg-red-100 text-red-600',
      'frenos': 'bg-yellow-100 text-yellow-600',
      'batería': 'bg-purple-100 text-purple-600',
      'neumático': 'bg-gray-100 text-gray-600',
      'lubricante': 'bg-indigo-100 text-indigo-600',
      'refrigerante': 'bg-cyan-100 text-cyan-600',
      'aditivo': 'bg-orange-100 text-orange-600',
    };
    const productName = name.toLowerCase();
    let colorClass = 'bg-gray-100 text-gray-600';
    for (const [type, color] of Object.entries(productColors)) {
      if (productName.includes(type)) { colorClass = color; break; }
    }
    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
        <Package className="w-5 h-5" />
      </div>
    );
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(parseFloat(price));


  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={localSearch}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-8 py-2 text-sm bg-surface-variant border border-outline-variant rounded-lg text-on-surface placeholder:text-secondary focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {localSearch && (
            <button onClick={handleClearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Brand multi-select */}
        <MultiSelectSearch
          className="flex-1 min-w-0"
          placeholder="Marcas..."
          options={brandOptions}
          value={brands}
          onChange={(val) => onFilterChange({ brand: val })}
          onSearch={setBrandSearch}
          loading={brandsLoading}
        />

        {/* Supplier multi-select */}
        <MultiSelectSearch
          className="flex-1 min-w-0"
          placeholder="Proveedores..."
          options={supplierOptions}
          value={supplierIds}
          onChange={(val) => onFilterChange({ supplier_id: val })}
          onSearch={setSupplierSearch}
          loading={suppliersLoading}
        />

        {/* Category multi-select */}
        <MultiSelectSearch
          className="flex-1 min-w-0"
          placeholder="Categorías..."
          options={categoryOptions}
          value={categoryIds}
          onChange={(val) => onFilterChange({ category_id: val })}
          onSearch={setCategorySearch}
          loading={categoriesLoading}
        />

        {/* Filtro activo */}
        <select
          value={activeFilter}
          onChange={(e) => onFilterChange({ active: e.target.value })}
          className="px-3 py-2 text-sm bg-surface-variant border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent shrink-0"
        >
          <option value="">Estado...</option>
          <option value="true">Con stock</option>
          <option value="false">Sin stock</option>
        </select>

        {/* Nuevo producto */}
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-container text-on-primary rounded-lg font-medium hover:brightness-110 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo
        </button>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-secondary">Filtros:</span>
          {search && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-primary-container/15 text-primary border border-primary-container/30 rounded-full text-xs">
              Nombre: {search}
              <button onClick={handleClearSearch}><X className="w-3 h-3" /></button>
            </span>
          )}
          {brands.map((b) => (
            <span key={b} className="flex items-center gap-1 px-2 py-0.5 bg-primary-container/15 text-primary border border-primary-container/30 rounded-full text-xs">
              Marca: {b}
              <button onClick={() => removeBrand(b)}><X className="w-3 h-3" /></button>
            </span>
          ))}
          {supplierIds.map((id) => (
            <span key={id} className="flex items-center gap-1 px-2 py-0.5 bg-primary-container/15 text-primary border border-primary-container/30 rounded-full text-xs">
              Proveedor: {supplierOptions.find(s => s.value === id)?.label || id}
              <button onClick={() => removeSupplierId(id)}><X className="w-3 h-3" /></button>
            </span>
          ))}
          {categoryIds.map((id) => (
            <span key={id} className="flex items-center gap-1 px-2 py-0.5 bg-primary-container/15 text-primary border border-primary-container/30 rounded-full text-xs">
              Categoría: {categoryOptions.find(c => c.value === id)?.label || id}
              <button onClick={() => removeCategoryId(id)}><X className="w-3 h-3" /></button>
            </span>
          ))}
          {activeFilter && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-primary-container/15 text-primary border border-primary-container/30 rounded-full text-xs">
              {activeFilter === 'true' ? 'Con stock' : 'Sin stock'}
              <button onClick={() => onFilterChange({ active: '' })}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Selection bar */}
      {someSelected && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary-container/10 border border-primary-container/30 rounded-lg text-sm">
          <span className="text-on-surface font-medium">
            {selectAllByFilter
              ? `Todos los ${totalCount} productos seleccionados`
              : `${selectedIds.size} producto${selectedIds.size !== 1 ? 's' : ''} seleccionado${selectedIds.size !== 1 ? 's' : ''}`}
          </span>
          {!selectAllByFilter && allPageSelected && totalCount > products.length && (
            <button
              onClick={onSelectAllByFilter}
              className="text-primary underline text-xs hover:no-underline"
            >
              Seleccionar los {totalCount} que coinciden con los filtros
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onBulkPriceSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-container text-on-primary rounded-md text-xs font-medium hover:brightness-110 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Actualizar precios
            </button>
            <button onClick={onClearSelection} className="text-secondary hover:text-on-surface p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-outline-variant">
              <TableRow>
                <TableCell isHeader className="px-4 py-3 w-10">
                  <input
                    ref={headerCheckRef}
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    disabled={products.length === 0}
                    className="w-4 h-4 rounded border-outline-variant accent-primary cursor-pointer disabled:cursor-not-allowed"
                  />
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-secondary text-start text-xs uppercase tracking-wide">
                  Producto
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-secondary text-start text-xs uppercase tracking-wide">
                  Stock
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-secondary text-start text-xs uppercase tracking-wide">
                  Marca
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-secondary text-start text-xs uppercase tracking-wide">
                  Precio
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-secondary text-start text-xs uppercase tracking-wide">
                  Categoría
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-secondary text-start text-xs uppercase tracking-wide">
                  Proveedor
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-secondary text-start text-xs uppercase tracking-wide">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-outline-variant">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-8 text-center text-secondary">
                    Cargando productos...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-8 text-center text-secondary">
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const isSelected = selectAllByFilter || selectedIds.has(product.id);
                  const isActive = product.active !== false;
                  return (
                    <TableRow
                      key={product.id}
                      className={`transition-colors ${isSelected ? 'bg-primary-container/5' : 'hover:bg-surface-container-high/50'} ${!isActive ? 'opacity-60' : ''}`}
                    >
                      <TableCell className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onSelectProduct(product.id, e.target.checked)}
                          className="w-4 h-4 rounded border-outline-variant accent-primary cursor-pointer"
                        />
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                              style={{
                                outline: `2px solid ${isActive ? '#12b76a' : '#ef4444'}`,
                                outlineOffset: '2px',
                                boxShadow: `0 0 8px 2px ${isActive ? '#12b76a66' : '#ef444466'}`,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                outline: `2px solid ${isActive ? '#12b76a' : '#ef4444'}`,
                                outlineOffset: '2px',
                                boxShadow: `0 0 8px 2px ${isActive ? '#12b76a66' : '#ef444466'}`,
                                borderRadius: '9999px',
                              }}
                            >
                              {getProductIcon(product.name)}
                            </div>
                          )}
                          <div>
                            <span className="block font-medium text-on-surface text-sm">
                              {product.name}
                            </span>
                            <span className="block text-secondary text-xs font-mono">
                              {product.sku || '—'}
                            </span>
                            {!isActive && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-error-container text-on-error-container rounded">
                                Sin stock ({product.stock ?? 0})
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start">
                        <span className={`text-sm font-medium ${(product.stock ?? 0) === 0 ? 'text-error' : 'text-on-surface'}`}>
                          {product.stock ?? 0}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start">
                        <span className="text-on-surface text-sm">{product.brand || '—'}</span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start">
                        <span className="text-on-surface text-sm font-medium">{formatPrice(product.unit_price)}</span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start">
                        <span className="text-on-surface text-sm">{product.category_name || '—'}</span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start">
                        <span className="text-on-surface text-sm">{product.supplier_name || '—'}</span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start">
                        <div className="flex items-center gap-1.5">
                          {onView && (
                            <button
                              onClick={() => onView(product)}
                              className="p-1.5 text-secondary hover:text-primary rounded-md hover:bg-surface-container-high transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onEdit(product)}
                            className="p-1.5 text-secondary hover:text-on-surface rounded-md hover:bg-surface-container-high transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(product)}
                            className="p-1.5 text-secondary hover:text-error rounded-md hover:bg-error-container/20 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.current_page || 1}
            totalPages={pagination.total_pages || 1}
            totalItems={pagination.total_count || 0}
            itemsPerPage={pagination.per_page || 10}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ProductsTable;
