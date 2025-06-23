import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@services/api';

// Query keys
export const appointmentKeys = {
  all: ['appointments'],
  lists: () => [...appointmentKeys.all, 'list'],
  list: (filters) => [...appointmentKeys.lists(), filters],
  details: () => [...appointmentKeys.all, 'detail'],
  detail: (id) => [...appointmentKeys.details(), id],
  upcoming: () => [...appointmentKeys.all, 'upcoming'],
};

// API functions
const appointmentsApi = {
  // Get all appointments with filters
  getAppointments: async (params = {}) => {
    console.log("API call getAppointments with:", params);
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  // Get single appointment
  getAppointment: async (id) => {
    console.log("API call getAppointment with:", id);
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Create appointment
  createAppointment: async (data) => {
    console.log("API call createAppointment with:", data);
    const response = await api.post('/appointments', { appointment: data });
    return response.data;
  },

  // Update appointment
  updateAppointment: async ({ id, data }) => {
    console.log("API call updateAppointment with:", { id, data });
    const response = await api.put(`/appointments/${id}`, { appointment: data });
    return response.data;
  },

  // Delete appointment
  deleteAppointment: async (id) => {
    console.log("API call deleteAppointment with:", id);
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },

  // Get upcoming appointments
  getUpcomingAppointments: async (params = {}) => {
    console.log("API call getUpcomingAppointments with:", params);
    const response = await api.get('/appointments/upcoming', { params });
    return response.data;
  },

  // Confirm appointment
  confirmAppointment: async (id) => {
    console.log("API call confirmAppointment with:", id);
    const response = await api.patch(`/appointments/${id}/confirm`);
    return response.data;
  },

  // Complete appointment
  completeAppointment: async (id) => {
    console.log("API call completeAppointment with:", id);
    const response = await api.patch(`/appointments/${id}/complete`);
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id) => {
    console.log("API call cancelAppointment with:", id);
    const response = await api.patch(`/appointments/${id}/cancel`);
    return response.data;
  },
};

// React Query hooks
export const useAppointments = (filters = {}) => {
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => appointmentsApi.getAppointments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAppointment = (id) => {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentsApi.getAppointment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpcomingAppointments = (filters = {}) => {
  return useQuery({
    queryKey: appointmentKeys.upcoming(),
    queryFn: () => appointmentsApi.getUpcomingAppointments(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appointmentsApi.createAppointment,
    onSuccess: (data) => {
      console.log("Appointment created successfully:", data);
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      throw error;
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appointmentsApi.updateAppointment,
    onSuccess: (data, variables) => {
      console.log("Appointment updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
    },
    onError: (error) => {
      console.error('Error updating appointment:', error);
      throw error;
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appointmentsApi.deleteAppointment,
    onSuccess: (data) => {
      console.log("Appointment deleted successfully:", data);
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
    },
    onError: (error) => {
      console.error('Error deleting appointment:', error);
      throw error;
    },
  });
};

export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appointmentsApi.confirmAppointment,
    onSuccess: (data) => {
      console.log("Appointment confirmed successfully:", data);
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
    },
    onError: (error) => {
      console.error('Error confirming appointment:', error);
      throw error;
    },
  });
};

export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appointmentsApi.completeAppointment,
    onSuccess: (data) => {
      console.log("Appointment completed successfully:", data);
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
    },
    onError: (error) => {
      console.error('Error completing appointment:', error);
      throw error;
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appointmentsApi.cancelAppointment,
    onSuccess: (data) => {
      console.log("Appointment cancelled successfully:", data);
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
    },
    onError: (error) => {
      console.error('Error cancelling appointment:', error);
      throw error;
    },
  });
}; 