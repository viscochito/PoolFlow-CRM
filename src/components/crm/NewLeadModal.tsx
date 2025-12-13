import { useState } from 'react';
import { X, PlayCircle, Hammer, Loader2 } from 'lucide-react';
import { extractBusinessName } from '@/utils/helpers';
import { Lead } from '@/types';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: Partial<Lead>) => void;
  isSaving: boolean;
}

export const NewLeadModal = ({ isOpen, onClose, onSave, isSaving }: NewLeadModalProps) => {
  const [strategy, setStrategy] = useState<'demo' | 'custom'>('demo');
  const [contact, setContact] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: company || 'Sin nombre',
      email: contact.includes('@') ? contact : '',
      phone: !contact.includes('@') && !contact.includes('http') ? contact : '',
      projectType: strategy === 'demo' ? 'Interesado en Demo 3D' : 'MVP Custom Solicitado',
      source: 'Directo',
      location: '',
      context: notes,
      contactChannels: []
    });
  };

  const handleContactBlur = () => {
    const extractedName = extractBusinessName(contact);
    if (extractedName) setCompany(extractedName);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-2xl w-full max-w-[500px] overflow-hidden transform transition-all scale-100 p-8 border dark:border-[#3d3d3d]">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Nuevo Lead</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Estrategia de Venta</label>
            <div className="flex gap-4">
              <div 
                onClick={() => setStrategy('demo')} 
                className={`flex-1 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${strategy === 'demo' ? '' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-400 dark:text-slate-500'}`}
                style={strategy === 'demo' ? {
                  borderColor: '#2b0071',
                  backgroundColor: 'rgba(43, 0, 113, 0.1)',
                  color: '#ffffff'
                } : {}}
              >
                <PlayCircle className={`w-6 h-6 ${strategy === 'demo' ? '' : ''}`} 
                  style={strategy === 'demo' ? { fill: '#ffffff', color: '#ffffff' } : {}}
                />
                <span className="text-[10px] font-bold uppercase tracking-wide" style={strategy === 'demo' ? { color: '#ffffff' } : {}}>Demo Virtual</span>
              </div>
              <div 
                onClick={() => setStrategy('custom')} 
                className={`flex-1 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${strategy === 'custom' ? '' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-400 dark:text-slate-500'}`}
                style={strategy === 'custom' ? {
                  borderColor: '#2b0071',
                  backgroundColor: 'rgba(43, 0, 113, 0.1)',
                  color: '#ffffff'
                } : {}}
              >
                <Hammer className="w-6 h-6" style={strategy === 'custom' ? { color: '#ffffff' } : {}} />
                <span className="text-[10px] font-bold uppercase tracking-wide" style={strategy === 'custom' ? { color: '#ffffff' } : {}}>MVP Custom</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Contacto</label>
              <input 
                type="text" 
                placeholder="@usuario, email o URL" 
                className="w-full px-4 py-3 bg-white dark:bg-[#353535] border border-slate-200 dark:border-[#3d3d3d] rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all" 
                value={contact} 
                onChange={(e) => setContact(e.target.value)} 
                onBlur={handleContactBlur} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Empresa / Nombre</label>
              <input 
                type="text" 
                placeholder="Nombre..." 
                className="w-full px-4 py-3 bg-white dark:bg-[#353535] border border-slate-200 dark:border-[#3d3d3d] rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all" 
                value={company} 
                onChange={(e) => setCompany(e.target.value)} 
              />
            </div>
          </div>
          <div className="mb-8">
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Notas</label>
            <textarea 
              rows={3} 
              placeholder="Detalles clave..." 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 focus:ring-2 focus-primary focus:border-transparent outline-none resize-none transition-all" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
            />
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
              disabled={isSaving} 
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
              Guardar Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

