import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Pencil, Trash2, Search } from "lucide-react";
import { useBudgets, useDeleteBudget } from "@services/budgetsService";
import {
  showBudgetSuccess,
  showBudgetError,
  parseApiError,
} from "@services/notificationService";
import PageHeader from "@ui/PageHeader";
import PageError from "@ui/PageError";
import ConfirmModal from "@ui/ConfirmModal";
import BudgetActions from "@components/features/budgets/BudgetActions";
import BudgetStatusSelect from "@components/features/budgets/BudgetStatusSelect";
import BudgetStatusFilter from "@components/features/budgets/BudgetStatusFilter";

const formatCurrency = (value) => {
  if (!value && value !== 0) return "—";
  return `$${Number(value).toLocaleString("es-AR")}`;
};

const formatDate = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const Budgets = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [perPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, error } = useBudgets({
    page: currentPage,
    per_page: perPage,
    search: searchTerm,
    status: statusFilter,
  });

  const deleteMutation = useDeleteBudget();

  const budgets = data?.data?.budgets || [];
  const pagination = data?.data?.pagination;

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      showBudgetSuccess("DELETED");
    } catch (err) {
      showBudgetError(
        "ERROR_DELETE",
        parseApiError(err),
      );
    }
  };

  if (error) {
    return (
      <PageError
        title="Error al cargar los presupuestos"
        message={error.message || "Ha ocurrido un error inesperado"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presupuestos"
        description="Armá y enviá presupuestos para tus clientes"
      />

      {/* Toolbar */}
      <div id="tour-budgets-toolbar" className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input
            type="text"
            placeholder="Buscar por cliente o vehículo..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
          />
        </div>
        <button
          id="tour-budgets-new-btn"
          onClick={() => navigate("/budgets/new")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary rounded-lg font-semibold text-sm hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nuevo Presupuesto
        </button>
      </div>

      <BudgetStatusFilter value={statusFilter} onChange={handleStatusFilter} />

      {/* Table */}
      <div id="tour-budgets-table" className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-high">
                <th className="text-left px-4 py-3 text-secondary font-medium">
                  Fecha
                </th>
                <th className="text-left px-4 py-3 text-secondary font-medium">
                  Cliente / Vehículo
                </th>
                <th className="text-left px-4 py-3 text-secondary font-medium">
                  Estado
                </th>
                <th className="text-right px-4 py-3 text-secondary font-medium">
                  Efectivo / Débito
                </th>
                <th className="text-right px-4 py-3 text-secondary font-medium">
                  Tarjeta
                </th>
                <th className="text-right px-4 py-3 text-secondary font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-outline-variant animate-pulse"
                  >
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-surface-container-high rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : budgets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-secondary">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>{statusFilter || searchTerm ? "No hay presupuestos con esos filtros" : "No hay presupuestos registrados"}</p>
                  </td>
                </tr>
              ) : (
                budgets.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-outline-variant hover:bg-surface-container-high transition-colors"
                  >
                    <td className="px-4 py-3 text-on-surface">
                      {formatDate(p.date)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-on-surface font-medium">
                        {p.customer?.name || "—"}
                      </div>
                      <div className="text-secondary text-xs">
                        {p.vehicle_description || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <BudgetStatusSelect budget={p} />
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface font-medium">
                      {formatCurrency(p.total_list)}
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface font-medium">
                      {formatCurrency(p.total_card)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <BudgetActions budget={p} compact />
                        <button
                          onClick={() =>
                            navigate(`/budgets/${p.id}/edit`)
                          }
                          className="p-1.5 rounded hover:bg-surface-container-high text-secondary hover:text-on-surface transition-colors"
                          title="Editar"
                          aria-label="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded hover:bg-error-container/20 text-secondary hover:text-error transition-colors"
                          title="Eliminar"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant">
            <span className="text-sm text-secondary">
              {pagination.total_count} presupuestos
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 text-sm rounded border border-outline-variant text-secondary hover:text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm text-on-surface">
                {currentPage} / {pagination.total_pages}
              </span>
              <button
                disabled={currentPage === pagination.total_pages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 text-sm rounded border border-outline-variant text-secondary hover:text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar presupuesto"
        message={`¿Estás seguro de que querés eliminar el presupuesto del ${formatDate(deleteTarget?.date)}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Budgets;
