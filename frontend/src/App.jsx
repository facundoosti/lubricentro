import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from '@contexts/QueryProvider';
import { AuthProvider } from '@contexts/AuthContext';
import ProtectedRoute from '@common/ProtectedRoute';
import Layout from '@layout/Layout';
import Login from '@pages/Login';
import Dashboard from '@pages/Dashboard';
import Services from '@pages/Services';
import Customers from '@pages/Customers';
import CustomerProfile from '@pages/CustomerProfile';
import Vehicles from '@pages/Vehicles';
import Products from '@pages/Products';
import ServiceRecords from '@pages/ServiceRecords';
import Appointments from '@pages/Appointments';

function App() {
  console.log('App renderizado');
  return (
    <AuthProvider>
      <QueryProvider>
        <Router>
          <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />
            
            {/* Ruta raíz - redirigir a dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Rutas protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="service-records" element={<ServiceRecords />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/:id" element={<CustomerProfile />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="services" element={<Services />} />
              <Route path="products" element={<Products />} />
              <Route path="settings" element={<div className="p-6 text-black dark:text-white">Configuración - En desarrollo</div>} />
            </Route>
            
            {/* Ruta 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
        
        {/* Toaster para notificaciones */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </QueryProvider>
    </AuthProvider>
  );
}

export default App;
