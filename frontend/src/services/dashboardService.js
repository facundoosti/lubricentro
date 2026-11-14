import { useQuery } from '@tanstack/react-query';
import { api } from '@services/api';
import { appointmentKeys } from '@services/appointmentsService';

// Query keys para el dashboard
const dashboardKeys = {
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

// Hook para obtener los próximos turnos (próximos 3)
export const useUpcomingAppointments = () => {
  return useQuery({
    queryKey: appointmentKeys.upcoming(),
    queryFn: async () => {
      const response = await api.get('/appointments/upcoming', { params: { per_page: 3 } });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
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
