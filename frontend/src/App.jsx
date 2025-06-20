import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';

function App() {
  console.log('App renderizado');
  return (
    <QueryProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="appointments" element={<div className="p-6 text-white">Turnos - En desarrollo</div>} />
            <Route path="customers" element={<div className="p-6 text-white">Clientes - En desarrollo</div>} />
            <Route path="vehicles" element={<div className="p-6 text-white">Vehículos - En desarrollo</div>} />
            <Route path="services" element={<div className="p-6 text-white">Servicios - En desarrollo</div>} />
            <Route path="products" element={<div className="p-6 text-white">Productos - En desarrollo</div>} />
            <Route path="settings" element={<div className="p-6 text-white">Configuración - En desarrollo</div>} />
          </Route>
        </Routes>
      </Router>
    </QueryProvider>
  );
}

export default App;
