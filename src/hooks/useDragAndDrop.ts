import { useState } from 'react';
import { LeadStatus } from '@/types';

interface UseDragAndDropReturn {
  draggedLeadId: string | null;
  dragOverColumnId: string | null;
  handleDragStart: (e: React.DragEvent, leadId: string) => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent, columnId: string) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetColumnId: string, onUpdateColumn: (leadId: string, columnId: LeadStatus) => void) => void;
}

export const useDragAndDrop = (): UseDragAndDropReturn => {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => { setDraggedLeadId(leadId); }, 0);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (dragOverColumnId !== columnId) setDragOverColumnId(columnId);
  };

  const handleDragLeave = (_e: React.DragEvent) => {
    // Puede ser implementado si se necesita lógica adicional
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string, onUpdateColumn: (leadId: string, columnId: LeadStatus) => void) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      onUpdateColumn(leadId, targetColumnId as LeadStatus);
    }
    setDraggedLeadId(null);
    setDragOverColumnId(null);
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverColumnId(null);
  };

  return {
    draggedLeadId,
    dragOverColumnId,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};

