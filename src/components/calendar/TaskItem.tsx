import { CheckCircle2, Calendar, MessageSquare, Phone, Mail, Instagram } from 'lucide-react';
import { Task, Lead, TaskChannel } from '@/types';
import { COLUMNS } from '@/constants/columns';
import { formatDateKey } from '@/utils/dateHelpers';

interface TaskItemProps {
  task: Task;
  lead: Lead | undefined;
  customColumns?: any[];
  onMarkDone: (taskId: string) => void;
  onRegisterMessage: (taskId: string) => void;
  onReschedule: (taskId: string, newDate: string) => void;
  onEdit?: (task: Task) => void;
}

const channelConfig: Record<TaskChannel, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  whatsapp: { 
    label: 'WhatsApp', 
    icon: MessageSquare,
    color: 'text-green-500 dark:text-green-400'
  },
  instagram: { 
    label: 'Instagram', 
    icon: Instagram,
    color: 'text-pink-500 dark:text-pink-400'
  },
  mail: { 
    label: 'Email', 
    icon: Mail,
    color: 'text-blue-500 dark:text-blue-400'
  },
};

export const TaskItem = ({
  task,
  lead,
  customColumns = [],
  onMarkDone,
  onRegisterMessage,
  onReschedule,
  onEdit,
}: TaskItemProps) => {
  const getColumnTitle = (columnId: string): string => {
    const allColumns = [...COLUMNS, ...customColumns];
    const column = allColumns.find(c => c.id === columnId);
    return column?.title || columnId;
  };

  const handleReschedule = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const newDate = formatDateKey(tomorrow);
    onReschedule(task.id, newDate);
  };

  const channelInfo = channelConfig[task.channel];
  const ChannelIcon = channelInfo.icon;

  if (task.status === 'done') {
    return (
      <div className="group bg-slate-50 dark:bg-[#2d2d2d] border border-slate-200 dark:border-[#3d3d3d] rounded-lg opacity-75 hover:opacity-100 transition-opacity">
        <div className="p-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 line-through truncate">
              {lead?.name || 'Lead eliminado'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 truncate">
              {task.action}
            </p>
          </div>
        </div>
        {onEdit && (
          <div className="px-3 pb-2 flex justify-end">
            <button
              onClick={() => onEdit(task)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="Editar tarea para revertir estado"
            >
              Editar
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group bg-white dark:bg-[#2d2d2d] border border-slate-200 dark:border-[#3d3d3d] rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-lg transition-all flex flex-col min-w-0">
      {/* Header principal */}
      <div className="p-3 border-b border-slate-100 dark:border-[#3d3d3d] flex-shrink-0">
        <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5 truncate">
              {lead?.name || 'Lead eliminado'}
            </h3>
            {lead && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-[#353535] text-slate-600 dark:text-slate-400 rounded-md truncate max-w-full">
                {getColumnTitle(lead.columnId)}
              </span>
            )}
          </div>
          {task.status === 'rescheduled' && task.rescheduledTo && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 flex-shrink-0 whitespace-nowrap">
              <Calendar className="w-3 h-3" />
              <span className="hidden sm:inline">Reprogramada</span>
            </div>
          )}
        </div>

        {/* Acción y canal */}
        <div className="flex items-center gap-2 min-w-0">
          <div className={`flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#353535] flex-shrink-0 ${channelInfo.color}`}>
            <ChannelIcon className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
              {task.action}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-500 truncate">
              {channelInfo.label}
            </p>
          </div>
        </div>

        {/* Nota si existe */}
        {task.note && (
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#3d3d3d]">
            <p className="text-[10px] text-slate-600 dark:text-slate-400 italic line-clamp-2 break-words">
              {task.note}
            </p>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="p-2.5 flex items-center gap-1.5 bg-slate-50 dark:bg-[#252525] rounded-b-lg flex-shrink-0 flex-wrap">
        <button
          onClick={() => onRegisterMessage(task.id)}
          className="flex-1 min-w-[100px] px-2.5 py-1.5 text-[10px] font-medium bg-primary-500 dark:bg-primary-600 text-white rounded-md hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors flex items-center justify-center gap-1"
        >
          <MessageSquare className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">Registrar</span>
        </button>
        <button
          onClick={() => onMarkDone(task.id)}
          className="flex-1 min-w-[80px] px-2.5 py-1.5 text-[10px] font-medium bg-green-500 dark:bg-green-600 text-white rounded-md hover:bg-green-600 dark:hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
        >
          <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
          <span>Hecho</span>
        </button>
        <button
          onClick={handleReschedule}
          className="px-2.5 py-1.5 text-[10px] font-medium bg-white dark:bg-[#2d2d2d] border border-slate-300 dark:border-[#3d3d3d] text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-[#353535] transition-colors flex items-center gap-1 flex-shrink-0"
        >
          <Calendar className="w-3 h-3 flex-shrink-0" />
          <span className="hidden sm:inline">Reprogramar</span>
        </button>
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="px-2 py-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors flex-shrink-0"
            title="Editar tarea"
          >
            Editar
          </button>
        )}
      </div>
    </div>
  );
};

