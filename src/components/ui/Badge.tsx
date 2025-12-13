import { safeText } from '@/utils/helpers';

interface BadgeProps {
  type: string;
  text?: string;
}

export const Badge = ({ type, text }: BadgeProps) => {
  const styles: Record<string, string> = {
    'Meta Ads': 'bg-primary-50 text-primary-700 border-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800',
    'Referido': 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
    'Orgánico': 'bg-primary-50 text-primary-700 border-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800',
    'Instagram': 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
    'Alianza': 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
    'Alta': 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    'Media': 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    'Baja': 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-[#353535] dark:text-slate-400 dark:border-[#3d3d3d]',
    'generated': 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800',
    'sent': 'bg-primary-50 text-primary-700 border-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800',
    'none': 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-[#353535] dark:text-slate-500 dark:border-[#3d3d3d]'
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border uppercase tracking-wide ${styles[type] || styles['Baja']}`}>
      {safeText(text || type)}
    </span>
  );
};

