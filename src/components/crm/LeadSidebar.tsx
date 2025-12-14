import { X, Save } from 'lucide-react';
import { Lead, Service } from '@/types';
import { safeText } from '@/utils/helpers';
import { ServiceCheckbox } from './ServiceCheckbox';

interface LeadSidebarProps {
  selectedLead: Lead;
  onClose: () => void;
  newNote: string;
  onNoteChange: (note: string) => void;
  onAddNote: () => void;
  onUpdateServices: (leadId: string, services: Service[]) => void;
}

export const LeadSidebar = ({ 
  selectedLead, 
  onClose, 
  newNote, 
  onNoteChange, 
  onAddNote,
  onUpdateServices
}: LeadSidebarProps) => {
  return (
    <div className="fixed inset-y-0 right-0 w-[450px] bg-white dark:bg-[#252525] shadow-2xl border-l border-slate-200 dark:border-[#3d3d3d] transform transition-transform duration-300 ease-out z-50 flex flex-col">
      <div className="h-16 border-b border-slate-100 dark:border-[#3d3d3d] flex items-center justify-between px-6 bg-slate-50/50 dark:bg-[#252525]">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{safeText(selectedLead.name)}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-500">ID: {safeText(selectedLead.id.slice(0, 8))}...</p>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <ServiceCheckbox
            services={selectedLead.services || []}
            onServicesChange={(services) => onUpdateServices(selectedLead.id, services)}
            compact={false}
          />
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">Actividad</h3>
          <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-6">
            {[...(selectedLead.history || [])].reverse().map((event, idx) => (
              <div key={idx} className="relative pl-6">
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-[#252525] ${event.type === 'system' ? 'bg-purple-500' : event.type === 'note' ? 'bg-orange-500' : 'bg-slate-400 dark:bg-slate-600'}`}></div>
                <p className="text-sm text-slate-800 dark:text-slate-300 mb-0.5">{safeText(event.text)}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{safeText(event.date)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-[#252525] border-t border-slate-200 dark:border-[#3d3d3d]">
        <div className="relative flex gap-2">
          <input 
            type="text" 
            value={newNote} 
            onChange={(e) => onNoteChange(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && onAddNote()} 
            placeholder="Escribe una nota interna..." 
            className="flex-1 pl-4 pr-4 py-3 bg-slate-50 dark:bg-[#2d2d2d] border-slate-200 dark:border-[#3d3d3d] rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus-primary focus:bg-white dark:focus:bg-[#353535] transition-all outline-none" 
          />
          <button 
            onClick={onAddNote} 
            disabled={!newNote.trim()} 
            className="p-3 bg-slate-900 dark:bg-[#3d3d3d] text-white rounded-lg hover:bg-slate-700 dark:hover:bg-[#4d4d4d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

