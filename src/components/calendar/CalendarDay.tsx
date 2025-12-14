import { CalendarDayData } from '@/hooks/useCalendar';
import { isToday, isCurrentMonth } from '@/utils/dateHelpers';

interface CalendarDayProps {
  dayData: CalendarDayData;
  currentMonth: Date;
  isSelected: boolean;
  onClick: (date: Date) => void;
  isWeekView?: boolean;
}

export const CalendarDay = ({ dayData, currentMonth, isSelected, onClick, isWeekView = false }: CalendarDayProps) => {
  const { date, totalLeads, urgentLeads } = dayData;
  const isCurrentDay = isToday(date);
  const isInCurrentMonth = isCurrentMonth(date, currentMonth);
  
  const handleClick = () => {
    onClick(date);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative border rounded-lg transition-all duration-200 flex flex-col
        ${isWeekView ? 'min-h-[200px] p-4' : 'min-h-[80px] p-2'}
        ${isInCurrentMonth 
          ? 'bg-white dark:bg-[#2d2d2d] border-slate-200 dark:border-[#3d3d3d]' 
          : 'bg-slate-50 dark:bg-[#252525] border-slate-100 dark:border-[#2d2d2d] opacity-50'
        }
        ${isSelected 
          ? 'ring-2 ring-primary-500 dark:ring-primary-400 border-primary-500 dark:border-primary-400' 
          : ''
        }
        ${isCurrentDay 
          ? 'border-2 border-blue-500 dark:border-blue-400' 
          : ''
        }
        ${dayData.actionLeads.length > 0 && isWeekView
          ? 'border-l-4 border-l-primary-500 dark:border-l-primary-400'
          : ''
        }
        hover:bg-slate-50 dark:hover:bg-[#353535] hover:border-slate-300 dark:hover:border-[#4d4d4d]
        active:scale-95
      `}
    >
      {/* Número del día */}
      <div className={`
        font-medium mb-2
        ${isWeekView ? 'text-lg' : 'text-sm'}
        ${isCurrentDay 
          ? 'text-blue-600 dark:text-blue-400 font-bold' 
          : isInCurrentMonth 
            ? 'text-slate-700 dark:text-slate-300' 
            : 'text-slate-400 dark:text-slate-600'
        }
      `}>
        {date.getDate()}
      </div>

      {/* Lista de leads en vista semanal */}
      {isWeekView && dayData.actionLeads.length > 0 && (
        <div className="mt-3 space-y-1.5 flex-1 overflow-y-auto min-h-0">
          {dayData.actionLeads.slice(0, 4).map(lead => (
            <div 
              key={lead.id} 
              className="text-xs p-2 bg-slate-100 dark:bg-[#353535] rounded border-l-2 border-primary-500 dark:border-primary-400"
            >
              <div className="font-medium truncate text-slate-900 dark:text-white">
                {lead.name}
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 truncate">
                {lead.columnId === 'new' && (!lead.contactChannels || lead.contactChannels.length === 0)
                  ? 'Nuevo sin contactar'
                  : lead.columnId === 'negotiation'
                  ? 'Negociación pendiente'
                  : lead.urgency === 'Alta'
                  ? 'Urgente'
                  : 'Requiere seguimiento'}
              </div>
            </div>
          ))}
          {dayData.actionLeads.length > 4 && (
            <div className="text-xs text-slate-500 dark:text-slate-400 text-center pt-1">
              +{dayData.actionLeads.length - 4} más
            </div>
          )}
        </div>
      )}

      {/* Indicadores de leads */}
      {totalLeads > 0 && (
        <div className={`flex flex-col gap-1 ${isWeekView && dayData.actionLeads.length > 0 ? '' : isWeekView ? 'mt-auto' : ''}`}>
          {dayData.actionLeads.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className={`rounded-full bg-primary-500 dark:bg-primary-400 ${isWeekView ? 'w-2.5 h-2.5' : 'w-2 h-2'}`}></div>
              <span className={`font-medium ${isWeekView ? 'text-xs' : 'text-[10px]'} text-primary-600 dark:text-primary-400`}>
                {dayData.actionLeads.length} acción{dayData.actionLeads.length !== 1 ? 'es' : ''}
              </span>
            </div>
          )}
          {urgentLeads > 0 && (
            <div className="flex items-center gap-1.5">
              <div className={`rounded-full bg-red-500 ${isWeekView ? 'w-2.5 h-2.5' : 'w-2 h-2'}`}></div>
              <span className={`font-medium ${isWeekView ? 'text-xs' : 'text-[10px]'} text-red-600 dark:text-red-400`}>
                {urgentLeads} urgente{urgentLeads !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          {totalLeads > 0 && (
            <div className="flex items-center gap-1.5">
              <div className={`
                rounded-full
                ${isWeekView ? 'w-2.5 h-2.5' : 'w-2 h-2'}
                ${urgentLeads > 0 ? 'bg-orange-500' : 'bg-slate-400 dark:bg-slate-500'}
              `}></div>
              <span className={`
                font-medium
                ${isWeekView ? 'text-xs' : 'text-[10px]'}
                text-slate-600 dark:text-slate-400
              `}>
                {totalLeads} lead{totalLeads !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}
    </button>
  );
};

