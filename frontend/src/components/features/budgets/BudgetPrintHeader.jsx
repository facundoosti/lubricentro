import { MapPin } from 'lucide-react';
import { BRAND, GRAY } from '@components/features/budgets/printTheme';

const formatDate = (iso) => {
  if (!iso) return { day: '', month: '', year: '' };
  const [y, m, d] = iso.split('-');
  return { day: d, month: m, year: y.slice(-2) };
};

const dateBox = {
  background: '#fff',
  color: BRAND,
  fontWeight: 'bold',
  padding: '1px 6px',
  borderRadius: '3px',
  minWidth: '22px',
  textAlign: 'center',
};

// Datos del cliente, encabezado del lubricentro (gris degradado) y franja PRESUPUESTO con la fecha.
const BudgetPrintHeader = ({ budget, setting }) => {
  const { day, month, year } = formatDate(budget.date);
  const customer = budget.customer;
  const { phone, mobile, address, cuit } = setting || {};

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '10px', lineHeight: 1.5 }}>
        <div>
          <div data-testid="print-customer-name">
            <strong>NOMBRE:</strong> {customer?.name || ''}
          </div>
          {(customer?.cuit || customer?.invoice_type) && (
            <div data-testid="print-customer-fiscal">
              {customer?.cuit && (
                <span>
                  <strong>CUIT:</strong> {customer.cuit}
                </span>
              )}
              {customer?.cuit && customer?.invoice_type && <span>&nbsp;&nbsp;</span>}
              {customer?.invoice_type && (
                <span>
                  <strong>FACT:</strong> {customer.invoice_type}
                </span>
              )}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <strong>WSP:</strong> {customer?.phone || ''}
        </div>
      </div>

      <div
        style={{
          background: `linear-gradient(180deg, ${GRAY.headerFrom}, ${GRAY.headerTo})`,
          borderRadius: '10px 10px 0 0',
          padding: '8px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <img src="/logo.webp" alt="Killamet Lubricantes" crossOrigin="anonymous" style={{ height: '52px', objectFit: 'contain' }} />
        <div style={{ textAlign: 'right', fontSize: '10px', color: GRAY.headerText, lineHeight: 1.6 }}>
          {cuit && (
            <div>
              <strong style={{ color: '#bbbbbb' }}>CUIT:</strong> {cuit}
            </div>
          )}
          {(phone || mobile) && (
            <div>{[phone && `Tel: ${phone}`, mobile && `Cel: ${mobile}`].filter(Boolean).join('  ·  ')}</div>
          )}
          {address && (
            <div data-testid="print-address" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
              <MapPin size={11} color={BRAND} strokeWidth={2.5} aria-hidden="true" />
              <span>{address}</span>
            </div>
          )}
        </div>
      </div>

      <div
        data-testid="print-banner"
        style={{
          backgroundColor: BRAND,
          color: '#fff',
          padding: '6px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '0 0 10px 10px',
          marginBottom: '6px',
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '2px' }}>PRESUPUESTO</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
          <span>DÍA</span>
          <span data-testid="print-day" style={dateBox}>{day}</span>
          <span>MES</span>
          <span data-testid="print-month" style={dateBox}>{month}</span>
          <span>AÑO</span>
          <span data-testid="print-year" style={dateBox}>{year}</span>
        </div>
      </div>
    </>
  );
};

export default BudgetPrintHeader;
