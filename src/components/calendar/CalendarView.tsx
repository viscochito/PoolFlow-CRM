import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Lead, Column, Task } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { useFollowUpSuggestions, SuggestedTask } from '@/hooks/useFollowUpSuggestions';
import { getDaysInWeek, getStartOfWeek, addWeeks, formatWeekRange, getNextDays, formatDateKey, isToday } from '@/utils/dateHelpers';
import { TaskDayView } from './TaskDayView';
import { NewTaskModal } from './NewTaskModal';
import { SuggestedTasksPanel } from './SuggestedTasksPanel';

type ViewMode = 'today' | 'next3' | 'week';

interface CalendarViewProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  customColumns?: Column[];
}

export const CalendarView = ({ leads, onLeadClick, customColumns = [] }: CalendarViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingSuggestion, setEditingSuggestion] = useState<SuggestedTask | null>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  
  const {
    tasks,
    loading,
    error,
    addTask,
    updateTaskStatus,
    markAsDone,
    reschedule,
    clearError,
  } = useTasks();

  const { suggestions } = useFollowUpSuggestions(leads);
  
  // Filtrar sugerencias descartadas
  const filteredSuggestions = suggestions.filter(
    (s, idx) => !dismissedSuggestions.has(`${s.leadId}-${s.rule}-${idx}`)
  );

  const handlePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, -1));
    } else if (viewMode === 'next3') {
      setCurrentDate(new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (viewMode === 'next3') {
      setCurrentDate(new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000));
    }
  };

  const handleRegisterMessage = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Marcar como hecha y abrir el lead para registrar el mensaje
    await markAsDone(taskId);
    const lead = leads.find(l => l.id === task.leadId);
    if (lead) {
      onLeadClick(lead);
    }
  };

  const handleReschedule = async (taskId: string, newDate: string) => {
    await reschedule(taskId, newDate);
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditingSuggestion(null);
    setIsTaskModalOpen(true);
  };

  const handleAcceptSuggestion = async (suggestion: SuggestedTask) => {
    try {
      await addTask({
        leadId: suggestion.leadId,
        date: suggestion.suggestedDate,
        action: suggestion.action,
        channel: suggestion.channel,
        status: 'pending',
      });
      // Marcar como descartada para que no vuelva a aparecer
      const key = `${suggestion.leadId}-${suggestion.rule}-${suggestions.indexOf(suggestion)}`;
      setDismissedSuggestions(prev => new Set(prev).add(key));
    } catch (err) {
      console.error('Error accepting suggestion:', err);
    }
  };

  const handleEditSuggestion = (suggestion: SuggestedTask) => {
    setEditingSuggestion(suggestion);
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const handleDismissSuggestion = (suggestion: SuggestedTask) => {
    const key = `${suggestion.leadId}-${suggestion.rule}-${suggestions.indexOf(suggestion)}`;
    setDismissedSuggestions(prev => new Set(prev).add(key));
  };

  const getDaysToShow = (): Date[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (viewMode) {
      case 'today':
        return [today];
      case 'next3':
        return getNextDays(3);
      case 'week':
        return getDaysInWeek(currentDate);
      default:
        return [today];
    }
  };

  const getHeaderTitle = (): string => {
    switch (viewMode) {
      case 'today':
        return 'Hoy';
      case 'next3':
        return 'Próximos 3 días';
      case 'week':
        return formatWeekRange(getStartOfWeek(currentDate));
      default:
        return 'Calendario';
    }
  };

  const daysToShow = getDaysToShow();

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#1d1d1d] p-6">
      {/* Header */}
      <div className="mb-4 flex-shrink-0 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          {(viewMode === 'week' || viewMode === 'next3') && (
            <>
              <button
                onClick={handlePrevious}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-[#353535] transition-colors text-slate-700 dark:text-slate-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">
                {getHeaderTitle()}
              </h2>
              
              <button
                onClick={handleNext}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-[#353535] transition-colors text-slate-700 dark:text-slate-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          {viewMode === 'today' && (
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              {getHeaderTitle()}
            </h2>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Selector de vista */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#2d2d2d] border border-slate-200 dark:border-[#3d3d3d] rounded-lg p-1">
            <button
              onClick={() => setViewMode('today')}
              className={`
                px-3 py-1.5 text-sm font-medium rounded transition-colors
                ${viewMode === 'today'
                  ? 'bg-primary-500 dark:bg-primary-600 text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#353535]'
                }
              `}
            >
              Hoy
            </button>
            <button
              onClick={() => setViewMode('next3')}
              className={`
                px-3 py-1.5 text-sm font-medium rounded transition-colors
                ${viewMode === 'next3'
                  ? 'bg-primary-500 dark:bg-primary-600 text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#353535]'
                }
              `}
            >
              3 días
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`
                px-3 py-1.5 text-sm font-medium rounded transition-colors flex items-center gap-1.5
                ${viewMode === 'week'
                  ? 'bg-primary-500 dark:bg-primary-600 text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#353535]'
                }
              `}
            >
              <CalendarIcon className="w-4 h-4" />
              Semana
            </button>
          </div>
          
          <button
            onClick={handleNewTask}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-500 dark:bg-primary-600 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Tarea
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          <button
            onClick={clearError}
            className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Panel de tareas sugeridas */}
      {filteredSuggestions.length > 0 && (
        <SuggestedTasksPanel
          suggestions={filteredSuggestions}
          onAccept={handleAcceptSuggestion}
          onEdit={handleEditSuggestion}
          onDismiss={handleDismissSuggestion}
        />
      )}

      {/* Vista de días */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Cargando tareas...</p>
            </div>
          </div>
        ) : (
          <div className={`
            grid gap-4
            ${viewMode === 'today' 
              ? 'grid-cols-1 max-w-md mx-auto' 
              : viewMode === 'next3' 
                ? 'grid-cols-1 md:grid-cols-3' 
                : 'grid-cols-1 md:grid-cols-7'
            }
          `}>
            {daysToShow.map((date) => (
              <div
                key={formatDateKey(date)}
                className={`
                  bg-white dark:bg-[#252525] rounded-lg border border-slate-200 dark:border-[#3d3d3d] 
                  flex flex-col
                  ${viewMode === 'today' 
                    ? 'min-h-[500px] max-h-[600px]' 
                    : 'min-h-[400px] max-h-[calc(100vh-250px)]'
                  }
                  ${isToday(date) ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''}
                `}
              >
                <TaskDayView
                  date={date}
                  tasks={tasks}
                  leads={leads}
                  customColumns={customColumns}
                  onMarkDone={markAsDone}
                  onRegisterMessage={handleRegisterMessage}
                  onReschedule={handleReschedule}
                  onEditTask={handleEditTask}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de nueva/editar tarea */}
      <NewTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
          setEditingSuggestion(null);
        }}
        onSave={async (taskData) => {
          try {
            if (selectedTask && taskData.id) {
              // Modo edición de tarea existente
              await updateTaskStatus(selectedTask.id, taskData);
            } else {
              // Modo creación (nueva tarea o desde sugerencia)
              await addTask(taskData);
              // Si venía de una sugerencia, marcarla como descartada
              if (editingSuggestion) {
                const key = `${editingSuggestion.leadId}-${editingSuggestion.rule}-${suggestions.indexOf(editingSuggestion)}`;
                setDismissedSuggestions(prev => new Set(prev).add(key));
              }
            }
          } catch (err: any) {
            // El error ya se maneja en el modal
            throw err;
          }
        }}
        leads={leads}
        editingTask={selectedTask}
        defaultLeadId={editingSuggestion?.leadId}
        defaultDate={editingSuggestion?.suggestedDate}
        defaultChannel={editingSuggestion?.channel}
        defaultAction={editingSuggestion?.action}
      />
    </div>
  );
};
