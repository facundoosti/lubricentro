import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Pencil, Trash2, Printer, Search } from "lucide-react";
import { useBudgets, useDeleteBudget } from "@services/budgetsService";
import {
  showBudgetSuccess,
  showBudgetError,
} from "@services/notificationService";
import PageHeader from "@ui/PageHeader";
import PageError from "@ui/PageError";
import ConfirmModal from "@ui/ConfirmModal";

const STATUS_LABELS = {
  draft: {
    label: "Borrador",
    className:
      "bg-surface-container-high text-secondary border border-outline-variant",
  },
  sent: { label: "Enviado", className: "bg-primary-container/20 text-primary" },
  approved: {
    label: "Aprobado",
    className: "bg-tertiary-container/20 text-tertiary",
  },
  rejected: {
    label: "bg-error-container text-on-error-container",
    label2: "Rechazado",
  },
};

const StatusBadge = ({ status }) => {
  const map = {
    draft: {
      label: "Borrador",
      cls: "bg-surface-container-high text-secondary border border-outline-variant",
    },
    sent: { label: "Enviado", cls: "bg-primary-container/20 text-primary" },
    approved: {
      label: "Aprobado",
      cls: "bg-tertiary-container/20 text-tertiary",
    },
    rejected: {
      label: "Rechazado",
      cls: "bg-error-container text-on-error-container",
    },
  };
  const { label, cls } = map[status] ?? {
    label: status,
    cls: "text-secondary",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
};

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
  const [perPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, error } = useBudgets({
    page: currentPage,
    per_page: perPage,
    search: searchTerm,
  });

  const deleteMutation = useDeleteBudget();

  const budgets = data?.data?.budgets || [];
  const pagination = data?.data?.pagination;

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
        err.response?.data?.message || err.message,
      );
    }
  };

  if (error) {
    return (
      <PageError
        title="Error al cargar los budgets"
        message={error.message || "Ha ocurrido un error inesperado"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presupuestos"
        description="Gestioná y generá budgets para tus clientes"
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
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
          onClick={() => navigate("/presupuestos/nuevo")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary rounded-lg font-semibold text-sm hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nuevo Presupuesto
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
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
                  Total Lista
                </th>
                <th className="text-right px-4 py-3 text-secondary font-medium">
                  Total Tarjeta
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
                    <p>No hay budgets registrados</p>
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
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface font-medium">
                      {formatCurrency(p.total_list)}
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface font-medium">
                      {formatCurrency(p.total_card)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            navigate(`/presupuestos/${p.id}/imprimir`)
                          }
                          className="p-1.5 rounded hover:bg-primary-container/20 text-secondary hover:text-primary transition-colors"
                          title="Imprimir"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/presupuestos/${p.id}/editar`)
                          }
                          className="p-1.5 rounded hover:bg-surface-container-high text-secondary hover:text-on-surface transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded hover:bg-error-container/20 text-secondary hover:text-error transition-colors"
                          title="Eliminar"
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
              {pagination.total_count} budgets
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
        title="Eliminar Budget"
        message={`¿Estás seguro de que querés eliminar el budget del ${formatDate(deleteTarget?.date)}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Budgets;
