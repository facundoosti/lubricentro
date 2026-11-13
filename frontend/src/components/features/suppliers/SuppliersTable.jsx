import { useState } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@ui/Table';
import Button from '@ui/Button';
import Pagination from '@ui/Pagination';
import { Search, Plus, Edit, Trash2, Truck, Package } from 'lucide-react';
import Input from '@ui/Input';

const SuppliersTable = ({
  suppliers = [],
  pagination = {},
  onPageChange,
  onSearch,
  onEdit,
  onDelete,
  onCreate,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y botón crear */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Input
              startIcon={Search}
              autoComplete="off"
              placeholder="Buscar proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>

        <Button
          onClick={onCreate}
          className="flex items-center gap-2 bg-primary-container hover:bg-primary-container/90 text-white"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-outline-variant">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs">
                  Proveedor
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs">
                  CUIT
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs">
                  Contacto
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs">
                  Dirección
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs">
                  Productos
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-outline-variant">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-on-surface-variant">
                    Cargando proveedores...
                  </TableCell>
                </TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-on-surface-variant">
                    No se encontraron proveedores
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="hover:bg-surface-container-high">
                    {/* Proveedor */}
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                          <Truck className="w-5 h-5 text-purple-500" />
                        </div>
                        <span className="block font-medium text-on-surface text-sm">
                          {supplier.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* CUIT */}
                    <TableCell className="px-4 py-3 text-start">
                      <span className="text-on-surface text-sm font-mono">
                        {supplier.cuit || '—'}
                      </span>
                    </TableCell>

                    {/* Contacto */}
                    <TableCell className="px-4 py-3 text-start">
                      <div className="space-y-0.5">
                        {supplier.phone && (
                          <p className="text-on-surface text-sm">{supplier.phone}</p>
                        )}
                        {supplier.email && (
                          <p className="text-on-surface-variant text-xs truncate max-w-[200px]">{supplier.email}</p>
                        )}
                        {!supplier.phone && !supplier.email && (
                          <span className="text-on-surface-variant text-sm">—</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Dirección */}
                    <TableCell className="px-4 py-3 text-start">
                      <span className="text-on-surface text-sm truncate max-w-[200px] block">
                        {supplier.address || '—'}
                      </span>
                    </TableCell>

                    {/* Productos */}
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-1.5 text-on-surface-variant text-sm">
                        <Package className="w-3.5 h-3.5" />
                        <span>{supplier.products_count ?? 0}</span>
                      </div>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(supplier)}
                          className="p-1 text-secondary hover:text-primary"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(supplier)}
                          className="p-1 text-secondary hover:text-error"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginación */}
      {pagination && pagination.total_pages > 1 && (
        <div className="mt-6">
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

export default SuppliersTable;
