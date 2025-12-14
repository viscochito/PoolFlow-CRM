import { Check, X, Edit2, Sparkles } from 'lucide-react';
import { SuggestedTask } from '@/hooks/useFollowUpSuggestions';

interface SuggestedTasksPanelProps {
  suggestions: SuggestedTask[];
  onAccept: (suggestion: SuggestedTask) => void;
  onEdit: (suggestion: SuggestedTask) => void;
  onDismiss: (suggestion: SuggestedTask) => void;
}

export const SuggestedTasksPanel = ({
  suggestions,
  onAccept,
  onEdit,
  onDismiss,
}: SuggestedTasksPanelProps) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="mb-6 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary-500 dark:text-primary-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Tareas Sugeridas ({suggestions.length})
        </h3>
      </div>
      
      <div className="space-y-2">
        {suggestions.map((suggestion, idx) => (
          <div
            key={`${suggestion.leadId}-${suggestion.rule}-${idx}`}
            className="flex items-start justify-between p-3 bg-white dark:bg-[#2d2d2d] rounded-lg border border-slate-200 dark:border-[#3d3d3d] hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-primary-600 dark:text-primary-400 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 rounded">
                  {suggestion.rule}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                {suggestion.action}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {suggestion.reason}
              </p>
            </div>
            
            <div className="flex items-center gap-1 ml-3 flex-shrink-0">
              <button
                onClick={() => onAccept(suggestion)}
                className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                title="Aceptar y crear tarea"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(suggestion)}
                className="p-1.5 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                title="Editar antes de crear"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDismiss(suggestion)}
                className="p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-[#353535] rounded transition-colors"
                title="Descartar sugerencia"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

