import { Service } from '@/types';

const STATUS_COLORS: Record<Service['status'], string> = {
  propuesto: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700/30 dark:text-slate-300 dark:border-slate-600',
  aceptado: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  rechazado: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  en_proceso: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
};

interface ServiceTagsProps {
  services: Service[];
}

export const ServiceTags = ({ services }: ServiceTagsProps) => {
  if (!services || services.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-0.5 mt-1">
      {services.map(service => (
        <div
          key={service.id}
          className={`
            inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium border
            ${STATUS_COLORS[service.status]}
          `}
        >
          {service.name}
          {service.price !== null && (
            <span className="text-[8px] opacity-75">${service.price}</span>
          )}
        </div>
      ))}
    </div>
  );
};

