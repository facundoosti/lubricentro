import { ArrowDownIcon, ArrowUpIcon, GroupIcon, BoxIconLine, CalendarIcon, DollarIcon } from '@icons/index.jsx';
import Badge from '@ui/Badge';

const LubricentroMetrics = ({ data }) => {
  const metrics = [
    {
      title: 'Clientes',
      value: data?.customers || 0,
      change: data?.customers_change || 0,
      icon: GroupIcon,
      color: 'success'
    },
    {
      title: 'Vehículos',
      value: data?.vehicles || 0,
      change: data?.vehicles_change || 0,
      icon: BoxIconLine,
      color: 'success'
    },
    {
      title: 'Turnos Hoy',
      value: data?.appointments_today || 0,
      change: data?.appointments_change || 0,
      icon: CalendarIcon,
      color: 'warning'
    },
    {
      title: 'Ingresos Mes',
      value: `$${(data?.monthly_revenue || 0).toLocaleString()}`,
      change: data?.revenue_change || 0,
      icon: DollarIcon,
      color: 'success'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {metrics.map((metric, index) => (
        <div key={index} className="rounded-lg border border-outline-variant bg-surface-container p-5 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-surface-container-high rounded-xl">
            <metric.icon className="text-primary size-6" />
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-secondary">
                {metric.title}
              </span>
              <h4 className="mt-2 font-bold text-on-surface text-title-sm">
                {metric.value}
              </h4>
            </div>
            <Badge color={metric.change >= 0 ? 'success' : 'error'}>
              {metric.change >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {Math.abs(metric.change)}%
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LubricentroMetrics; 