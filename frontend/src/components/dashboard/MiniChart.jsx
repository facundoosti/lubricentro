import { BarChart2 } from 'lucide-react';
import { formatCurrency } from '@services/dashboardService';

const MiniChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { month: 'Nov', services: 0, revenue: 0 },
    { month: 'Dic', services: 0, revenue: 0 },
    { month: 'Ene', services: 0, revenue: 0 },
    { month: 'Feb', services: 0, revenue: 0 },
    { month: 'Mar', services: 0, revenue: 0 },
    { month: 'Abr', services: 0, revenue: 0 },
  ];

  const maxServices = Math.max(...chartData.map(d => d.services || 0), 1);
  const totalServices = chartData.reduce((s, d) => s + (d.services || 0), 0);
  const totalRevenue = chartData.reduce((s, d) => s + (d.revenue || 0), 0);

  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart2 size={15} className="text-primary" />
          <h2 className="text-sm font-semibold text-on-surface">Atenciones últimos 6 meses</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-secondary">
            Total: <span className="text-on-surface-variant font-medium">{totalServices} atenciones</span>
          </span>
          <span className="text-xs text-secondary">
            Ingresos: <span className="text-tertiary font-medium">{formatCurrency(totalRevenue)}</span>
          </span>
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-2 h-16">
        {chartData.map((item, i) => {
          const heightPct = maxServices > 0 ? ((item.services || 0) / maxServices) * 100 : 0;
          const isLast = i === chartData.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                <div className="bg-surface-container-high border border-outline-variant rounded-lg px-2 py-1.5 text-xs whitespace-nowrap shadow-lg">
                  <p className="text-on-surface font-semibold">{item.services} atenciones</p>
                  <p className="text-tertiary">{formatCurrency(item.revenue || 0)}</p>
                </div>
                <div className="w-2 h-2 bg-surface-container-high border-r border-b border-outline-variant rotate-45 -mt-1" />
              </div>

              {/* Bar */}
              <div className="w-full flex items-end" style={{ height: '48px' }}>
                <div
                  className={`w-full rounded-t transition-all duration-500 ${isLast ? 'bg-primary' : 'bg-primary/40'}`}
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
              </div>

              {/* Label */}
              <span className={`text-xs tabular-nums ${isLast ? 'text-primary font-semibold' : 'text-secondary'}`}>
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniChart;
