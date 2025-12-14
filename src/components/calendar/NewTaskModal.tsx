import { useState, useEffect } from 'react';
import { X, Calendar, MessageSquare } from 'lucide-react';
import { Task, Lead, TaskChannel } from '@/types';
import { formatDateKey } from '@/utils/dateHelpers';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => Promise<void>;
  leads: Lead[];
  defaultLeadId?: string;
  defaultDate?: string;
  defaultChannel?: TaskChannel;
  defaultAction?: string;
  editingTask?: Task | null;
}

const commonActions = [
  'Follow-up',
  'Enviar video Loom',
  'Responder mensaje',
  'Último intento de contacto',
  'Llamar',
  'Enviar presupuesto',
  'Consultar feedback',
];

export const NewTaskModal = ({
  isOpen,
  onClose,
  onSave,
  leads,
  defaultLeadId,
  defaultDate,
  defaultChannel,
  defaultAction,
  editingTask,
}: NewTaskModalProps) => {
  const [leadId, setLeadId] = useState(defaultLeadId || '');
  const [date, setDate] = useState(defaultDate || formatDateKey(new Date()));
  const [action, setAction] = useState(defaultAction || '');
  const [customAction, setCustomAction] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<Task['status']>('pending');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        // Modo edición
        setLeadId(editingTask.leadId);
        setDate(editingTask.date);
        setAction(editingTask.action);
        setCustomAction('');
        setNote(editingTask.note || '');
        setStatus(editingTask.status);
      } else {
        // Modo creación
        setLeadId(defaultLeadId || '');
        setDate(defaultDate || formatDateKey(new Date()));
        setAction(defaultAction || '');
        setCustomAction('');
        setNote('');
        setStatus('pending');
      }
      setSaveError(null);
    }
  }, [isOpen, editingTask, defaultLeadId, defaultDate, defaultChannel, defaultAction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || (!action && !customAction)) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      const taskData: Partial<Task> = {
        leadId,
        date,
        channel: editingTask ? editingTask.channel : 'whatsapp', // Mantener el canal existente o usar whatsapp por defecto
        action: action || customAction,
        note: note || undefined,
        status: editingTask ? status : 'pending',
      };
      
      if (editingTask) {
        taskData.id = editingTask.id;
      }
      
      await onSave(taskData);
      onClose();
    } catch (err: any) {
      console.error('Error saving task:', err);
      setSaveError(err?.message || `Error al ${editingTask ? 'actualizar' : 'crear'} la tarea. Verifica que la tabla de tareas exista en Supabase.`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#252525] rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-[#3d3d3d] flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#353535] transition-colors text-slate-500 dark:text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error message */}
          {saveError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{saveError}</p>
            </div>
          )}
          {/* Lead */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Lead *
            </label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#2d2d2d] border border-slate-300 dark:border-[#3d3d3d] rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
              required
            >
              <option value="">Seleccionar lead...</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Fecha *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#2d2d2d] border border-slate-300 dark:border-[#3d3d3d] rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
              required
            />
          </div>

          {/* Acción */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Acción *
            </label>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                if (e.target.value) setCustomAction('');
              }}
              className="w-full px-3 py-2 bg-white dark:bg-[#2d2d2d] border border-slate-300 dark:border-[#3d3d3d] rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent mb-2"
            >
              <option value="">Seleccionar acción común...</option>
              {commonActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={customAction}
              onChange={(e) => {
                setCustomAction(e.target.value);
                if (e.target.value) setAction('');
              }}
              placeholder="O escribir acción personalizada..."
              className="w-full px-3 py-2 bg-white dark:bg-[#2d2d2d] border border-slate-300 dark:border-[#3d3d3d] rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
            />
            {editingTask && !action && !customAction && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                La acción es requerida
              </p>
            )}
          </div>

          {/* Nota */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nota (opcional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-white dark:bg-[#2d2d2d] border border-slate-300 dark:border-[#3d3d3d] rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
              placeholder="Notas adicionales sobre la tarea..."
            />
          </div>

          {/* Estado (solo en modo edición) */}
          {editingTask && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Task['status'])}
                className="w-full px-3 py-2 bg-white dark:bg-[#2d2d2d] border border-slate-300 dark:border-[#3d3d3d] rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
              >
                <option value="pending">Pendiente</option>
                <option value="done">Completada</option>
                <option value="rescheduled">Reprogramada</option>
              </select>
            </div>
          )}

          {/* Botones */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#353535] rounded-lg hover:bg-slate-200 dark:hover:bg-[#404040] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || !leadId || (!action && !customAction)}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 dark:bg-primary-600 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Guardando...' : editingTask ? 'Guardar Cambios' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

