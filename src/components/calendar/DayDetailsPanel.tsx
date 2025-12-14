import { X, Clock, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Lead, Column } from '@/types';
import { formatTimeAgo, safeText } from '@/utils/helpers';
import { COLUMNS } from '@/constants/columns';
import { formatDateKey, startOfDay } from '@/utils/dateHelpers';

interface DayDetailsPanelProps {
  date: Date;
  leads: Lead[];
  actionLeads: Lead[];
  onClose: () => void;
  onLeadClick: (lead: Lead) => void;
  customColumns?: Column[];
}

export const DayDetailsPanel = ({ date, leads, actionLeads, onClose, onLeadClick, customColumns = [] }: DayDetailsPanelProps) => {
  // Función para obtener el título de la columna
  const getColumnTitle = (columnId: string): string => {
    const allColumns = [...COLUMNS, ...customColumns];
    const column = allColumns.find(c => c.id === columnId);
    return column?.title || columnId;
  };
  const formattedDate = date.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-white dark:bg-[#252525] shadow-2xl border-l border-slate-200 dark:border-[#3d3d3d] transform transition-transform duration-300 ease-out z-50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-[#3d3d3d] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {actionLeads.length > 0 && (
              <span className="text-primary-600 dark:text-primary-400 font-medium">
                {actionLeads.length} acción{actionLeads.length !== 1 ? 'es' : ''} pendiente{actionLeads.length !== 1 ? 's' : ''}
                {leads.length > 0 && ' • '}
              </span>
            )}
            {leads.length} lead{leads.length !== 1 ? 's' : ''} con actividad
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#353535] transition-colors text-slate-500 dark:text-slate-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Lista de leads */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Sección de Acciones Pendientes */}
        {actionLeads.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-primary-500 dark:text-primary-400" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Acciones Pendientes ({actionLeads.length})
              </h3>
            </div>
            <div className="space-y-2 mb-4">
              {actionLeads.map(lead => {
                const timeAgoData = formatTimeAgo(lead.lastContact);
                const isToday = formatDateKey(date) === formatDateKey(startOfDay(new Date()));
                return (
                  <div
                    key={lead.id}
                    onClick={() => onLeadClick(lead)}
                    className="p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                        {safeText(lead.name)}
                      </h4>
                      {lead.urgency === 'Alta' && (
                        <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      {lead.columnId === 'new' && (!lead.contactChannels || lead.contactChannels.length === 0)
                        ? 'Nuevo lead sin contactar'
                        : lead.columnId === 'negotiation'
                        ? 'Negociación requiere seguimiento'
                        : lead.urgency === 'Alta'
                        ? 'Urgencia alta'
                        : 'Requiere seguimiento'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{safeText(timeAgoData.text)}</span>
                      </div>
                      {lead.columnId && (
                        <span className="px-2 py-0.5 bg-white dark:bg-[#353535] rounded text-xs">
                          {getColumnTitle(lead.columnId)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sección de Contactos Recientes */}
        {leads.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Contactos Recientes ({leads.length})
              </h3>
            </div>
            <div className="space-y-2">
              {leads.map(lead => {
                const timeAgoData = formatTimeAgo(lead.lastContact);
                return (
                  <div
                    key={lead.id}
                    onClick={() => onLeadClick(lead)}
                    className={`p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all ${
                      actionLeads.some(al => al.id === lead.id)
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 hover:border-primary-500 dark:hover:border-primary-400'
                        : 'bg-white dark:bg-[#2d2d2d] border-slate-200 dark:border-[#3d3d3d] hover:border-primary-500 dark:hover:border-primary-400'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {safeText(lead.name)}
                      </h3>
                      {lead.urgency === 'Alta' && (
                        <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                      {safeText(lead.context || 'Sin actividad registrada')}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{safeText(timeAgoData.text)}</span>
                      </div>
                      {lead.columnId && (
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#353535] rounded text-xs">
                          {getColumnTitle(lead.columnId)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay leads */}
        {leads.length === 0 && actionLeads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 dark:text-slate-500">
              No hay leads con actividad en este día
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

