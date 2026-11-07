import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ClipboardList, FileText, CalendarDays, Plus } from 'lucide-react';
import { useServiceRecords } from '@services/serviceRecordsService';
import { useBudgets } from '@services/budgetsService';
import { useAppointments } from '@services/appointmentsService';
import { formatCurrency } from '@utils/money';

const HISTORY_LIMIT = 5;

const formatDate = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

// Fecha local (YYYY-MM-DD): toISOString usa UTC y de noche en Argentina ya devuelve mañana
const isoDate = (date) =>
  [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');

const vehicleLabel = (vehicle) =>
  vehicle ? `${vehicle.brand} ${vehicle.model} · ${vehicle.license_plate}` : null;

const TabState = ({ children }) => (
  <p className="py-8 text-center text-sm text-on-surface-variant">{children}</p>
);

// Lista con estados de carga / error / vacío compartidos por las tres pestañas.
// Sin onViewAll no hay "Ver todos" (ej. Turnos: /appointments no filtra por cliente).
const HistoryList = ({ query, items, emptyText, emptyAction, renderRow, onViewAll }) => {
  if (query.isLoading) return <TabState>Cargando...</TabState>;
  if (query.isError) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-error">No se pudo cargar el historial.</p>
        <button type="button" onClick={() => query.refetch()} className="mt-2 text-sm font-medium text-primary hover:underline">
          Reintentar
        </button>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <p className="text-sm text-on-surface-variant">{emptyText}</p>
        {emptyAction}
      </div>
    );
  }
  return (
    <div>
      <ul className="divide-y divide-outline-variant">{items.slice(0, HISTORY_LIMIT).map(renderRow)}</ul>
      {onViewAll && (
        <button type="button" onClick={onViewAll} className="mt-3 text-sm font-medium text-primary hover:underline">
          Ver todos
        </button>
      )}
    </div>
  );
};

const Row = ({ onClick, title, subtitle, aside }) => (
  <li>
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 py-3 text-left hover:bg-surface-container-high rounded px-2 -mx-2 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-on-surface truncate">{title}</p>
        {subtitle && <p className="text-xs text-on-surface-variant truncate">{subtitle}</p>}
      </div>
      {aside && <span className="shrink-0 text-sm text-on-surface-variant">{aside}</span>}
      <ChevronRight className="w-4 h-4 shrink-0 text-secondary" />
    </button>
  </li>
);

const ServiceRecordsTab = ({ customerId, navigate }) => {
  const query = useServiceRecords({ customer_id: customerId, per_page: HISTORY_LIMIT });
  return (
    <HistoryList
      query={query}
      items={query.data?.data?.service_records || []}
      emptyText="Este cliente todavía no tiene atenciones."
      emptyAction={
        <button
          type="button"
          onClick={() => navigate(`/service-records/new?customer_id=${customerId}`)}
          className="flex items-center gap-1.5 rounded bg-primary-container px-3 py-1.5 text-sm font-bold text-on-primary hover:brightness-110"
        >
          <Plus className="w-4 h-4" /> Nueva atención
        </button>
      }
      onViewAll={() => navigate(`/service-records?customer_id=${customerId}`)}
      renderRow={(record) => (
        <Row
          key={record.id}
          onClick={() => navigate(`/service-records/${record.id}/edit`)}
          title={formatDate(record.service_date)}
          subtitle={[vehicleLabel(record.vehicle), record.mileage && `${Number(record.mileage).toLocaleString('es-AR')} km`].filter(Boolean).join(' · ')}
          aside={formatCurrency(record.total_amount)}
        />
      )}
    />
  );
};

const BudgetsTab = ({ customerId, navigate }) => {
  const query = useBudgets({ customer_id: customerId, per_page: HISTORY_LIMIT });
  return (
    <HistoryList
      query={query}
      items={query.data?.data?.budgets || []}
      emptyText="Este cliente no tiene presupuestos."
      onViewAll={() => navigate(`/budgets?customer_id=${customerId}`)}
      renderRow={(budget) => (
        <Row
          key={budget.id}
          onClick={() => navigate(`/budgets/${budget.id}/edit`)}
          title={`#${budget.id} · ${formatDate(budget.date)}`}
          subtitle={[budget.status_label, budget.vehicle_description].filter(Boolean).join(' · ')}
          aside={formatCurrency(budget.total_list)}
        />
      )}
    />
  );
};

const AppointmentsTab = ({ customerId, navigate }) => {
  // Próximos primero: desde hoy, ordenados por fecha ascendente en el backend
  const [range] = useState(() => {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);
    return { start_date: isoDate(today), end_date: isoDate(nextYear) };
  });
  const query = useAppointments({ customer_id: customerId, per_page: HISTORY_LIMIT, ...range });
  const items = Array.isArray(query.data?.data) ? query.data.data : [];
  return (
    <HistoryList
      query={query}
      items={items}
      emptyText="No hay turnos próximos."
      renderRow={(appointment) => (
        <Row
          key={appointment.id}
          onClick={() => navigate('/appointments')}
          title={appointment.formatted_date || formatDate(appointment.scheduled_at)}
          subtitle={vehicleLabel(appointment.vehicle)}
          aside={appointment.display_status}
        />
      )}
    />
  );
};

const TABS = [
  { key: 'service_records', label: 'Atenciones', icon: ClipboardList, Panel: ServiceRecordsTab },
  { key: 'budgets', label: 'Presupuestos', icon: FileText, Panel: BudgetsTab },
  { key: 'appointments', label: 'Turnos', icon: CalendarDays, Panel: AppointmentsTab },
];

// Historial del cliente. Cada pestaña consulta su listado recién al abrirse.
const CustomerHistoryCard = ({ customerId }) => {
  const navigate = useNavigate();
  const [active, setActive] = useState(TABS[0].key);
  const { Panel } = TABS.find((tab) => tab.key === active);

  return (
    <section className="p-5 border border-outline-variant rounded-lg bg-surface-container lg:p-6">
      <h4 className="text-base font-semibold text-on-surface mb-4">Historial</h4>
      <div role="tablist" className="flex gap-1 border-b border-outline-variant">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active === key}
            onClick={() => setActive(key)}
            className={`flex min-w-0 flex-auto items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-1 py-2 text-xs sm:flex-none sm:px-3 sm:text-sm font-medium transition-colors ${
              active === key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Icon className="hidden w-4 h-4 shrink-0 sm:inline" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-2">
        <Panel customerId={customerId} navigate={navigate} />
      </div>
    </section>
  );
};

export default CustomerHistoryCard;
