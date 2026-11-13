import { createContext, useContext } from 'react';

// Profundidad del Dialog: los diálogos anidados en el árbol de React son los que Base UI apila.
export const DialogLevelContext = createContext(0);

/**
 * Nodo del panel del Dialog abierto (o null fuera de un diálogo). Los autocompletes con portal propio
 * (CustomerSearchInput) portean su lista ahí: dentro del diálogo modal la lista queda interactiva y
 * por encima del contenido. Archivo aparte de Dialog.jsx para no romper el fast refresh.
 */
export const DialogPortalContainer = createContext(null);
export const useDialogPortalContainer = () => useContext(DialogPortalContainer);
