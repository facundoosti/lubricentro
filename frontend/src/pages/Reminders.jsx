import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck, Clock, AlertCircle, Search, Filter, Send } from "lucide-react";
import { useServiceReminders, useReminderStatistics } from "@services/remindersService";
import PageError from "@ui/PageError";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_CONFIG = {
  sent: {
    label: "Enviado",
    classes: "bg-tertiary/10 text-tertiary",
    dot: "bg-tertiary",
  },
  pending: {
    label: "Pendiente",
    classes: "bg-amber-400/10 text-amber-400",
    dot: "bg-amber-400",
  },
  failed: {
    label: "Fallido",
    classes: "bg-error/10 text-error",
    dot: "bg-error",
  },
};

const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const fmt = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const fmtDatetime = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StatCard = ({ icon, label, value, iconClass }) => (
  <div className="bg-surface-container-low border border-outline-variant p-6 rounded-xl flex items-center gap-5">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${iconClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-black text-on-surface">{value ?? "—"}</p>
    </div>
  </div>
);

const Reminders = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pendingStatus, setPendingStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pendingStartDate, setPendingStartDate] = useState("");
  const [pendingEndDate, setPendingEndDate] = useState("");
  const perPage = 10;

  const filters = { search, status, start_date: startDate, end_date: endDate, page: currentPage, per_page: perPage };
  const { data, isLoading, error } = useServiceReminders(filters);
  const { data: statsData } = useReminderStatistics();

  const reminders = data?.data?.service_reminders || [];
  const pagination = data?.data?.pagination;
  const stats = statsData?.data || {};

  const handleFilter = () => {
    setSearch(pendingSearch);
    setStatus(pendingStatus);
    setStartDate(pendingStartDate);
    setEndDate(pendingEndDate);
    setCurrentPage(1);
  };

  if (error) {
    return (
      <PageError
        title="Error al cargar los recordatorios"
        message={error.message || "Ha ocurrido un error inesperado"}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black tracking-tight text-on-surface mb-1">
          Recordatorios de Service
        </h2>
        <p className="text-on-surface-variant text-sm flex items-center gap-2">
          <Send className="w-4 h-4 text-primary" />
          Envíos automáticos por WhatsApp cuando el próximo service se acerca
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Enviados este mes"
          value={stats.sent_this_month}
          iconClass="bg-violet-400/10 text-primary"
          icon={<CheckCheck className="w-7 h-7" />}
        />
        <StatCard
          label="Pendientes"
          value={stats.pending}
          iconClass="bg-amber-400/10 text-amber-400"
          icon={<Clock className="w-7 h-7" />}
        />
        <StatCard
          label="Fallidos"
          value={stats.failed}
          iconClass="bg-error/10 text-error"
          icon={<AlertCircle className="w-7 h-7" />}
        />
      </div>

      {/* Filters */}
      <div className="bg-surface-container border border-outline-variant p-4 rounded-xl flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input
            type="text"
            placeholder="Cliente o Patente..."
            value={pendingSearch}
            onChange={(e) => setPendingSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="relative">
          <select
            value={pendingStatus}
            onChange={(e) => setPendingStatus(e.target.value)}
            className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 pr-8 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Todos los estados</option>
            <option value="sent">Enviado</option>
            <option value="pending">Pendiente</option>
            <option value="failed">Fallido</option>
          </select>
        </div>

        <input
          type="date"
          value={pendingStartDate}
          onChange={(e) => setPendingStartDate(e.target.value)}
          className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          type="date"
          value={pendingEndDate}
          onChange={(e) => setPendingEndDate(e.target.value)}
          className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
        />

        <button
          onClick={handleFilter}
          className="bg-primary-container text-on-primary px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:brightness-110 transition-all"
        >
          <Filter className="w-4 h-4" />
          Filtrar
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high border-b border-outline-variant">
              {["Cliente", "Vehículo", "Próximo Service", "Enviado el", "Estado", "Acciones"].map(
                (col, i) => (
                  <th
                    key={col}
                    className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest text-on-surface-variant ${i === 5 ? "text-right" : ""}`}
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-secondary text-sm">
                  Cargando recordatorios...
                </td>
              </tr>
            ) : reminders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-secondary text-sm">
                  No hay recordatorios que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              reminders.map((reminder) => {
                const statusCfg = STATUS_CONFIG[reminder.status] || STATUS_CONFIG.pending;
                const customer = reminder.customer || {};
                const vehicle = reminder.vehicle || {};
                const serviceRecord = reminder.service_record || {};
                return (
                  <tr key={reminder.id} className="hover:bg-zinc-900/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-black text-xs flex-shrink-0">
                          {initials(customer.name)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">{customer.name}</p>
                          <p className="text-xs text-on-surface-variant">{customer.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-on-surface">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <span className="text-[11px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded inline-block mt-0.5">
                        {vehicle.license_plate}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface font-medium">
                      {fmt(serviceRecord.next_service_date)}
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">
                      {fmtDatetime(reminder.sent_at)}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusCfg.classes}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => navigate(`/atenciones/${serviceRecord.id}/editar`)}
                        className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 justify-end ml-auto text-xs font-bold"
                      >
                        Ver registro
                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="bg-surface-container-high border-t border-outline-variant px-6 py-4 flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">
              Mostrando{" "}
              <span className="font-bold text-on-surface">{reminders.length}</span> de{" "}
              <span className="font-bold text-on-surface">{pagination.total_count}</span> registros
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-secondary hover:bg-surface-container-high disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded flex items-center justify-center text-xs font-black ${
                    page === currentPage
                      ? "bg-primary text-on-primary"
                      : "border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.total_pages, p + 1))}
                disabled={currentPage === pagination.total_pages}
                className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-secondary hover:bg-surface-container-high disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reminders;
