import { formatCurrency } from '@utils/money';

// Normaliza un teléfono argentino al formato de wa.me (549 + área + número).
// "11 5555-1234" -> "5491155551234"; "+54 9 11 5555-1234" -> "5491155551234".
export const normalizeWhatsAppPhone = (phone) => {
  let digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('549')) return digits;
  if (digits.startsWith('54')) return `549${digits.slice(2)}`;
  if (digits.startsWith('0')) digits = digits.slice(1);
  return `549${digits}`;
};

const formatDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

export const buildBudgetMessage = ({ budget, customerName, businessName }) => {
  const lines = [
    `Hola${customerName ? ` ${customerName.split(' ')[0]}` : ''}! Te paso el presupuesto #${budget.id}` +
      `${businessName ? ` de ${businessName}` : ''} (${formatDate(budget.date)}).`,
  ];
  if (budget.vehicle_description) lines.push(`Vehículo: ${budget.vehicle_description}`);
  lines.push(`Total efectivo / débito: ${formatCurrency(budget.total_list)}`);
  lines.push(`Total tarjeta de crédito: ${formatCurrency(budget.total_card)}`);
  return lines.join('\n');
};

// URL de wa.me (con mensaje opcional) o null si no hay teléfono.
export const buildWhatsAppUrl = (phone, text) => {
  const normalized = normalizeWhatsAppPhone(phone);
  if (!normalized) return null;
  const base = `https://wa.me/${normalized}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
};
