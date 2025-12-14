import React, { useState, useEffect, useRef } from 'react';
import { Loader2, GripVertical, Plus } from 'lucide-react';
import { Lead, ContactChannel, Service, Column } from '@/types';
import { LeadCard } from './LeadCard';
import { ColumnMenu } from './ColumnMenu';
import { AddLeadToColumn } from './AddLeadToColumn';

interface KanbanBoardProps {
  leads: Lead[];
  loading: boolean;
  draggedLeadId: string | null;
  dragOverColumnId: string | null;
  draggedColumnId: string | null;
  dragOverColumnIndex: number | null;
  columns: Column[];
  selectedLeadId: string | null;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, columnId: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetColumnId: string) => void;
  onLeadClick: (lead: Lead | null) => void;
  onToggleChannel: (lead: Lead, channelId: ContactChannel) => void;
  onUpdateName: (leadId: string, newName: string) => void;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
  onColumnDragStart: (e: React.DragEvent, columnId: string) => void;
  onColumnDragOver: (e: React.DragEvent, columnIndex: number) => void;
  onColumnDrop: (e: React.DragEvent, targetIndex: number) => void;
  onColumnDragEnd: () => void;
  onAddColumn: () => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddLeadToColumn: (name: string, columnId: string, contactChannels: ContactChannel[], service?: Service) => void;
}

