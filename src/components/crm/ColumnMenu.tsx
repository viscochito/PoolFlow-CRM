import { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, X } from 'lucide-react';
import { Column } from '@/types';

interface ColumnMenuProps {
  column: Column;
  isCustom: boolean;
  onEdit: (column: Column) => void;
  onDelete: (columnId: string) => void;
  leadCount: number;
}

export const ColumnMenu = ({ column, isCustom, onEdit, onDelete, leadCount }: ColumnMenuProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const confirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (confirmRef.current && !confirmRef.current.contains(event.target as Node)) {
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
    onEdit(column);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Mostrar confirmación siempre, independientemente de si tiene leads o no
    setShowDeleteConfirm(true);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(column.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="relative flex items-center gap-1">
      {/* Icono de editar */}
      <button
        onClick={handleEdit}
        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-[#353535] transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        title="Editar columna"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {/* Icono de eliminar (en todas las columnas) */}
      <button
        onClick={handleDelete}
        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
        title="Eliminar columna"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && (
        <div
          ref={confirmRef}
          className="absolute right-0 top-8 z-50 bg-white dark:bg-[#2d2d2d] border border-slate-200 dark:border-[#3d3d3d] rounded-lg shadow-lg min-w-[240px] p-3"
        >
          <div className="flex items-start gap-2 mb-3">
            <div className="p-1.5 bg-red-100 dark:bg-red-900/20 rounded">
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
                Eliminar columna
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {leadCount > 0
                  ? `Esta columna tiene ${leadCount} lead${leadCount > 1 ? 's' : ''}. Los leads se moverán a "Nuevo Lead".`
                  : 'Esta acción no se puede deshacer.'}
                {!isCustom && ' Las columnas predefinidas se convertirán en personalizadas.'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={confirmDelete}
              className="flex-1 px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Eliminar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(false);
              }}
              className="flex-1 px-3 py-1.5 text-xs font-medium bg-slate-200 dark:bg-[#3d3d3d] hover:bg-slate-300 dark:hover:bg-[#4d4d4d] text-slate-700 dark:text-slate-300 rounded transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

