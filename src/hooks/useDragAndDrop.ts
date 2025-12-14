import { useState } from 'react';
import { LeadStatus } from '@/types';

interface UseDragAndDropReturn {
  draggedLeadId: string | null;
  dragOverColumnId: string | null;
  draggedColumnId: string | null;
  dragOverColumnIndex: number | null;
  handleDragStart: (e: React.DragEvent, leadId: string) => void;
  handleDragEnd: (e?: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent, columnId: string) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetColumnId: string, onUpdateColumn: (leadId: string, columnId: string) => void) => void;
  handleColumnDragStart: (e: React.DragEvent, columnId: string) => void;
  handleColumnDragOver: (e: React.DragEvent, columnIndex: number) => void;
  handleColumnDrop: (e: React.DragEvent, targetIndex: number, onReorderColumns: (draggedColumnId: LeadStatus, targetIndex: number) => void) => void;
  handleColumnDragEnd: () => void;
}

export const useDragAndDrop = (): UseDragAndDropReturn => {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnIndex, setDragOverColumnIndex] = useState<number | null>(null);

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

  const handleDrop = (e: React.DragEvent, targetColumnId: string, onUpdateColumn: (leadId: string, columnId: string) => void) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      onUpdateColumn(leadId, targetColumnId as LeadStatus);
    }
    setDraggedLeadId(null);
    setDragOverColumnId(null);
  };

  const handleDragEnd = (_e?: React.DragEvent) => {
    setDraggedLeadId(null);
    setDragOverColumnId(null);
  };

  const handleColumnDragStart = (e: React.DragEvent, columnId: string) => {
    e.dataTransfer.setData('columnId', columnId);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => { setDraggedColumnId(columnId); }, 0);
  };

  const handleColumnDragOver = (e: React.DragEvent, columnIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverColumnIndex !== columnIndex) {
      setDragOverColumnIndex(columnIndex);
    }
  };

  const handleColumnDrop = (e: React.DragEvent, targetIndex: number, onReorderColumns: (draggedColumnId: LeadStatus, targetIndex: number) => void) => {
    e.preventDefault();
    e.stopPropagation();
    const columnId = e.dataTransfer.getData('columnId');
    if (columnId) {
        onReorderColumns(columnId, targetIndex);
    }
    setDraggedColumnId(null);
    setDragOverColumnIndex(null);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumnId(null);
    setDragOverColumnIndex(null);
  };

  return {
    draggedLeadId,
    dragOverColumnId,
    draggedColumnId,
    dragOverColumnIndex,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleColumnDragStart,
    handleColumnDragOver,
    handleColumnDrop,
    handleColumnDragEnd,
  };
};

