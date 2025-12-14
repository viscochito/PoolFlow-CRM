import { useState, useEffect } from 'react';
import { Column } from '@/types';
import { COLUMNS } from '@/constants/columns';

const STORAGE_KEY = 'kanban_column_order';

export const useColumnOrder = (customColumns: Column[] = []) => {
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    // Cargar orden desde localStorage o usar el orden por defecto
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as string[];
        // Validar que todos los IDs existan en COLUMNS o customColumns
        const allColumns = [...COLUMNS, ...customColumns];
        const validIds = allColumns.map(c => c.id);
        const validOrder = parsed.filter(id => validIds.includes(id));
        // Agregar cualquier columna faltante al final
        const missingIds = validIds.filter(id => !validOrder.includes(id));
        return [...validOrder, ...missingIds];
      } catch {
        const allColumns = [...COLUMNS, ...customColumns];
        return allColumns.map(c => c.id);
      }
    }
    const allColumns = [...COLUMNS, ...customColumns];
    return allColumns.map(c => c.id);
  });

  useEffect(() => {
    // Actualizar orden cuando cambien las columnas personalizadas
    const allColumns = [...COLUMNS, ...customColumns];
    const allIds = allColumns.map(c => c.id);
    setColumnOrder(prev => {
      const validOrder = prev.filter(id => allIds.includes(id));
      const missingIds = allIds.filter(id => !validOrder.includes(id));
      return [...validOrder, ...missingIds];
    });
  }, [customColumns.length]); // Solo cuando cambie el número de columnas personalizadas

  useEffect(() => {
    // Guardar orden en localStorage cuando cambie
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columnOrder));
  }, [columnOrder]);

  const reorderColumns = (draggedColumnId: string, targetIndex: number) => {
    setColumnOrder(prev => {
      const newOrder = [...prev];
      const draggedIndex = newOrder.indexOf(draggedColumnId);
      
      if (draggedIndex === -1) {
        console.error('Column not found in order:', draggedColumnId);
        return prev;
      }
      
      // Si está en la misma posición, no hacer nada
      if (draggedIndex === targetIndex) {
        return prev;
      }
      
      // Remover de la posición actual
      newOrder.splice(draggedIndex, 1);
      
      // Ajustar el índice objetivo si el elemento arrastrado estaba antes del objetivo
      const adjustedIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
      
      // Insertar en la nueva posición
      newOrder.splice(adjustedIndex, 0, draggedColumnId);
      
      console.log('Reordering columns:', {
        draggedColumnId,
        draggedIndex,
        targetIndex,
        adjustedIndex,
        newOrder
      });
      
      return newOrder;
    });
  };

  const getOrderedColumns = () => {
    // Crear un mapa de columnas personalizadas primero (tienen prioridad)
    const customColumnsMap = new Map(customColumns.map(col => [col.id, col]));
    // Combinar: si existe personalizada, usar esa; si no, usar la predefinida
    const allColumns = COLUMNS.map(col => customColumnsMap.get(col.id) || col);
    // Agregar columnas personalizadas que no están en COLUMNS
    customColumns.forEach(col => {
      if (!COLUMNS.find(c => c.id === col.id)) {
        allColumns.push(col);
      }
    });
    
    return columnOrder
      .map(id => allColumns.find(col => col.id === id))
      .filter((col): col is NonNullable<typeof col> => col !== undefined);
  };

  return {
    columnOrder,
    reorderColumns,
    getOrderedColumns,
  };
};

