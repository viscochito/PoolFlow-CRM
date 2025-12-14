import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Plus, Check, Instagram, MessageCircle, Mail } from 'lucide-react';
import { ContactChannel, Service } from '@/types';

const PREDEFINED_SERVICES = [
  { id: 'landing', name: 'Landing' },
  { id: 'anuncios', name: 'Anuncios' },
  { id: 'sistema_presupuestos', name: 'Sistema de presupuestos' },
];

interface AddLeadToColumnProps {
  columnId: string;
  onAddLead: (name: string, columnId: string, contactChannels: ContactChannel[], service?: Service) => void;
}

export const AddLeadToColumn = ({ columnId, onAddLead }: AddLeadToColumnProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<ContactChannel[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceOptions, setShowServiceOptions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!leadName.trim() && selectedChannels.length === 0) {
          setIsOpen(false);
          resetForm();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, leadName, selectedChannels]);

  const resetForm = () => {
    setLeadName('');
    setSelectedChannels([]);
    setSelectedService(null);
    setShowServiceOptions(false);
  };

  const toggleChannel = (channelId: ContactChannel) => {
    setSelectedChannels(prev => {
      if (prev.includes(channelId)) {
        return prev.filter(id => id !== channelId);
      } else {
        return [...prev, channelId];
      }
    });
  };

  const handleSubmit = () => {
    if (leadName.trim() && selectedChannels.length > 0) {
      onAddLead(leadName.trim(), columnId, selectedChannels, selectedService || undefined);
      resetForm();
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && leadName.trim() && selectedChannels.length > 0) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      resetForm();
    }
  };

  const channels = [
    { id: 'instagram' as ContactChannel, icon: Instagram, label: 'Instagram' },
    { id: 'whatsapp' as ContactChannel, icon: MessageCircle, label: 'WhatsApp' },
    { id: 'mail' as ContactChannel, icon: Mail, label: 'Email' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-2 p-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#353535] rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Agregar lead</span>
      </button>
    );
  }

  return (
    <div ref={containerRef} className="mt-2 p-3 bg-white dark:bg-[#2d2d2d] rounded-lg border-2 border-dashed border-slate-300 dark:border-[#3d3d3d]">
      {/* Nombre del lead */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-400 dark:border-slate-500 flex items-center justify-center flex-shrink-0">
          {leadName.trim() && <Check className="w-3 h-3 text-slate-400 dark:text-slate-500" />}
        </div>
        <input
          type="text"
          placeholder="Escribe el nombre del lead..."
          value={leadName}
          onChange={(e) => setLeadName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
        />
      </div>

      {/* Canal de contacto (obligatorio - múltiple) */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          selectedChannels.length > 0
            ? 'border-slate-400 dark:border-slate-500 bg-slate-100 dark:bg-slate-700' 
            : 'border-dashed border-slate-400 dark:border-slate-500'
        }`}>
          {selectedChannels.length > 0 && <Check className="w-3 h-3 text-slate-400 dark:text-slate-500" />}
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 mr-2">Canal:</span>
        <div className="flex gap-1 flex-1">
          {channels.map((channel) => {
            const Icon = channel.icon;
            const isSelected = selectedChannels.includes(channel.id);
            return (
              <button
                key={channel.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleChannel(channel.id);
                }}
                className={`p-1.5 rounded border transition-all ${
                  isSelected
                    ? channel.id === 'instagram'
                      ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400'
                      : channel.id === 'whatsapp'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-[#3d3d3d] text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
                title={channel.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Servicio (opcional) */}
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          selectedService 
            ? 'border-slate-400 dark:border-slate-500 bg-slate-100 dark:bg-slate-700' 
            : 'border-dashed border-slate-400 dark:border-slate-500'
        }`}>
          {selectedService && <Check className="w-3 h-3 text-slate-400 dark:text-slate-500" />}
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 mr-2">Servicio:</span>
        {!showServiceOptions ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowServiceOptions(true);
            }}
            className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 px-2 py-1 border border-dashed border-slate-300 dark:border-slate-600 rounded hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
          >
            {selectedService ? selectedService.name : 'Opcional'}
          </button>
        ) : (
          <div className="flex gap-1 flex-1 flex-wrap">
            {PREDEFINED_SERVICES.map((service) => {
              const isSelected = selectedService?.id === service.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSelected) {
                      setSelectedService(null);
                    } else {
                      setSelectedService({
                        id: service.id,
                        name: service.name,
                        status: 'propuesto',
                        price: null,
                        isCustom: false,
                      });
                    }
                  }}
                  className={`px-2 py-1 text-xs rounded border transition-all ${
                    isSelected
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300'
                      : 'border-slate-200 dark:border-[#3d3d3d] text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                >
                  {service.name}
                </button>
              );
            })}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowServiceOptions(false);
              }}
              className="text-xs text-slate-400 dark:text-slate-400 px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Botón de guardar */}
      {leadName.trim() && selectedChannels.length > 0 && (
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-3 w-full py-2 px-4 text-sm font-medium text-white rounded-lg transition-colors"
          style={{ backgroundColor: '#2b0071' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#35008a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2b0071';
          }}
        >
          Guardar
        </button>
      )}
    </div>
  );
};

