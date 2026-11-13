import { describe, it, expect } from 'vitest';
import {
  formatDateDigits,
  parseDisplayDate,
  isoToDisplay,
  isoToDate,
  formatTimeDigits,
  parseDisplayTime,
  INVALID_INPUT,
  isInvalidInput,
  validInput,
} from '@/lib/maskedInput';

describe('formatDateDigits', () => {
  it('inserta las barras mientras se tipea', () => {
    expect(formatDateDigits('1')).toBe('1');
    expect(formatDateDigits('13')).toBe('13');
    expect(formatDateDigits('131')).toBe('13/1');
    expect(formatDateDigits('1311')).toBe('13/11');
    expect(formatDateDigits('13112')).toBe('13/11/2');
    expect(formatDateDigits('13112026')).toBe('13/11/2026');
  });

  it('acepta texto pegado con o sin barras y corta en 8 dígitos', () => {
    expect(formatDateDigits('05/03/2027')).toBe('05/03/2027');
    expect(formatDateDigits('05032027')).toBe('05/03/2027');
    expect(formatDateDigits('050320271234')).toBe('05/03/2027');
  });

  it('ignora letras y símbolos', () => {
    expect(formatDateDigits('1a3')).toBe('13');
    expect(formatDateDigits('abc')).toBe('');
    expect(formatDateDigits('')).toBe('');
    expect(formatDateDigits(null)).toBe('');
  });
});

describe('parseDisplayDate', () => {
  it('devuelve la fecha ISO si es válida', () => {
    expect(parseDisplayDate('13/11/2026')).toBe('2026-11-13');
    expect(parseDisplayDate('05032027')).toBe('2027-03-05');
    expect(parseDisplayDate('29/02/2028')).toBe('2028-02-29');
  });

  it('devuelve null si está incompleta, vacía o con basura', () => {
    expect(parseDisplayDate('13/11')).toBeNull();
    expect(parseDisplayDate('')).toBeNull();
    expect(parseDisplayDate('hola')).toBeNull();
  });

  it('devuelve null para fechas inexistentes', () => {
    expect(parseDisplayDate('31/02/2026')).toBeNull();
    expect(parseDisplayDate('29/02/2026')).toBeNull();
    expect(parseDisplayDate('00/01/2026')).toBeNull();
    expect(parseDisplayDate('10/13/2026')).toBeNull();
    expect(parseDisplayDate('01/01/0000')).toBeNull();
  });
});

describe('isoToDisplay / isoToDate', () => {
  it('convierte ISO a dd/mm/aaaa', () => {
    expect(isoToDisplay('2026-10-02')).toBe('02/10/2026');
    expect(isoToDisplay('2026-10-02T10:00:00Z')).toBe('02/10/2026');
  });

  it('devuelve vacío para valores no ISO', () => {
    expect(isoToDisplay('')).toBe('');
    expect(isoToDisplay(null)).toBe('');
    expect(isoToDisplay('02/10/2026')).toBe('');
    expect(isoToDisplay('2026-02-31')).toBe('');
  });

  it('isoToDate devuelve la fecha local sin corrimiento de zona', () => {
    const date = isoToDate('2026-10-02');
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 9, 2]);
    expect(isoToDate('')).toBeUndefined();
  });
});

describe('formatTimeDigits / parseDisplayTime', () => {
  it('inserta los dos puntos', () => {
    expect(formatTimeDigits('08')).toBe('08');
    expect(formatTimeDigits('083')).toBe('08:3');
    expect(formatTimeDigits('0830')).toBe('08:30');
    expect(formatTimeDigits('08:30')).toBe('08:30');
    expect(formatTimeDigits('08305')).toBe('08:30');
    expect(formatTimeDigits('a8')).toBe('8');
  });

  it('valida el rango 00:00–23:59', () => {
    expect(parseDisplayTime('08:30')).toBe('08:30');
    expect(parseDisplayTime('2359')).toBe('23:59');
    expect(parseDisplayTime('0000')).toBe('00:00');
    expect(parseDisplayTime('2400')).toBeNull();
    expect(parseDisplayTime('2575')).toBeNull();
    expect(parseDisplayTime('1260')).toBeNull();
    expect(parseDisplayTime('08:3')).toBeNull();
    expect(parseDisplayTime('')).toBeNull();
  });
});

describe('validInput / isInvalidInput', () => {
  it('bloquea solo el valor inválido (vacío y valores válidos pasan)', () => {
    const validate = validInput();
    expect(validate(INVALID_INPUT)).toBe('Fecha inválida');
    expect(validate('')).toBe(true);
    expect(validate('2026-11-13')).toBe(true);
    expect(validInput('Hora inválida')(INVALID_INPUT)).toBe('Hora inválida');
    expect(isInvalidInput(INVALID_INPUT)).toBe(true);
    expect(isInvalidInput('')).toBe(false);
  });
});
