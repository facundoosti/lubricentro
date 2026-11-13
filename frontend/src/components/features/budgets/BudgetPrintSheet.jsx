import BudgetPrintHeader from '@components/features/budgets/BudgetPrintHeader';
import BudgetPrintItems from '@components/features/budgets/BudgetPrintItems';
import BudgetPrintTotals from '@components/features/budgets/BudgetPrintTotals';
import BudgetPrintFooter from '@components/features/budgets/BudgetPrintFooter';
import { GRAY } from '@components/features/budgets/printTheme';

const vehicleText = (budget) =>
  budget.vehicle_description ||
  (budget.vehicle ? `${budget.vehicle.brand} ${budget.vehicle.model} ${budget.vehicle.year}` : '');

// Hoja A4 del presupuesto (lo que se imprime y se captura para el PDF).
const BudgetPrintSheet = ({ budget, setting }) => (
  <div
    id="budget-print-sheet"
    style={{
      display: 'flex',
      flexDirection: 'column',
      width: '210mm',
      minHeight: '297mm',
      padding: '8mm 10mm',
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: '#000',
      backgroundColor: '#fff',
      boxSizing: 'border-box',
    }}
  >
    <BudgetPrintHeader budget={budget} setting={setting} />

    <div style={{ backgroundColor: GRAY.vehicle, borderRadius: '6px', padding: '5px 10px', marginBottom: '6px' }}>
      <strong>Vehículo:</strong> {vehicleText(budget)}
    </div>

    <BudgetPrintItems items={budget.items || []} />
    <BudgetPrintTotals budget={budget} />
    {/* Separación mínima entre la leyenda y el pie cuando la hoja se llena */}
    <div aria-hidden="true" style={{ flexShrink: 0, height: '10px' }} />
    <BudgetPrintFooter setting={setting} />
  </div>
);

export default BudgetPrintSheet;
