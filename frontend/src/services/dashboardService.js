import { useQuery } from '@tanstack/react-query';
import api from './api';

// Query keys para el dashboard
export const dashboardKeys = {
  all: ['dashboard'],
  stats: () => [...dashboardKeys.all, 'stats'],
};

// Hook para obtener estadísticas del dashboard
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      console.log('Fetching dashboard stats...');
      const response = await api.get('/dashboard/stats');
      console.log('Dashboard stats response:', response.data);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos
  });
};

// Función para formatear números como moneda argentina
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Función para formatear porcentajes
export const formatPercentage = (value) => {
  return `${value >= 0 ? '+' : ''}${value}%`;
};

// Función para obtener el color del badge según el cambio
export const getChangeColor = (change) => {
  if (change >= 0) return 'success';
  if (change < -10) return 'error';
  return 'warning';
};

// Función para obtener el estado del objetivo
export const getGoalStatus = (percentage) => {
  if (percentage >= 100) return 'success';
  if (percentage >= 70) return 'warning';
  return 'error';
}; 