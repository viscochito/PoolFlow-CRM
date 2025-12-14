import { useState, useEffect, useRef } from 'react';
import { MessageSquare, DollarSign, Clock, AlertCircle, Edit2, Trash2, FileText, ChevronRight } from 'lucide-react';
import { Lead, ContactChannel, Column } from '@/types';
import { safeText, formatTimeAgo } from '@/utils/helpers';
import { Badge } from '@/components/ui/Badge';
import { ContactToggles } from './ContactToggles';
import { ServiceTags } from './ServiceTags';

interface LeadCardProps {
  lead: Lead;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onDragEnd: (e?: React.DragEvent) => void;
  onClick: (lead: Lead | null) => void;
  onToggleChannel: (lead: Lead, channelId: ContactChannel) => void;
  onUpdateName: (leadId: string, newName: string) => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
  selected: boolean;
  columns: Column[];
  onMoveToNextColumn?: (leadId: string, nextColumnId: string) => void;
}

export const LeadCard = ({ 
  lead, 
  isDragging, 
  onDragStart, 
  onDragEnd, 
  onClick, 
  onToggleChannel, 
  onUpdateName,
  onEdit,
  onDelete,
  selected,
  columns,
  onMoveToNextColumn
}: LeadCardProps) => {
  const timeAgoData = formatTimeAgo(lead.lastContact);
  const [name, setName] = useState(lead.name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const deleteConfirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    setName(lead.name || ''); 
  }, [lead.name]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deleteConfirmRef.current && !deleteConfirmRef.current.contains(event.target as Node)) {
        setShowDeleteConfirm(false);
      }
    };

    if (showDeleteConfirm) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDeleteConfirm]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(lead);
    } else {
      // Si no hay función onEdit, abrir el panel lateral
      onClick(lead);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(lead.id);
      setShowDeleteConfirm(false);
    }
  };

  const handleSaveName = () => {
    setIsEditingName(false);
    if (name !== lead.name && name.trim() !== '') {
      onUpdateName(lead.id, name);
    } else if (name.trim() === '') {
      setName(lead.name || ''); 
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { 
      e.preventDefault(); 
      handleSaveName(); 
    }
  };

  // Obtener la siguiente columna disponible
  const getNextColumn = () => {
    const currentIndex = columns.findIndex(col => col.id === lead.columnId);
    if (currentIndex === -1 || currentIndex === columns.length - 1) {
      return null; // No hay siguiente columna
    }
    return columns[currentIndex + 1];
  };

  const nextColumn = getNextColumn();

  // Debug: verificar si hay siguiente columna
  useEffect(() => {
    if (nextColumn) {
      console.log('✅ Flecha disponible para lead:', lead.name, 'Siguiente columna:', nextColumn.title);
    } else {
      console.log('❌ No hay siguiente columna para lead:', lead.name, 'Columna actual:', lead.columnId);
    }
  }, [nextColumn, lead.name, lead.columnId]);

  const handleMoveToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nextColumn && onMoveToNextColumn) {
      onMoveToNextColumn(lead.id, nextColumn.id);
    }
  };

  return (
    <div 
      draggable
      data-lead-id={lead.id}
      onDragStart={(e) => {
        e.stopPropagation();
        onDragStart(e, lead.id);
      }}
      onDragEnd={(e) => {
        e.stopPropagation();
        onDragEnd(e);
      }}
      onClick={(e) => {
        // No hacer nada si el clic fue en los botones de editar/eliminar/flecha o en sus contenedores
        const target = e.target as HTMLElement;
        if (target.closest('button[title="Editar lead"]') || 
            target.closest('button[title="Eliminar lead"]') ||
            target.closest('button[title*="Mover a:"]') ||
            target.closest('.delete-confirm-container')) {
          return;
        }
        e.stopPropagation();
        // Si la tarjeta ya está seleccionada, deseleccionarla (cerrar panel)
        if (selected) {
          onClick(null as any); // Pasar null para cerrar
        } else {
          onClick(lead);
        }
      }}
      className={`
        group bg-white dark:bg-[#2d2d2d] p-2 rounded-lg shadow-sm border
        cursor-grab active:cursor-grabbing relative select-none
        transform transition-all duration-200 ease-out
        ${selected ? 'shadow-md' : 'border-slate-100 dark:border-[#3d3d3d]'}
        hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-slate-900/50
        active:scale-105 active:rotate-2 active:shadow-xl active:z-50
        ${isDragging ? 'border-2 border-solid border-slate-400 dark:border-slate-500 shadow-2xl scale-105 rotate-0 opacity-100 z-50' : ''}
      `}
      style={selected ? { 
        borderColor: '#64748b',
        boxShadow: '0 0 0 2px rgba(100, 116, 139, 0.2), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      } : {}}
    >
      {lead.source !== 'Directo' && (
        <div className="flex justify-between items-start mb-1 relative z-0">
          <Badge type={lead.source} />
        </div>
      )}

      {/* Iconos de editar, eliminar y flecha */}
      <div 
        className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Flecha para mover al siguiente estado */}
        {nextColumn && onMoveToNextColumn && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMoveToNext(e);
            }}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#353535] transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            title={`Mover a: ${nextColumn.title}`}
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
        {onEdit && (
          <button
            onClick={handleEdit}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#353535] transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            title="Editar lead"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        )}
        {onDelete && (
          <div className="relative">
            <button
              onClick={handleDelete}
              className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
              title="Eliminar lead"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            
            {/* Confirmación de eliminación */}
            {showDeleteConfirm && (
              <div
                ref={deleteConfirmRef}
                className="delete-confirm-container absolute right-0 top-6 z-50 bg-white dark:bg-[#2d2d2d] border border-slate-200 dark:border-[#3d3d3d] rounded-lg shadow-lg min-w-[200px] p-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-2 mb-3">
                  <div className="p-1 bg-red-100 dark:bg-red-900/20 rounded">
                    <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mb-1">
                      Eliminar lead
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-2 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(false);
                    }}
                    className="flex-1 px-2 py-1 text-xs font-medium bg-slate-200 dark:bg-[#3d3d3d] hover:bg-slate-300 dark:hover:bg-[#4d4d4d] text-slate-700 dark:text-slate-300 rounded transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mb-1 relative min-h-[1.25rem]">
        {isEditingName ? (
          <input
            ref={nameInputRef}
            onClick={(e) => e.stopPropagation()}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleNameKeyDown}
            className="font-bold text-slate-900 dark:text-white text-sm w-full bg-slate-50 dark:bg-[#353535] border-b-2 border-slate-400 focus:outline-none p-0 leading-tight"
          />
        ) : (
          <h4 
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingName(true);
            }}
            className="font-bold text-slate-900 dark:text-white text-sm leading-tight cursor-text truncate"
            title="Doble click para editar nombre"
          >
            {safeText(name)}
          </h4>
        )}
      </div>

      <div className="mb-1.5 min-h-[1.25rem] flex items-start gap-1.5">
        <FileText className="w-2.5 h-2.5 mt-0.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
        <div 
          className={`
            text-[11px] py-0 px-0 rounded-md border border-transparent transition-all leading-tight line-clamp-2
            ${!lead.context ? 'text-slate-400 italic' : 'text-slate-600 dark:text-slate-300'}
          `}
          title="Última actividad registrada"
        >
          {safeText(lead.context || "Sin actividad reciente...")}
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] text-slate-500 dark:text-slate-500 truncate">{safeText(lead.projectType)}</p>
        {lead.budget && (
          <div className="flex items-center gap-0.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-[#353535] px-1 py-0.5 rounded">
            <DollarSign className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" />
            {safeText(lead.budget)}
          </div>
        )}
      </div>

      <div className="flex justify-end mb-1">
        <div className={`flex items-center gap-0.5 text-[10px] font-medium ${timeAgoData.alert ? 'text-red-500 animate-pulse' : 'text-slate-400 dark:text-slate-500'}`}>
          {timeAgoData.alert ? <AlertCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
          <span>{safeText(timeAgoData.text)}</span>
        </div>
      </div>

      <ContactToggles 
        activeChannels={lead.contactChannels} 
        onToggle={(channelId) => onToggleChannel(lead, channelId)} 
      />

      <ServiceTags services={lead.services || []} />
    </div>
  );
};

