import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@ui/Table";
import Badge from "@ui/Badge";
import Button from "@ui/Button";
import Pagination from "@ui/Pagination";
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  Eye
} from "lucide-react";

const CustomersTable = ({ 
  customers = [], 
  pagination = {},
  onPageChange,
  onSearch,
  onEdit,
  onDelete,
  onCreate,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Debug logs para paginación
  console.log("CustomersTable - pagination prop:", pagination);
  console.log("CustomersTable - pagination.total_pages:", pagination.total_pages);
  console.log("CustomersTable - pagination.current_page:", pagination.current_page);
  console.log("CustomersTable - pagination.total_count:", pagination.total_count);
  console.log("CustomersTable - pagination.per_page:", pagination.per_page);
  console.log("CustomersTable - should show pagination:", pagination && pagination.total_pages > 1);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewCustomer = (customer) => {
    navigate(`/customers/${customer.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y botón crear */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
              <input
                autoComplete="off"
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </form>
        </div>
        
        <Button
          id="tour-customers-new-btn"
          onClick={onCreate}
          className="flex items-center gap-2 bg-primary-container hover:bg-primary-container/90 text-white"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-outline-variant">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs"
                >
                  Cliente
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs"
                >
                  Contacto
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs"
                >
                  Teléfono
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs"
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-outline-variant">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-on-surface-variant">
                    Cargando clientes...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-on-surface-variant">
                    No se encontraron clientes
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-surface-container-high">
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        {customer.avatar_url ? (
                          <img
                            src={customer.avatar_url}
                            alt={customer.name}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-medium text-sm">
                              {getInitials(customer.name)}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="block font-medium text-on-surface text-sm">
                            {customer.name}
                          </span>
                          <span className="block text-on-surface-variant text-xs">
                            ID: {customer.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="text-on-surface text-sm">
                            {customer.email}
                          </div>
                        )}
                        {customer.address && (
                          <div className="text-on-surface-variant text-xs truncate max-w-xs">
                            {customer.address}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-start">
                      <div className="text-on-surface text-sm">
                        {customer.phone || "-"}
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="p-1 text-secondary hover:text-primary"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(customer)}
                          className="p-1 text-secondary hover:text-primary"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(customer)}
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

export default CustomersTable; 