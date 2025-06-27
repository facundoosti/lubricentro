import LubricentroMetrics from '@components/dashboard/LubricentroMetrics';
import MonthlyServicesChart from '@components/dashboard/MonthlyServicesChart';
import MonthlyTarget from '@components/dashboard/MonthlyTarget';
import RecentAppointments from '@components/dashboard/RecentAppointments';
import PageMeta from '@common/PageMeta';
import { useDashboardStats } from '@services/dashboardService';
import React from 'react';
import { useNotificationService } from '@services/notificationService';
import Button from '@ui/Button';
import CustomerSearchInput from '@components/features/customers/CustomerSearchInput';
import { useState } from 'react';

export default function Dashboard() {
  const { data, isLoading, isError, error } = useDashboardStats();
  const notification = useNotificationService();
  const [testCustomerId, setTestCustomerId] = useState('1'); // ID de prueba

  const testToasts = () => {
    // Probar diferentes tipos de toast
    notification.showSuccess('¡Operación exitosa!');
    
    setTimeout(() => {
      notification.showError('Error en la operación');
    }, 1000);
    
    setTimeout(() => {
      notification.showWarning('Advertencia importante');
    }, 2000);
    
    setTimeout(() => {
      notification.showInfo('Información del sistema');
    }, 3000);
    
    setTimeout(() => {
      const loadingToast = notification.showLoading('Procesando...');
      setTimeout(() => {
        notification.dismiss(loadingToast);
        notification.showSuccess('¡Proceso completado!');
      }, 2000);
    }, 4000);
  };

  const handleCustomerSelect = (customer) => {
    console.log('Customer selected:', customer);
    notification.showInfo(`Cliente seleccionado: ${customer.name}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <span className="font-bold text-lg">Error al cargar el dashboard</span>
        <span className="text-sm">{error?.message || 'Ocurrió un error inesperado.'}</span>
      </div>
    );
  }

  const dashboardData = data?.data || {};

  return (
    <>
      <PageMeta
        title="Dashboard - Sistema Lubricentro"
        description="Panel de control del sistema de gestión para lubricentro"
      />
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Dashboard - Lubricentro
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Resumen de actividades y métricas del lubricentro
          </p>
        </div>

        {/* Botones de prueba para el sistema de toast */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Prueba del Sistema de Toast
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => notification.showSuccess('¡Operación exitosa!')}
              variant="primary"
            >
              Toast Success
            </Button>
            
            <Button
              onClick={() => notification.showError('Error en la operación')}
              variant="danger"
            >
              Toast Error
            </Button>
            
            <Button
              onClick={() => notification.showWarning('Advertencia importante')}
              variant="warning"
            >
              Toast Warning
            </Button>
            
            <Button
              onClick={() => notification.showInfo('Información del sistema')}
              variant="secondary"
            >
              Toast Info
            </Button>
            
            <Button
              onClick={() => {
                const loadingToast = notification.showLoading('Procesando...');
                setTimeout(() => {
                  notification.dismiss(loadingToast);
                  notification.showSuccess('¡Proceso completado!');
                }, 2000);
              }}
              variant="primary"
            >
              Toast Loading
            </Button>
            
            <Button
              onClick={testToasts}
              variant="secondary"
            >
              Probar Todos
            </Button>
          </div>
        </div>

        {/* Prueba del CustomerSearchInput */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Prueba del CustomerSearchInput
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Customer ID de prueba:
              </label>
              <input
                type="text"
                value={testCustomerId}
                onChange={(e) => setTestCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Ingresa un customer ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CustomerSearchInput con ID: {testCustomerId}
              </label>
              <CustomerSearchInput
                value={testCustomerId}
                onChange={(value) => {
                  console.log('CustomerSearchInput onChange:', value);
                  setTestCustomerId(value);
                }}
                onSelect={handleCustomerSelect}
                placeholder="Buscar cliente..."
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Métricas principales */}
          <div className="col-span-12 space-y-6 xl:col-span-7">
            <LubricentroMetrics data={dashboardData.metrics} />
            <MonthlyServicesChart data={dashboardData.trends?.monthly_services} />
          </div>

          {/* Objetivo mensual */}
          <div className="col-span-12 xl:col-span-5">
            <MonthlyTarget data={dashboardData.goals} />
          </div>

          {/* Turnos recientes */}
          <div className="col-span-12 xl:col-span-7">
            <RecentAppointments data={dashboardData.recent_activity?.today_appointments} />
          </div>
        </div>
      </div>
    </>
  );
} 