export const KanbanBoard = ({
  leads,
  loading,
  draggedLeadId,
  dragOverColumnId,
  draggedColumnId,
  dragOverColumnIndex,
  columns,
  selectedLeadId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onLeadClick,
  onToggleChannel,
  onUpdateName,
  onEditLead,
  onDeleteLead,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDrop,
  onColumnDragEnd,
  onAddColumn,
  onEditColumn,
  onDeleteColumn,
  onAddLeadToColumn,
}: KanbanBoardProps) => {
  // Rastrear cuándo se movió cada lead a su columna actual
  const columnMoveTimestamps = useRef<Map<string, number>>(new Map());
  const previousLeadsRef = useRef<Lead[]>([]);

  // Detectar cambios de columna y registrar timestamp
  useEffect(() => {
    leads.forEach(lead => {
      const previousLead = previousLeadsRef.current.find(l => l.id === lead.id);
      if (previousLead && previousLead.columnId !== lead.columnId) {
        // La tarjeta cambió de columna, registrar timestamp
        columnMoveTimestamps.current.set(lead.id, Date.now());
      }
    });
    previousLeadsRef.current = leads;
  }, [leads]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Cargando tablero...</span>
      </div>
    );
  }

  const handleBoardClick = (e: React.MouseEvent) => {
    // Si se hace clic directamente en el contenedor del tablero (no en una tarjeta, columna u otro elemento interactivo), cerrar el panel
    const target = e.target as HTMLElement;
    // Solo cerrar si el click es directamente en el contenedor o en áreas vacías
    if (target === e.currentTarget || target.classList.contains('board-background')) {
      onLeadClick(null);
    }
  };

  return (
    <div className="flex gap-4 pb-2 items-start board-background" onClick={handleBoardClick}>
      {columns.map((column, columnIndex) => {
        // Filtrar leads de la columna
        const columnLeads = leads.filter(l => l.columnId === column.id);
        
        // Ordenar: las tarjetas que se movieron recientemente a esta columna van arriba,
        // luego el resto mantiene su orden original por fecha de creación
        const sortedLeads = [...columnLeads].sort((a, b) => {
          const aMoveTime = columnMoveTimestamps.current.get(a.id);
          const bMoveTime = columnMoveTimestamps.current.get(b.id);
          
          // Si ambas se movieron recientemente, ordenar por tiempo de movimiento (más reciente primero)
          if (aMoveTime && bMoveTime) {
            return bMoveTime - aMoveTime;
          }
          
          // Si solo una se movió recientemente, esa va primero
          if (aMoveTime && !bMoveTime) return -1;
          if (!aMoveTime && bMoveTime) return 1;
          
          // Si ninguna se movió recientemente, mantener orden por fecha de creación (más reciente primero)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        const isOver = dragOverColumnId === column.id;
        const isColumnDragging = draggedColumnId === column.id;
        const showDropIndicatorBefore = draggedColumnId && dragOverColumnIndex === columnIndex && draggedColumnId !== column.id;
        const showDropIndicatorAfter = draggedColumnId && dragOverColumnIndex === columnIndex + 1 && draggedColumnId !== column.id;

        return (
          <React.Fragment key={column.id}>
            {/* Zona de drop antes de la columna */}
            {draggedColumnId && (
              <div 
                className={`flex-shrink-0 transition-all duration-200 flex items-center ${
                  showDropIndicatorBefore
                    ? 'w-8' 
                    : 'w-2'
                }`}
                onDragOver={(e) => {
                  if (draggedColumnId !== column.id) {
                    e.preventDefault();
                    e.stopPropagation();
                    onColumnDragOver(e, columnIndex);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const columnId = e.dataTransfer.getData('columnId');
                  if (columnId) {
                    onColumnDrop(e, columnIndex);
                  }
                }}
              >
                {showDropIndicatorBefore && (
                  <div 
                    className="w-1 h-full bg-primary-500 dark:bg-primary-400 rounded-full mx-auto shadow-lg"
                    style={{ 
                      boxShadow: '0 0 8px rgba(43, 0, 113, 0.5)',
                      minHeight: '200px'
                    }}
                  />
                )}
              </div>
            )}
            
            <div 
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Si estamos arrastrando una columna, detectar en qué mitad estamos
                if (draggedColumnId && draggedColumnId !== column.id) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const isLeftHalf = x < rect.width / 2;
                  
                  // Determinar el índice objetivo basado en la posición
                  const targetIndex = isLeftHalf ? columnIndex : columnIndex + 1;
                  onColumnDragOver(e, targetIndex);
                } else if (!draggedColumnId) {
                  // Manejar drag de leads (no de columnas)
                  onDragOver(e, column.id);
                }
              }}
              onDrop={(e) => {
                e.stopPropagation();
                const columnId = e.dataTransfer.getData('columnId');
                if (columnId && draggedColumnId) {
                  // Si es drop de columna, determinar posición basada en la mitad
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const isLeftHalf = x < rect.width / 2;
                  const targetIndex = isLeftHalf ? columnIndex : columnIndex + 1;
                  onColumnDrop(e, targetIndex);
                } else if (!columnId) {
                  // Solo manejar drop de leads
                  onDrop(e, column.id);
                }
              }}
              onDragLeave={(e) => {
                // Solo manejar dragLeave si no estamos sobre otra columna
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  onDragLeave(e);
                }
              }}
              className={`min-w-[280px] flex-1 flex flex-col rounded-xl border transition-all duration-200 ease-in-out flex-shrink-0 ${
                isColumnDragging 
                  ? 'opacity-50 scale-95 cursor-grabbing rotate-2 shadow-2xl z-50' 
                  : isOver 
                  ? 'bg-slate-200/50 dark:bg-slate-700/30 border-slate-400 dark:border-slate-500 shadow-inner scale-[1.01]' 
                  : 'bg-slate-100/50 dark:bg-[#2d2d2d] border-slate-200/60 dark:border-[#3d3d3d]'
              }`}
            >
            <div 
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                onColumnDragStart(e, column.id);
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                onColumnDragEnd();
              }}
              className="p-3 flex items-center justify-between border-b border-slate-200 dark:border-[#3d3d3d] bg-white/50 dark:bg-[#252525] backdrop-blur-sm rounded-t-xl flex-shrink-0 column-header cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center gap-2 flex-1">
                <GripVertical className="w-4 h-4 text-slate-400 dark:text-slate-600 flex-shrink-0 pointer-events-none" />
                <div className={`w-2 h-2 rounded-full ${column.dotColor || 'bg-slate-400 dark:bg-slate-500'}`}></div>
                <h3 
                  className={`text-sm font-semibold transition-colors flex-1 ${isOver ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  {column.title}
                </h3>
                <span className="bg-slate-200 dark:bg-[#3d3d3d] text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded text-xs font-medium">
                  {columnLeads.length}
                </span>
                <ColumnMenu
                  column={column}
                  isCustom={column.isCustom || false}
                  onEdit={onEditColumn}
                  onDelete={onDeleteColumn}
                  leadCount={columnLeads.length}
                />
              </div>
            </div>
            <div 
              className="p-2 space-y-3 min-h-[100px] max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar"
              onDragStart={(e) => {
                // Si se está arrastrando una tarjeta, prevenir que se active el drag de la columna
                const target = e.target as HTMLElement;
                if (target.closest('[data-lead-id]')) {
                  e.stopPropagation();
                } else {
                  // Si no es una tarjeta, prevenir el drag de la columna desde aquí
                  e.preventDefault();
                }
              }}
            >
              {sortedLeads.map(lead => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  isDragging={draggedLeadId === lead.id}
                  onDragStart={(e, leadId) => {
                    e.stopPropagation();
                    onDragStart(e, leadId);
                  }}
                  onDragEnd={(e) => {
                    e.stopPropagation();
                    onDragEnd();
                  }}
                  onClick={onLeadClick}
                  onToggleChannel={onToggleChannel}
                  onUpdateName={onUpdateName}
                  onEdit={onEditLead}
                  onDelete={onDeleteLead}
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
              
              {/* Componente para agregar lead directamente en la columna */}
              <AddLeadToColumn
                columnId={column.id}
                onAddLead={onAddLeadToColumn}
              />
            </div>
          </div>
          
          {/* Zona de drop después de la columna */}
          {draggedColumnId && (
            <div 
              className={`flex-shrink-0 transition-all duration-200 flex items-center ${
                showDropIndicatorAfter
                  ? 'w-8' 
                  : 'w-2'
              }`}
              onDragOver={(e) => {
                if (draggedColumnId !== column.id) {
                  e.preventDefault();
                  e.stopPropagation();
                  onColumnDragOver(e, columnIndex + 1);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const columnId = e.dataTransfer.getData('columnId');
                if (columnId) {
                  onColumnDrop(e, columnIndex + 1);
                }
              }}
            >
              {showDropIndicatorAfter && (
                <div 
                  className="w-1 h-full bg-primary-500 dark:bg-primary-400 rounded-full mx-auto shadow-lg"
                  style={{ 
                    boxShadow: '0 0 8px rgba(43, 0, 113, 0.5)',
                    minHeight: '200px'
                  }}
                />
              )}
            </div>
          )}
          </React.Fragment>
        );
      })}
      
      {/* Botón para agregar nueva columna */}
      <div className="min-w-[280px] flex-shrink-0">
        <button
          onClick={onAddColumn}
          className="w-full h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-[#3d3d3d] rounded-xl bg-slate-50/50 dark:bg-[#2d2d2d] hover:bg-slate-100 dark:hover:bg-[#353535] hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 group"
        >
          <Plus className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
            Nueva Columna
          </span>
        </button>
      </div>
      
      <div className="w-4"></div>
    </div>
  );
};

