import { format, isValid, parse } from 'date-fns';

// Máscaras de fecha (dd/mm/aaaa) y hora (hh:mm) para @ui/DateInput y @ui/TimeInput.
// Funciones puras: se recalculan sobre los dígitos del texto completo (tipeo, pegado o borrado en el medio).

const digitsOf = (text, max) => String(text ?? '').replace(/\D/g, '').slice(0, max);

/** Texto tipeado → "dd/mm/aaaa" parcial: solo dígitos (máx. 8) y las barras se insertan solas. */
export const formatDateDigits = (text) => {
  const d = digitsOf(text, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

/** "dd/mm/aaaa" → "yyyy-MM-dd", o null si está incompleta o no existe (31/02, 29/02 no bisiesto). */
export const parseDisplayDate = (text) => {
  const d = digitsOf(text, 8);
  if (d.length !== 8) return null;
  const date = parse(`${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`, 'dd/MM/yyyy', new Date());
  if (!isValid(date) || date.getFullYear() < 1000) return null;
  return format(date, 'yyyy-MM-dd');
};

/** "yyyy-MM-dd" → "dd/mm/aaaa" ('' si no es una fecha ISO válida). */
export const isoToDisplay = (iso) => {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(String(iso))) return '';
  const date = parse(String(iso).slice(0, 10), 'yyyy-MM-dd', new Date());
  return isValid(date) ? format(date, 'dd/MM/yyyy') : '';
};

/** "yyyy-MM-dd" → Date local (sin zona horaria), o undefined. */
export const isoToDate = (iso) => {
  if (!isoToDisplay(iso)) return undefined;
  return parse(String(iso).slice(0, 10), 'yyyy-MM-dd', new Date());
};

/** Texto tipeado → "hh:mm" parcial: solo dígitos (máx. 4) y los dos puntos se insertan solos. */
export const formatTimeDigits = (text) => {
  const d = digitsOf(text, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`;
};

/** "hh:mm" (24 h) → "HH:mm", o null si está incompleta o fuera de rango. */
export const parseDisplayTime = (text) => {
  const d = digitsOf(text, 4);
  if (d.length !== 4) return null;
  const hh = Number(d.slice(0, 2));
  const mm = Number(d.slice(2));
  if (hh > 23 || mm > 59) return null;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
};

/**
 * Valor que entregan @ui/DateInput y @ui/TimeInput cuando el texto no está vacío pero no es una fecha/hora
 * válida (incompleta, inexistente o fuera de min/max). Distinto de '' para que el formulario pueda bloquear
 * el envío (`validate`) y para que un `reset` a '' vuelva a sincronizar el texto. Nunca llega al backend.
 */
export const INVALID_INPUT = 'invalid';

export const isInvalidInput = (value) => value === INVALID_INPUT;

/** Regla `validate` de react-hook-form para un DateInput/TimeInput: bloquea el texto inválido. */
export const validInput = (message = 'Fecha inválida') => (value) => !isInvalidInput(value) || message;
