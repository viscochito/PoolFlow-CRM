import { useLeads } from './useLeads';

/**
 * Hook para gestionar leads de inmobiliaria
 * Es un wrapper de useLeads que usa la tabla 'leads_inmobiliaria'
 */
export const useInmobiliariaLeads = () => {
  return useLeads('leads_inmobiliaria');
};

