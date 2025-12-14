import { Column } from '@/types';

export const COLUMNS: Column[] = [
  { id: 'new', title: 'Nuevo Lead', color: 'border-slate-400 dark:border-slate-500', dotColor: 'bg-slate-400 dark:bg-slate-500' },
  { id: 'contacted', title: 'Contactado', color: 'border-primary-400 dark:border-primary-500', dotColor: 'bg-blue-500 dark:bg-blue-400' },
  { id: 'visit_pending', title: 'Pendiente Relevo', color: 'border-yellow-400 dark:border-yellow-500', dotColor: 'bg-yellow-400 dark:bg-yellow-500' },
  { id: 'quote_generated', title: 'Presupuesto Generado', color: 'border-slate-400 dark:border-slate-500', dotColor: 'bg-cyan-400 dark:bg-cyan-500' },
  { id: 'quote_sent', title: 'Presupuesto Enviado', color: 'border-purple-400 dark:border-purple-500', dotColor: 'bg-purple-400 dark:bg-purple-500' },
  { id: 'negotiation', title: 'En Negociación', color: 'border-orange-400 dark:border-orange-500', dotColor: 'bg-orange-400 dark:bg-orange-500' },
  { id: 'won', title: 'Ganado', color: 'border-primary-500 dark:border-primary-400', dotColor: 'bg-green-500 dark:bg-green-400' },
  { id: 'lost', title: 'Perdido', color: 'border-red-300 dark:border-red-500', dotColor: 'bg-red-400 dark:bg-red-500' },
];

