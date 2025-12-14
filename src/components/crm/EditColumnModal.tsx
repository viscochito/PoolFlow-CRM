import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Column } from '@/types';

const COLOR_OPTIONS = [
  { color: 'border-slate-400 dark:border-slate-500', dotColor: 'bg-slate-400 dark:bg-slate-500', label: 'Gris', bgValue: 'bg-slate-400' },
  { color: 'border-blue-400 dark:border-blue-500', dotColor: 'bg-blue-400 dark:bg-blue-500', label: 'Azul', bgValue: 'bg-blue-400' },
  { color: 'border-yellow-400 dark:border-yellow-500', dotColor: 'bg-yellow-400 dark:bg-yellow-500', label: 'Amarillo', bgValue: 'bg-yellow-400' },
  { color: 'border-cyan-400 dark:border-cyan-500', dotColor: 'bg-cyan-400 dark:bg-cyan-500', label: 'Cian', bgValue: 'bg-cyan-400' },
  { color: 'border-purple-400 dark:border-purple-500', dotColor: 'bg-purple-400 dark:bg-purple-500', label: 'Morado', bgValue: 'bg-purple-400' },
  { color: 'border-orange-400 dark:border-orange-500', dotColor: 'bg-orange-400 dark:bg-orange-500', label: 'Naranja', bgValue: 'bg-orange-400' },
  { color: 'border-green-400 dark:border-green-500', dotColor: 'bg-green-400 dark:bg-green-500', label: 'Verde', bgValue: 'bg-green-400' },
  { color: 'border-red-400 dark:border-red-500', dotColor: 'bg-red-400 dark:bg-red-500', label: 'Rojo', bgValue: 'bg-red-400' },
  { color: 'border-pink-400 dark:border-pink-500', dotColor: 'bg-pink-400 dark:bg-pink-500', label: 'Rosa', bgValue: 'bg-pink-400' },
  { color: 'border-indigo-400 dark:border-indigo-500', dotColor: 'bg-indigo-400 dark:bg-indigo-500', label: 'Índigo', bgValue: 'bg-indigo-400' },
];

interface EditColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (column: Column) => void;
  column: Column | null;
  isSaving: boolean;
}

export const EditColumnModal = ({ isOpen, onClose, onSave, column, isSaving }: EditColumnModalProps) => {
  const [title, setTitle] = useState('');
  const [selectedColorOption, setSelectedColorOption] = useState(COLOR_OPTIONS[0]);

  useEffect(() => {
    if (column && isOpen) {
      setTitle(column.title);
      const colorOption = COLOR_OPTIONS.find(opt => opt.color === column.color && opt.dotColor === column.dotColor);
      if (colorOption) {
        setSelectedColorOption(colorOption);
      }
    }
  }, [column, isOpen]);

  if (!isOpen || !column) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...column,
      title: title.trim(),
      color: selectedColorOption.color,
      dotColor: selectedColorOption.dotColor,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-2xl w-full max-w-[500px] overflow-hidden transform transition-all scale-100 p-8 border dark:border-[#3d3d3d]">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Editar Columna</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Nombre de la Columna
            </label>
            <input 
              type="text" 
              placeholder="Ej: En seguimiento..." 
              className="w-full px-4 py-3 bg-white dark:bg-[#353535] border border-slate-200 dark:border-[#3d3d3d] rounded-lg text-sm text-slate-700 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 focus:border-transparent outline-none transition-all" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              autoFocus
            />
          </div>
          
          <div className="mb-8">
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.color}
                  type="button"
                  onClick={() => setSelectedColorOption(option)}
                  className={`
                    relative h-12 rounded-lg border-2 transition-all ${option.bgValue}
                    ${selectedColorOption.color === option.color 
                      ? 'border-slate-800 dark:border-slate-200 scale-105 shadow-lg ring-2 ring-slate-400 dark:ring-slate-500' 
                      : 'border-slate-200 dark:border-[#3d3d3d] hover:border-slate-400 dark:hover:border-slate-500'
                    }
                  `}
                >
                  {selectedColorOption.color === option.color && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white dark:bg-slate-900 shadow-md"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="text-sm font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSaving || !title.trim()} 
              className="text-white px-6 py-3 rounded-lg text-sm font-bold shadow-lg dark:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#2b0071',
                boxShadow: isSaving ? 'none' : '0 10px 15px -3px rgba(43, 0, 113, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (!isSaving) e.currentTarget.style.backgroundColor = '#35008a';
              }}
              onMouseLeave={(e) => {
                if (!isSaving) e.currentTarget.style.backgroundColor = '#2b0071';
              }}
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} 
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

