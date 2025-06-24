import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from '@contexts/QueryProvider';
import Layout from '@layout/Layout';
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
    <QueryProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="service-records" element={<ServiceRecords />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerProfile />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="services" element={<Services />} />
            <Route path="products" element={<Products />} />
            <Route path="settings" element={<div className="p-6 text-black dark:text-white">Configuración - En desarrollo</div>} />
          </Route>
        </Routes>
      </Router>
    </QueryProvider>
  );
}

export default App;
