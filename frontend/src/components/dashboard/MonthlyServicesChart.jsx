import { ServiceIcon } from '@icons/index.jsx';

const MonthlyServicesChart = ({ data }) => {
  const chartData = Array.isArray(data) ? data : [
    { month: 'Ene', services: 45, revenue: 12500 },
    { month: 'Feb', services: 52, revenue: 13800 },
    { month: 'Mar', services: 48, revenue: 13200 },
    { month: 'Abr', services: 61, revenue: 15800 },
    { month: 'May', services: 55, revenue: 14500 },
    { month: 'Jun', services: 67, revenue: 17200 },
  ];

  const maxServices = chartData.length > 0 ? Math.max(...chartData.map(item => item.services || 0)) : 1;

  return (
    <div className="p-5 bg-surface-container border border-outline-variant rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-on-surface">Servicios por Mes</h2>
        <div className="flex items-center gap-1 text-sm text-secondary">
          <ServiceIcon className="text-primary size-5" />
          <span>
            Total: {chartData.reduce((sum, item) => sum + (item.services || 0), 0)} servicios
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {chartData.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            No hay datos de servicios disponibles
          </div>
        ) : (
          chartData.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-12 text-sm font-medium text-on-surface-variant">
                {item.month}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-surface-container-high rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((item.services || 0) / maxServices) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-on-surface min-w-[3rem]">
                    {item.services || 0}
                  </span>
                </div>
                <div className="text-xs text-secondary mt-1">
                  ${(item.revenue || 0).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MonthlyServicesChart; 