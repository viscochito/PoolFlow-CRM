import { Instagram, MessageCircle, Mail } from 'lucide-react';
import { ContactChannel } from '@/types';

interface ContactTogglesProps {
  activeChannels?: ContactChannel[];
  onToggle: (channelId: ContactChannel) => void;
}

export const ContactToggles = ({ activeChannels = [], onToggle }: ContactTogglesProps) => {
  const channels = [
    { 
      id: 'instagram' as ContactChannel, 
      icon: Instagram, 
      activeClass: 'text-pink-600 bg-pink-50 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800' 
    },
    { 
      id: 'whatsapp' as ContactChannel, 
      icon: MessageCircle, 
      activeClass: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' 
    },
    { 
      id: 'mail' as ContactChannel, 
      icon: Mail, 
      activeClass: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' 
    }
  ];

  return (
    <div className="flex gap-2 mt-2 pt-2 border-t border-slate-50 dark:border-slate-800">
      {channels.map((channel) => {
        const isActive = Array.isArray(activeChannels) && activeChannels.includes(channel.id);
        const Icon = channel.icon;
        return (
          <button
            key={channel.id}
            onClick={(e) => { 
              e.stopPropagation(); 
              onToggle(channel.id); 
            }}
            className={`
              flex-1 py-1.5 flex items-center justify-center rounded-md border transition-all duration-200
              ${isActive ? `${channel.activeClass} shadow-sm` : 'text-slate-300 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-600'}
            `}
            title={`Marcar contacto por ${channel.id}`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'fill-current opacity-20' : ''}`} strokeWidth={isActive ? 2 : 1.5} />
          </button>
        );
      })}
    </div>
  );
};

