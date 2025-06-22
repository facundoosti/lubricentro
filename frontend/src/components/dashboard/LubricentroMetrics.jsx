import { ArrowDownIcon, ArrowUpIcon, GroupIcon, BoxIconLine, CalendarIcon, DollarIcon } from '@icons/index.jsx';
import Badge from '@ui/Badge';

const LubricentroMetrics = ({ data }) => {
  const metrics = [
    {
      title: 'Clientes',
      value: data?.customers || 0,
      change: data?.customersChange || 0,
      icon: GroupIcon,
      color: 'success'
    },
    {
      title: 'Vehículos',
      value: data?.vehicles || 0,
      change: data?.vehiclesChange || 0,
      icon: BoxIconLine,
      color: 'success'
    },
    {
      title: 'Turnos Hoy',
      value: data?.appointmentsToday || 0,
      change: data?.appointmentsChange || 0,
      icon: CalendarIcon,
      color: 'warning'
    },
    {
      title: 'Ingresos Mes',
      value: `$${data?.monthlyRevenue?.toLocaleString() || 0}`,
      change: data?.revenueChange || 0,
      icon: DollarIcon,
      color: 'success'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {metrics.map((metric, index) => (
        <div key={index} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <metric.icon className="text-gray-800 size-6 dark:text-white/90" />
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {metric.title}
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
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