import { Column } from '@/types';

export const COLUMNS: Column[] = [
  { id: 'new', title: 'Nuevo Lead', color: 'border-blue-400 dark:border-blue-500' },
  { id: 'contacted', title: 'Contactado', color: 'border-teal-400 dark:border-teal-500' },
  { id: 'visit_pending', title: 'Pendiente Relevo', color: 'border-yellow-400 dark:border-yellow-500' },
  { id: 'quote_generated', title: 'Presupuesto Generado', color: 'border-indigo-400 dark:border-indigo-500' },
  { id: 'quote_sent', title: 'Presupuesto Enviado', color: 'border-purple-400 dark:border-purple-500' },
  { id: 'negotiation', title: 'En Negociación', color: 'border-orange-400 dark:border-orange-500' },
  { id: 'won', title: 'Ganado', color: 'border-green-500 dark:border-green-600' },
  { id: 'lost', title: 'Perdido', color: 'border-red-300 dark:border-red-500' },
];

