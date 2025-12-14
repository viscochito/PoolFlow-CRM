import { Task, Lead } from '@/types';
import { TaskItem } from './TaskItem';
import { formatDateKey, isToday } from '@/utils/dateHelpers';

interface TaskDayViewProps {
  date: Date;
  tasks: Task[];
  leads: Lead[];
  customColumns?: any[];
  onMarkDone: (taskId: string) => void;
  onRegisterMessage: (taskId: string) => void;
  onReschedule: (taskId: string, newDate: string) => void;
  onEditTask?: (task: Task) => void;
}

export const TaskDayView = ({
  date,
  tasks,
  leads,
  customColumns = [],
  onMarkDone,
  onRegisterMessage,
  onReschedule,
  onEditTask,
}: TaskDayViewProps) => {
  const dateKey = formatDateKey(date);
  const dayTasks = tasks.filter((task) => {
    if (task.status === 'rescheduled' && task.rescheduledTo) {
      return task.rescheduledTo === dateKey;
    }
    return task.date === dateKey && task.status !== 'rescheduled';
  });

  const pendingTasks = dayTasks.filter((t) => t.status === 'pending');
  const doneTasks = dayTasks.filter((t) => t.status === 'done');

  const getLeadById = (leadId: string): Lead | undefined => {
    return leads.find((l) => l.id === leadId);
  };

  const formattedDate = date.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const isTodayDate = isToday(date);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header del día */}
      <div className={`flex-shrink-0 p-4 pb-3 border-b ${isTodayDate ? 'border-primary-500 dark:border-primary-400' : 'border-slate-200 dark:border-[#3d3d3d]'}`}>
        <div className="min-w-0">
          <h2 className={`
            text-base md:text-lg font-bold mb-1
            ${isTodayDate ? 'text-primary-600 dark:text-primary-400' : 'text-slate-900 dark:text-white'}
          `}>
            <span className="block truncate">
              {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
            </span>
            {isTodayDate && (
              <span className="text-xs md:text-sm font-normal text-slate-500 dark:text-slate-400 block mt-0.5">
                (Hoy)
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {pendingTasks.length} tarea{pendingTasks.length !== 1 ? 's' : ''} pendiente{pendingTasks.length !== 1 ? 's' : ''}
            {doneTasks.length > 0 && ` · ${doneTasks.length} completada${doneTasks.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Lista de tareas */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 custom-scrollbar min-h-0">
        {pendingTasks.length === 0 && doneTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 dark:text-slate-500">
              No hay tareas para este día
            </p>
          </div>
        ) : (
          <>
            {/* Tareas pendientes */}
            {pendingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                lead={getLeadById(task.leadId)}
                customColumns={customColumns}
                onMarkDone={onMarkDone}
                onRegisterMessage={onRegisterMessage}
                onReschedule={onReschedule}
                onEdit={onEditTask}
              />
            ))}

            {/* Tareas completadas (colapsadas) */}
            {doneTasks.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-[#3d3d3d]">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Completadas ({doneTasks.length})
                </p>
                {doneTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    lead={getLeadById(task.leadId)}
                    customColumns={customColumns}
                    onMarkDone={onMarkDone}
                    onRegisterMessage={onRegisterMessage}
                    onReschedule={onReschedule}
                    onEdit={onEditTask}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

