import { BRAND } from '@components/features/budgets/printTheme';

// Pie de la hoja: email e Instagram del lubricentro (sin repetir dirección ni teléfono). Sin ninguno, no se muestra.
// Va en el flujo de la hoja (flex column): marginTop auto lo baja al pie sin pisar los totales si el contenido crece.
const BudgetPrintFooter = ({ setting }) => {
  const email = setting?.email;
  const instagram = setting?.instagram;
  if (!email && !instagram) return null;

  return (
    <div
      data-testid="print-footer"
      style={{
        marginTop: 'auto',
        flexShrink: 0,
        backgroundColor: BRAND,
        color: '#fff',
        borderRadius: '8px',
        padding: '5px 12px',
        fontSize: '10px',
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
      }}
    >
      {email && <span>✉ {email}</span>}
      {instagram && <span>@{instagram}</span>}
    </div>
  );
};

export default BudgetPrintFooter;
