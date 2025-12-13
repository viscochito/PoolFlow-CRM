import { Loader2 } from 'lucide-react';
import { Lead, ContactChannel } from '@/types';
import { COLUMNS } from '@/constants/columns';
import { LeadCard } from './LeadCard';

interface KanbanBoardProps {
  leads: Lead[];
  loading: boolean;
  draggedLeadId: string | null;
  dragOverColumnId: string | null;
  selectedLeadId: string | null;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, columnId: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetColumnId: string) => void;
  onLeadClick: (lead: Lead) => void;
  onToggleChannel: (lead: Lead, channelId: ContactChannel) => void;
  onUpdateName: (leadId: string, newName: string) => void;
}

export const KanbanBoard = ({
  leads,
  loading,
  draggedLeadId,
  dragOverColumnId,
  selectedLeadId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onLeadClick,
  onToggleChannel,
  onUpdateName,
}: KanbanBoardProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Cargando tablero...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-6 min-w-max pb-2">
      {COLUMNS.map(column => {
        const columnLeads = leads.filter(l => l.columnId === column.id);
        const isOver = dragOverColumnId === column.id;

        return (
          <div 
            key={column.id} 
            className={`w-80 flex flex-col h-full rounded-xl border transition-all duration-200 ease-in-out ${isOver ? 'bg-teal-50/80 dark:bg-teal-900/20 border-teal-400 dark:border-teal-600 shadow-inner scale-[1.01]' : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60'}`} 
            onDragOver={(e) => onDragOver(e, column.id)} 
            onDrop={(e) => onDrop(e, column.id)} 
            onDragLeave={onDragLeave}
          >
            <div className={`p-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 backdrop-blur-sm rounded-t-xl`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full border-2 ${column.color.replace('border-', 'bg-').split(' ')[0].replace('-400', '-500')}`}></div>
                <h3 className={`text-sm font-semibold transition-colors ${isOver ? 'text-teal-700 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {column.title}
                </h3>
                <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded text-xs font-medium">
                  {columnLeads.length}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
              {columnLeads.map(lead => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  isDragging={draggedLeadId === lead.id}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onClick={onLeadClick}
                  onToggleChannel={onToggleChannel}
                  onUpdateName={onUpdateName}
                  selected={selectedLeadId === lead.id}
                />
              ))}
              {columnLeads.length === 0 && (
                <div className={`h-24 flex items-center justify-center border-2 border-dashed rounded-lg m-2 transition-colors duration-200 ${isOver ? 'border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-teal-900/10' : 'border-slate-200 dark:border-slate-800 opacity-50'}`}>
                  <span className={`text-xs ${isOver ? 'text-teal-600 dark:text-teal-400 font-medium' : 'text-slate-400 dark:text-slate-600'}`}>
                    {isOver ? '¡Soltar aquí!' : 'Arrastra leads aquí'}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div className="w-4"></div>
    </div>
  );
};

