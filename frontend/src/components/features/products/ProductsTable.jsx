import React, { useState, useEffect, useRef } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@ui/Table";
import Pagination from "@ui/Pagination";
import { useSuppliers } from '@services/suppliersService';
import {
  Search, Plus, Edit, Trash2, Eye, Package, X, TrendingUp, ChevronDown,
} from "lucide-react";

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
  brand = '',
  supplierId = '',
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
  const [localBrand, setLocalBrand] = useState(brand);
  const headerCheckRef = useRef(null);

  const { data: suppliersData } = useSuppliers({ per_page: 200 });
  const suppliers = suppliersData?.data?.suppliers || [];

  // Sync local inputs when URL params change externally (browser back/forward)
  useEffect(() => { setLocalSearch(search); }, [search]);
  useEffect(() => { setLocalBrand(brand); }, [brand]);

  // Indeterminate state on header checkbox
  useEffect(() => {
    if (headerCheckRef.current) {
      const someChecked = products.some(p => selectedIds.has(p.id));
      headerCheckRef.current.indeterminate = someChecked && !allPageSelected;
    }
  }, [products, selectedIds, allPageSelected]);

  const applyTextFilters = () => {
    onFilterChange({ search: localSearch, brand: localBrand });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') applyTextFilters();
  };

  const handleClearFilter = (key) => {
    if (key === 'search') { setLocalSearch(''); onFilterChange({ search: '' }); }
    if (key === 'brand') { setLocalBrand(''); onFilterChange({ brand: '' }); }
    if (key === 'supplier_id') onFilterChange({ supplier_id: '' });
  };

  const hasActiveFilters = search || brand || supplierId;

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

  const selectionCount = selectAllByFilter ? totalCount : selectedIds.size;

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
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onBlur={applyTextFilters}
            className="w-full pl-9 pr-8 py-2 text-sm bg-surface-variant border border-outline-variant rounded-lg text-on-surface placeholder:text-secondary focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {localSearch && (
            <button onClick={() => handleClearFilter('search')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Brand */}
        <div className="relative sm:w-44">
          <input
            type="text"
            placeholder="Marca..."
            value={localBrand}
            onChange={(e) => setLocalBrand(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onBlur={applyTextFilters}
            className="w-full px-3 pr-8 py-2 text-sm bg-surface-variant border border-outline-variant rounded-lg text-on-surface placeholder:text-secondary focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {localBrand && (
            <button onClick={() => handleClearFilter('brand')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Supplier */}
        <div className="relative sm:w-52">
          <select
            value={supplierId}
            onChange={(e) => onFilterChange({ supplier_id: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-surface-variant border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
          >
            <option value="">Todos los proveedores</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" />
        </div>

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
              <button onClick={() => handleClearFilter('search')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {brand && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-primary-container/15 text-primary border border-primary-container/30 rounded-full text-xs">
              Marca: {brand}
              <button onClick={() => handleClearFilter('brand')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {supplierId && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-primary-container/15 text-primary border border-primary-container/30 rounded-full text-xs">
              Proveedor: {suppliers.find(s => String(s.id) === supplierId)?.name || supplierId}
              <button onClick={() => handleClearFilter('supplier_id')}><X className="w-3 h-3" /></button>
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
                  Marca
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-secondary text-start text-xs uppercase tracking-wide">
                  Precio
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-secondary text-start text-xs uppercase tracking-wide">
                  Unidad
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-secondary text-start text-xs uppercase tracking-wide">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-outline-variant">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-secondary">
                    Cargando productos...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-secondary">
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const isSelected = selectAllByFilter || selectedIds.has(product.id);
                  return (
                    <TableRow
                      key={product.id}
                      className={`transition-colors ${isSelected ? 'bg-primary-container/5' : 'hover:bg-surface-container-high/50'}`}
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
                                outline: `2px solid ${product.available !== false ? '#12b76a' : '#ef4444'}`,
                                outlineOffset: '2px',
                                boxShadow: `0 0 8px 2px ${product.available !== false ? '#12b76a66' : '#ef444466'}`,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                outline: `2px solid ${product.available !== false ? '#12b76a' : '#ef4444'}`,
                                outlineOffset: '2px',
                                boxShadow: `0 0 8px 2px ${product.available !== false ? '#12b76a66' : '#ef444466'}`,
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
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start">
                        <span className="text-on-surface text-sm">{product.brand || '—'}</span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start">
                        <span className="text-on-surface text-sm font-medium">{formatPrice(product.unit_price)}</span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start">
                        <span className="text-on-surface text-sm">{product.unit || '—'}</span>
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
