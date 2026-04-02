import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sileo";
import { QueryProvider } from "@contexts/QueryProvider";
import ProtectedRoute from "@common/ProtectedRoute";
import Layout from "@layout/Layout";
import Login from "@pages/Login";
import Dashboard from "@pages/Dashboard";
import Services from "@pages/Services";
import Customers from "@pages/Customers";
import CustomerProfile from "@pages/CustomerProfile";
import Vehicles from "@pages/Vehicles";
import Products from "@pages/Products";
import ServiceRecords from "@pages/ServiceRecords";
import Appointments from "@pages/Appointments";
import Budgets from "@pages/Budgets";
import BudgetForm from "@pages/BudgetForm";
import BudgetPrint from "@pages/BudgetPrint";
import ServiceRecordFormPage from "@pages/ServiceRecordFormPage";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        offset={{ top: 16, right: 16 }}
        options={{
          duration: 4000,
          fill: "#121215",
          roundness: 10,
        }}
      />
      <QueryProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="service-records" element={<ServiceRecords />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/:id" element={<CustomerProfile />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="services" element={<Services />} />
              <Route path="products" element={<Products />} />
              <Route path="atenciones/nueva" element={<ServiceRecordFormPage />} />
              <Route path="atenciones/:id/editar" element={<ServiceRecordFormPage />} />
              <Route path="presupuestos" element={<Budgets />} />
              <Route path="presupuestos/nuevo" element={<BudgetForm />} />
              <Route path="presupuestos/:id/editar" element={<BudgetForm />} />
              <Route
                path="presupuestos/:id/imprimir"
                element={<BudgetPrint />}
              />
              <Route
                path="settings"
                element={
                  <div className="p-6 text-on-surface">
                    Configuración - En desarrollo
                  </div>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </QueryProvider>
    </>
  );
}

export default App;
