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
import Reminders from "@pages/Reminders";
import Settings from "@pages/Settings";
import Inbox from "@pages/Inbox";
import Suppliers from "@pages/Suppliers";

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
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="service-records/new" element={<ServiceRecordFormPage />} />
              <Route path="service-records/:id/edit" element={<ServiceRecordFormPage />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="budgets/new" element={<BudgetForm />} />
              <Route path="budgets/:id/edit" element={<BudgetForm />} />
              <Route
                path="budgets/:id/print"
                element={<BudgetPrint />}
              />
              <Route path="inbox" element={<Inbox />} />
              <Route path="reminders" element={<Reminders />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </QueryProvider>
    </>
  );
}

export default App;
