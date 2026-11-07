import { useState } from 'react';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { usePlateLookup, useVehiclesByPlate } from '@services/vehiclesService';

const PLATE_OLD = /^[A-Z]{3}\s?[0-9]{3}$/;
const PLATE_NEW = /^[A-Z]{2}\s?[0-9]{3}\s?[A-Z]{2}$/;

export const normalizePlate = (plate) => String(plate || '').trim().toUpperCase();
export const isValidArgentinePlate = (plate) => PLATE_OLD.test(plate) || PLATE_NEW.test(plate);

const OWNER_DEBOUNCE_MS = 400;
const LOOKUP_DEBOUNCE_MS = 600;

/**
 * Estado de la patente que se está cargando:
 * - lookup: datos del servicio externo (auto, con debounce, una vez por patente).
 * - owner: otro vehículo ya registrado con esa patente (excluye `currentVehicleId`).
 * `originalPlate` (al editar) no dispara la búsqueda automática.
 */
export const useVehiclePlate = (rawPlate, { currentVehicleId = null, originalPlate = '' } = {}) => {
  const [forcedPlate, setForcedPlate] = useState('');
  const plate = normalizePlate(rawPlate);
  const isValid = isValidArgentinePlate(plate);
  const validPlate = isValid ? plate : '';

  const ownerPlate = useDebouncedValue(validPlate, OWNER_DEBOUNCE_MS);
  const debouncedLookupPlate = useDebouncedValue(validPlate, LOOKUP_DEBOUNCE_MS);
  const isOriginal = !!validPlate && validPlate === normalizePlate(originalPlate);
  let lookupPlate = isOriginal ? '' : debouncedLookupPlate;
  if (forcedPlate && forcedPlate === validPlate) lookupPlate = validPlate;

  const { data: sameVehicles = [] } = useVehiclesByPlate(ownerPlate);
  const lookup = usePlateLookup(lookupPlate);

  const conflict = ownerPlate === validPlate
    ? sameVehicles.find((v) => String(v.id) !== String(currentVehicleId)) ?? null
    : null;

  let lookupStatus = 'idle';
  if (lookupPlate && lookupPlate === validPlate) {
    if (lookup.isFetching) lookupStatus = 'loading';
    else if (lookup.isError) lookupStatus = 'error';
    else if (lookup.data?.status === 'found') lookupStatus = 'found';
    else if (lookup.data) lookupStatus = 'not_found';
  }

  return {
    plate,
    isValid,
    conflict,
    lookupStatus,
    lookupData: lookupStatus === 'found' ? lookup.data : null,
    lookupPlate,
    // Botón ✨: busca ya (sin esperar el debounce) o reintenta
    retryLookup: () => {
      if (!validPlate) return;
      if (lookupPlate === validPlate) lookup.refetch();
      else setForcedPlate(validPlate);
    },
  };
};
