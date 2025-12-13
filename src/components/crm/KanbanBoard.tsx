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
    <div className="flex gap-4 pb-2 items-start">
      {COLUMNS.map(column => {
        const columnLeads = leads.filter(l => l.columnId === column.id);
        const isOver = dragOverColumnId === column.id;

        return (
          <div 
            key={column.id} 
            className={`min-w-[280px] flex-1 flex flex-col rounded-xl border transition-all duration-200 ease-in-out flex-shrink-0 ${
              isOver 
                ? 'bg-slate-200/50 dark:bg-slate-700/30 border-slate-400 dark:border-slate-500 shadow-inner scale-[1.01]' 
                : 'bg-slate-100/50 dark:bg-[#2d2d2d] border-slate-200/60 dark:border-[#3d3d3d]'
            }`}
            onDragOver={(e) => onDragOver(e, column.id)} 
            onDrop={(e) => onDrop(e, column.id)} 
            onDragLeave={onDragLeave}
          >
            <div className="p-3 flex items-center justify-between border-b border-slate-200 dark:border-[#3d3d3d] bg-white/50 dark:bg-[#252525] backdrop-blur-sm rounded-t-xl flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full border-2 ${column.color.replace('border-', 'bg-').split(' ')[0].replace('-400', '-500')}`}></div>
                <h3 
                  className={`text-sm font-semibold transition-colors ${isOver ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  {column.title}
                </h3>
                <span className="bg-slate-200 dark:bg-[#3d3d3d] text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded text-xs font-medium">
                  {columnLeads.length}
                </span>
              </div>
            </div>
            <div className="p-2 space-y-3 min-h-[100px] max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
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
                <div className={`h-24 flex items-center justify-center border-2 border-dashed rounded-lg m-2 transition-colors duration-200 ${isOver ? '' : 'border-slate-200 dark:border-[#3d3d3d] opacity-50'}`}
                    style={isOver ? {
                      borderColor: 'rgba(100, 116, 139, 0.4)',
                      backgroundColor: 'rgba(100, 116, 139, 0.05)'
                    } : {}}
                >
                  <span 
                    className={`text-xs ${isOver ? 'font-medium' : 'text-slate-400 dark:text-slate-600'}`}
                    style={isOver ? { color: '#64748b' } : {}}
                  >
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

