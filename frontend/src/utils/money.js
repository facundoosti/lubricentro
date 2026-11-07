// Redondeo a 2 decimales (half-up para positivos), igual que BigDecimal#round(2) del backend.
export const round2 = (value) => {
  const n = Number(value) || 0;
  return Math.sign(n) * Math.round((Math.abs(n) + Number.EPSILON) * 100) / 100;
};

// "$12.100" / "$1.234,50" — formato argentino: sin decimales si es entero, si no siempre 2.
export const formatCurrency = (value) => {
  const n = round2(value);
  const digits = Number.isInteger(n) ? 0 : 2;
  return `$${n.toLocaleString('es-AR', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
};
