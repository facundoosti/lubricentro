import { DollarIcon } from '@icons/index.jsx';

const MonthlyTarget = ({ data }) => {
  const targetData = data || {
    target: 50000,
    current: 35000,
    percentage: 70,
    servicesCompleted: 45,
    servicesTarget: 60
  };

  const revenuePercentage = Math.round((targetData.current / targetData.target) * 100);
  const servicesPercentage = Math.round((targetData.servicesCompleted / targetData.servicesTarget) * 100);

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
            ${targetData.current.toLocaleString()} / ${targetData.target.toLocaleString()}
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
            ${(targetData.target - targetData.current).toLocaleString()} restante
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
            {targetData.servicesCompleted} / {targetData.servicesTarget}
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
            {targetData.servicesTarget - targetData.servicesCompleted} restantes
          </span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTarget; 