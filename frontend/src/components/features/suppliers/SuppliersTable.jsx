import { useState } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@ui/Table';
import Button from '@ui/Button';
import Pagination from '@ui/Pagination';
import { Search, Plus, Edit, Trash2, Truck, Package } from 'lucide-react';

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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
          </form>
        </div>

        <Button
          onClick={onCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Proveedor
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  CUIT
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Contacto
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Dirección
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Productos
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500">
                    Cargando proveedores...
                  </TableCell>
                </TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500">
                    No se encontraron proveedores
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    {/* Proveedor */}
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="block font-medium text-gray-800 text-sm dark:text-white/90">
                          {supplier.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* CUIT */}
                    <TableCell className="px-4 py-3 text-start">
                      <span className="text-gray-800 text-sm dark:text-white/90 font-mono">
                        {supplier.cuit || '—'}
                      </span>
                    </TableCell>

                    {/* Contacto */}
                    <TableCell className="px-4 py-3 text-start">
                      <div className="space-y-0.5">
                        {supplier.phone && (
                          <p className="text-gray-800 text-sm dark:text-white/90">{supplier.phone}</p>
                        )}
                        {supplier.email && (
                          <p className="text-gray-500 text-xs dark:text-gray-400 truncate max-w-[200px]">{supplier.email}</p>
                        )}
                        {!supplier.phone && !supplier.email && (
                          <span className="text-gray-500 text-sm dark:text-gray-400">—</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Dirección */}
                    <TableCell className="px-4 py-3 text-start">
                      <span className="text-gray-800 text-sm dark:text-white/90 truncate max-w-[200px] block">
                        {supplier.address || '—'}
                      </span>
                    </TableCell>

                    {/* Productos */}
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                        <Package className="w-3.5 h-3.5" />
                        <span>{supplier.products_count ?? 0}</span>
                      </div>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(supplier)}
                          className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(supplier)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
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
