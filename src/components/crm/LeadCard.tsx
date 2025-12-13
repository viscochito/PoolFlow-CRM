import { useState, useEffect, useRef } from 'react';
import { MessageSquare, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { Lead, ContactChannel } from '@/types';
import { safeText, formatTimeAgo } from '@/utils/helpers';
import { Badge } from '@/components/ui/Badge';
import { ContactToggles } from './ContactToggles';

interface LeadCardProps {
  lead: Lead;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onDragEnd: () => void;
  onClick: (lead: Lead) => void;
  onToggleChannel: (lead: Lead, channelId: ContactChannel) => void;
  onUpdateName: (leadId: string, newName: string) => void;
  selected: boolean;
}

export const LeadCard = ({ 
  lead, 
  isDragging, 
  onDragStart, 
  onDragEnd, 
  onClick, 
  onToggleChannel, 
  onUpdateName, 
  selected 
}: LeadCardProps) => {
  const timeAgoData = formatTimeAgo(lead.lastContact);
  const [name, setName] = useState(lead.name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
    setName(lead.name || ''); 
  }, [lead.name]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

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

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(lead)}
      className={`
        group bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800
        cursor-grab active:cursor-grabbing relative select-none
        transform transition-all duration-200 ease-out
        ${selected ? 'ring-2 ring-teal-500 shadow-md dark:shadow-teal-900/30' : ''}
        hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-slate-900/50
        active:scale-105 active:rotate-2 active:shadow-xl active:z-50
        ${isDragging ? 'border-2 border-dashed border-slate-300 dark:border-slate-600 scale-95 shadow-none rotate-0 !bg-slate-50 dark:!bg-slate-800' : ''}
      `}
    >
      {lead.source !== 'Directo' && (
        <div className="flex justify-between items-start mb-2">
          <Badge type={lead.source} />
        </div>
      )}
      
      <div className="mb-2 relative min-h-[1.5rem]">
        {isEditingName ? (
          <input
            ref={nameInputRef}
            onClick={(e) => e.stopPropagation()}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleNameKeyDown}
            className="font-bold text-slate-900 dark:text-white text-base w-full bg-slate-50 dark:bg-slate-800 border-b-2 border-teal-500 focus:outline-none p-0 leading-tight"
          />
        ) : (
          <h4 
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingName(true);
            }}
            className="font-bold text-slate-900 dark:text-white text-base leading-tight cursor-text hover:text-teal-600 dark:hover:text-teal-400 transition-colors truncate"
            title="Doble click para editar nombre"
          >
            {safeText(name)}
          </h4>
        )}
      </div>

      <div className="mb-3 min-h-[1.75rem] flex items-start gap-2">
        <MessageSquare className="w-3 h-3 mt-1 text-slate-400 dark:text-slate-500 flex-shrink-0" />
        <div 
          className={`
            text-xs py-0.5 px-0 rounded-md border border-transparent transition-all leading-relaxed line-clamp-2
            ${!lead.context ? 'text-slate-400 italic' : 'text-slate-600 dark:text-slate-300'}
          `}
          title="Última actividad registrada"
        >
          {safeText(lead.context || "Sin actividad reciente...")}
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{safeText(lead.projectType)}</p>
        {lead.budget && (
          <div className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            <DollarSign className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            {safeText(lead.budget)}
          </div>
        )}
      </div>

      <div className="flex justify-end mb-1">
        <div className={`flex items-center gap-1 text-[10px] font-medium ${timeAgoData.alert ? 'text-red-500 animate-pulse' : 'text-slate-400 dark:text-slate-500'}`}>
          {timeAgoData.alert ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          <span>{safeText(timeAgoData.text)}</span>
        </div>
      </div>

      <ContactToggles 
        activeChannels={lead.contactChannels} 
        onToggle={(channelId) => onToggleChannel(lead, channelId)} 
      />
    </div>
  );
};

