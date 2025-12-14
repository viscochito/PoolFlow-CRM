import { useMemo } from 'react';
import { Lead, TaskChannel } from '@/types';
import { formatDateKey } from '@/utils/dateHelpers';

export interface SuggestedTask {
  leadId: string;
  leadName: string;
  action: string;
  channel: TaskChannel;
  reason: string; // Por qué se sugiere esta tarea
  rule: string; // Qué regla la generó
  suggestedDate: string; // Fecha sugerida (YYYY-MM-DD)
}

interface FollowUpRule {
  id: string;
  name: string;
  check: (lead: Lead) => SuggestedTask | null;
}

export const useFollowUpSuggestions = (leads: Lead[]) => {
  const rules: FollowUpRule[] = [
    // Regla 1: Primer contacto
    {
      id: 'first_contact_followup',
      name: 'Seguimiento primer contacto',
      check: (lead) => {
        if (lead.columnId !== 'contacted') return null;
        
        const lastContactDate = new Date(lead.lastContact);
        const daysSinceContact = Math.floor(
          (Date.now() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceContact < 2) return null;
        
        // Verificar si la última interacción fue mensaje enviado sin respuesta
        const lastEvent = lead.history?.[lead.history.length - 1];
        const isMessageSent = lastEvent?.type === 'contact' || 
                              lastEvent?.text.toLowerCase().includes('mensaje') ||
                              lastEvent?.text.toLowerCase().includes('enviado') ||
                              lastEvent?.text.toLowerCase().includes('whatsapp') ||
                              lastEvent?.text.toLowerCase().includes('instagram');
        
        // Verificar que no haya respuesta posterior
        const hasResponse = lead.history?.some((event, idx) => 
          idx < lead.history.length - 1 && 
          (event.text.toLowerCase().includes('respondió') || 
           event.text.toLowerCase().includes('respuesta') ||
           event.text.toLowerCase().includes('contestó'))
        );
        
        if (!isMessageSent || hasResponse) return null;
        
        // Usar el primer canal de contacto
        const channel = lead.contactChannels?.[0] || 'whatsapp';
        
        return {
          leadId: lead.id,
          leadName: lead.name,
          action: `Seguimiento a ${lead.name} – Mensaje 2`,
          channel: channel as TaskChannel,
          reason: `Primer contacto hace ${daysSinceContact} días sin respuesta`,
          rule: 'Regla 1 – Primer contacto',
          suggestedDate: formatDateKey(new Date()),
        };
      },
    },
    
    // Regla 2: Video enviado
    {
      id: 'video_followup',
      name: 'Feedback de video',
      check: (lead) => {
        if (!['visit_pending', 'negotiation'].includes(lead.columnId)) return null;
        
        const lastContactDate = new Date(lead.lastContact);
        const daysSinceContact = Math.floor(
          (Date.now() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceContact < 1) return null;
        
        const lastEvent = lead.history?.[lead.history.length - 1];
        const isVideoSent = lastEvent?.text.toLowerCase().includes('video') ||
                           lastEvent?.text.toLowerCase().includes('loom') ||
                           lastEvent?.text.toLowerCase().includes('vídeo');
        
        if (!isVideoSent) return null;
        
        const channel = lead.contactChannels?.[0] || 'whatsapp';
        
        return {
          leadId: lead.id,
          leadName: lead.name,
          action: `Consultar feedback del video – ${lead.name}`,
          channel: channel as TaskChannel,
          reason: `Video enviado hace ${daysSinceContact} día(s) sin respuesta`,
          rule: 'Regla 2 – Video enviado',
          suggestedDate: formatDateKey(new Date()),
        };
      },
    },
    
    // Regla 3: Presupuesto enviado
    {
      id: 'quote_followup',
      name: 'Seguimiento presupuesto',
      check: (lead) => {
        if (lead.columnId !== 'quote_sent') return null;
        
        const lastContactDate = new Date(lead.lastContact);
        const daysSinceContact = Math.floor(
          (Date.now() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceContact < 2 || daysSinceContact > 3) return null;
        
        const lastEvent = lead.history?.[lead.history.length - 1];
        const isQuoteSent = lead.quoteStatus === 'sent' ||
                           lastEvent?.text.toLowerCase().includes('presupuesto') ||
                           lastEvent?.text.toLowerCase().includes('cotización') ||
                           lastEvent?.text.toLowerCase().includes('presupuesto enviado');
        
        if (!isQuoteSent) return null;
        
        const channel = lead.contactChannels?.[0] || 'whatsapp';
        
        return {
          leadId: lead.id,
          leadName: lead.name,
          action: `Seguimiento presupuesto – ${lead.name}`,
          channel: channel as TaskChannel,
          reason: `Presupuesto enviado hace ${daysSinceContact} días sin respuesta`,
          rule: 'Regla 3 – Presupuesto enviado',
          suggestedDate: formatDateKey(new Date()),
        };
      },
    },
    
    // Regla 4: Sin respuesta prolongada
    {
      id: 'last_attempt',
      name: 'Último intento de contacto',
      check: (lead) => {
        if (!['contacted', 'visit_pending'].includes(lead.columnId)) return null;
        
        const lastContactDate = new Date(lead.lastContact);
        const daysSinceContact = Math.floor(
          (Date.now() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceContact < 5) return null;
        
        const channel = lead.contactChannels?.[0] || 'whatsapp';
        
        return {
          leadId: lead.id,
          leadName: lead.name,
          action: `Último intento de contacto – ${lead.name}`,
          channel: channel as TaskChannel,
          reason: `Sin respuesta hace ${daysSinceContact} días`,
          rule: 'Regla 4 – Lead sin respuesta prolongada',
          suggestedDate: formatDateKey(new Date()),
        };
      },
    },
  ];

  const suggestions = useMemo(() => {
    const allSuggestions: SuggestedTask[] = [];
    
    leads.forEach(lead => {
      rules.forEach(rule => {
        const suggestion = rule.check(lead);
        if (suggestion) {
          allSuggestions.push(suggestion);
        }
      });
    });
    
    // Ordenar por urgencia (más días sin contacto primero)
    return allSuggestions.sort((a, b) => {
      const leadA = leads.find(l => l.id === a.leadId);
      const leadB = leads.find(l => l.id === b.leadId);
      if (!leadA || !leadB) return 0;
      
      const daysA = Math.floor(
        (Date.now() - new Date(leadA.lastContact).getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysB = Math.floor(
        (Date.now() - new Date(leadB.lastContact).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return daysB - daysA;
    });
  }, [leads]);

  return { suggestions };
};

