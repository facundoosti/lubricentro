import { ServiceIcon } from '@icons/index.jsx';
import { Bar } from 'react-chartjs-2';

const MonthlyServicesChart = ({ data }) => {
  const chartData = data || [
    { month: 'Ene', services: 45, revenue: 12500 },
    { month: 'Feb', services: 52, revenue: 13800 },
    { month: 'Mar', services: 48, revenue: 13200 },
    { month: 'Abr', services: 61, revenue: 15800 },
    { month: 'May', services: 55, revenue: 14500 },
    { month: 'Jun', services: 67, revenue: 17200 },
  ];

  const maxServices = Math.max(...chartData.map(item => item.services));

  return (
    <div className="p-4 bg-white rounded-lg shadow-md dark:bg-boxdark">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Servicios por Mes</h2>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <ServiceIcon className="text-blue-600 size-5" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Total: {chartData.reduce((sum, item) => sum + item.services, 0)} servicios
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
              {item.month}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.services / maxServices) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white min-w-[3rem]">
                  {item.services}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ${item.revenue.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyServicesChart; 