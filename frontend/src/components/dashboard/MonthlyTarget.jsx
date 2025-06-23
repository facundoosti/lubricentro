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
    <div className="p-4 bg-white rounded-lg shadow-md dark:bg-boxdark h-full">
      <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Objetivo Mensual</h2>
      
      {/* Revenue Target */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <DollarIcon className="text-green-600 size-5" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ingresos
            </span>
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-white">
            ${revenueCurrent.toLocaleString()} / ${revenueTarget.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(revenuePercentage, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {revenuePercentage}% completado
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ${(revenueTarget - revenueCurrent).toLocaleString()} restante
          </span>
        </div>
      </div>

      {/* Services Target */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Servicios
          </span>
          <span className="text-sm font-bold text-gray-800 dark:text-white">
            {servicesCurrent} / {servicesTarget}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(servicesPercentage, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {servicesPercentage}% completado
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {servicesTarget - servicesCurrent} restantes
          </span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTarget; 