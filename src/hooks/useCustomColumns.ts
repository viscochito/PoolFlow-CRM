import { useState, useEffect } from 'react';
import { Column } from '@/types';

const STORAGE_KEY = 'custom_columns';

export const useCustomColumns = () => {
  const [customColumns, setCustomColumns] = useState<Column[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as Column[];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customColumns));
  }, [customColumns]);

  const addColumn = (column: Column) => {
    setCustomColumns(prev => [...prev, column]);
  };

  const removeColumn = (columnId: string) => {
    setCustomColumns(prev => prev.filter(col => col.id !== columnId));
  };

  const updateColumn = (columnId: string, updates: Partial<Column>) => {
    setCustomColumns(prev =>
      prev.map(col => (col.id === columnId ? { ...col, ...updates } : col))
    );
  };

  return {
    customColumns,
    addColumn,
    removeColumn,
    updateColumn,
  };
};

