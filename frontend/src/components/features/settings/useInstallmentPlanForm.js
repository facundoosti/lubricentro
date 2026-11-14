import { useState } from 'react';

// Lógica del formulario de planes de cuotas (validación, payload y estado), separada del render.
export const EMPTY_PLAN = { name: '', installments: '', surcharge_percentage: '0', position: '' };

// Mismas reglas que el backend: nombre obligatorio, más de 1 cuota, recargo ≥ 0.
const validatePlan = (v) => {
  if (!v.name.trim()) return 'Ingresá el nombre del plan';
  const n = Number(v.installments);
  if (!Number.isInteger(n) || n < 2) return 'Las cuotas deben ser 2 o más';
  if (v.surcharge_percentage === '' || Number(v.surcharge_percentage) < 0) return 'El recargo debe ser 0 o más';
  return null;
};

export const toPlanPayload = (v, fallbackPosition) => ({
  name: v.name.trim(),
  installments: Number(v.installments),
  surcharge_percentage: Number(v.surcharge_percentage),
  position: v.position === '' ? fallbackPosition : Number(v.position),
});

// Siguiente orden libre: uno más que el mayor (0 si no hay planes).
export const nextPosition = (plans) => (plans.length ? Math.max(...plans.map((p) => Number(p.position) || 0)) + 1 : 0);

export const usePlanForm = (initial, onSave) => {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState(null);
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const message = validatePlan(values);
    setError(message);
    if (!message) onSave(values);
  };

  return { values, error, set, submit };
};
