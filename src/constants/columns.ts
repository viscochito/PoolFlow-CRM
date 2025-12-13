import { Column } from '@/types';

export const COLUMNS: Column[] = [
  { id: 'new', title: 'Nuevo Lead', color: 'border-slate-400 dark:border-slate-500' },
  { id: 'contacted', title: 'Contactado', color: 'border-primary-400 dark:border-primary-500' },
  { id: 'visit_pending', title: 'Pendiente Relevo', color: 'border-yellow-400 dark:border-yellow-500' },
  { id: 'quote_generated', title: 'Presupuesto Generado', color: 'border-slate-400 dark:border-slate-500' },
  { id: 'quote_sent', title: 'Presupuesto Enviado', color: 'border-purple-400 dark:border-purple-500' },
  { id: 'negotiation', title: 'En Negociación', color: 'border-orange-400 dark:border-orange-500' },
  { id: 'won', title: 'Ganado', color: 'border-primary-500 dark:border-primary-400' },
  { id: 'lost', title: 'Perdido', color: 'border-red-300 dark:border-red-500' },
];

