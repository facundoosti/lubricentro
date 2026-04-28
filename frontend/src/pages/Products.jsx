import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { useCrudPage } from '@hooks/useCrudPage';
import { useModalError } from '@hooks/useModalError';
import PageHeader from '@ui/PageHeader';
import PageError from '@ui/PageError';
import ProductsTable from '@components/features/products/ProductsTable';
import ProductModal from '@components/features/products/ProductModal';
import ProductImportModal from '@components/features/products/ProductImportModal';
import BulkPriceModal from '@components/features/products/BulkPriceModal';
import ConfirmModal from '@ui/ConfirmModal';
import { useProducts, useDeleteProduct } from '@services/productsService';
import { showProductSuccess } from '@services/notificationService';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBulkPriceOpen, setIsBulkPriceOpen] = useState(false);
  const [bulkPriceTarget, setBulkPriceTarget] = useState(null);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAllByFilter, setSelectAllByFilter] = useState(false);
  const actionsRef = useRef(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const brand = searchParams.get('brand') || '';
  const supplierId = searchParams.get('supplier_id') || '';
  const perPage = 10;

  const setFilter = (updates) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value.toString());
        else next.delete(key);
      });
      if (!('page' in updates)) next.set('page', '1');
      return next;
    });
    setSelectedIds(new Set());
    setSelectAllByFilter(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setIsActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    isModalOpen, selectedItem,
    isDeleteModalOpen, itemToDelete,
    handleCreate, handleEdit, handleModalClose,
    handleDeleteRequest, handleDeleteModalClose,
  } = useCrudPage();

  const { handleError: handleDeleteError } = useModalError(handleDeleteModalClose);

  const { data: productsData, isLoading, error } = useProducts({
    page,
    per_page: perPage,
    search,
    brand,
    supplier_id: supplierId,
  });

  const deleteMutation = useDeleteProduct();

  const products = productsData?.data?.products || [];
  const pagination = productsData?.data?.pagination || {};
  const totalCount = pagination.total_count || 0;

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(itemToDelete.id);
      handleDeleteModalClose();
      showProductSuccess('DELETED');
    } catch (err) {
      handleDeleteError(err, 'Error al eliminar el producto');
    }
  };

  const handleSelectProduct = (id, checked) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
    if (!checked) setSelectAllByFilter(false);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(products.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
      setSelectAllByFilter(false);
    }
  };

  const handleSelectAllByFilter = () => setSelectAllByFilter(true);

  const handleClearSelection = () => {
    setSelectedIds(new Set());
    setSelectAllByFilter(false);
  };

  const handleOpenBulkPriceFromSelection = () => {
    if (selectAllByFilter) {
      setBulkPriceTarget({ type: 'filters', search, brand, supplierId });
    } else {
      setBulkPriceTarget({ type: 'ids', ids: [...selectedIds] });
    }
    setIsBulkPriceOpen(true);
  };

  const handleCloseBulkPrice = () => {
    setIsBulkPriceOpen(false);
    setBulkPriceTarget(null);
  };

  if (error) {
    return (
      <PageError
        title="Error al cargar productos"
        message={error.response?.data?.message || error.message}
      />
    );
  }

  const allPageSelected = products.length > 0 && products.every(p => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0 || selectAllByFilter;

  return (
    <div id="tour-products-page" className="p-6">
      <PageHeader
        title="Productos"
        description="Gestiona el catálogo de productos del lubricentro"
        actions={
          <div className="relative" ref={actionsRef}>
            <button
              onClick={() => setIsActionsOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-surface-container-high border border-outline-variant text-on-surface rounded-lg font-medium transition-colors hover:bg-surface-container"
            >
              Acciones
              <ChevronDown className={`w-4 h-4 transition-transform ${isActionsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isActionsOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-surface-container border border-outline-variant rounded-lg shadow-lg z-10 py-1">
                <button
                  onClick={() => { setBulkPriceTarget(null); setIsBulkPriceOpen(true); setIsActionsOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-secondary" />
                  Actualizar precios
                </button>
                <button
                  onClick={() => { setIsImportOpen(true); setIsActionsOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-secondary" />
                  Importar Excel
                </button>
              </div>
            )}
          </div>
        }
      />

      <ProductsTable
        products={products}
        pagination={pagination}
        loading={isLoading || deleteMutation.isPending}
        search={search}
        brand={brand}
        supplierId={supplierId}
        onFilterChange={setFilter}
        onPageChange={(p) => setFilter({ page: p })}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onCreate={handleCreate}
        selectedIds={selectedIds}
        selectAllByFilter={selectAllByFilter}
        allPageSelected={allPageSelected}
        someSelected={someSelected}
        totalCount={totalCount}
        onSelectProduct={handleSelectProduct}
        onSelectAll={handleSelectAll}
        onSelectAllByFilter={handleSelectAllByFilter}
        onClearSelection={handleClearSelection}
        onBulkPriceSelected={handleOpenBulkPriceFromSelection}
      />

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={selectedItem}
        onSuccess={handleModalClose}
      />

      <ProductImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      <BulkPriceModal
        isOpen={isBulkPriceOpen}
        onClose={handleCloseBulkPrice}
        target={bulkPriceTarget}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Producto"
        message={`¿Estás seguro de que quieres eliminar el producto ${itemToDelete?.name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Products;
