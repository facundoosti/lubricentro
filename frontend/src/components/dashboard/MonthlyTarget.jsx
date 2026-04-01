import { DollarIcon } from '@icons/index.jsx';

const MonthlyTarget = ({ data }) => {
  const targetData = data || {};
  const revenuePercentage = Math.round(targetData.revenue_percentage || 0);
  const servicesPercentage = Math.round(targetData.services_percentage || 0);
  
  // Valores con fallbacks para evitar errores
  const revenueCurrent = targetData.revenue_current || 0;
  const revenueTarget = targetData.revenue_target || 0;
  const servicesCurrent = targetData.services_current || 0;
  const servicesTarget = targetData.services_target || 0;

  return (
    <div className="p-5 bg-surface-container border border-outline-variant rounded-lg h-full">
      <h2 className="mb-4 text-lg font-semibold text-on-surface">Objetivo Mensual</h2>

      {/* Revenue Target */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <DollarIcon className="text-tertiary size-5" />
            <span className="text-sm font-medium text-on-surface-variant">
              Ingresos
            </span>
          </div>
          <span className="text-sm font-bold text-on-surface">
            ${revenueCurrent.toLocaleString()} / ${revenueTarget.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-surface-container-high rounded-full h-2">
          <div
            className="bg-tertiary h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(revenuePercentage, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-secondary">
            {revenuePercentage}% completado
          </span>
          <span className="text-xs text-secondary">
            ${(revenueTarget - revenueCurrent).toLocaleString()} restante
          </span>
        </div>
      </div>

      {/* Services Target */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-on-surface-variant">
            Servicios
          </span>
          <span className="text-sm font-bold text-on-surface">
            {servicesCurrent} / {servicesTarget}
          </span>
        </div>
        <div className="w-full bg-surface-container-high rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(servicesPercentage, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-secondary">
            {servicesPercentage}% completado
          </span>
          <span className="text-xs text-secondary">
            {servicesTarget - servicesCurrent} restantes
          </span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTarget; 