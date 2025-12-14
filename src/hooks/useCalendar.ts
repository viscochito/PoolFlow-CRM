import { useMemo } from 'react';
import { Lead } from '@/types';
import { formatDateKey, startOfDay, endOfDay } from '@/utils/dateHelpers';

export interface CalendarDayData {
  date: Date;
  leads: Lead[];
  totalLeads: number;
  urgentLeads: number;
  actionLeads: Lead[]; // Leads que necesitan acción
}

export const useCalendar = (leads: Lead[]) => {
  const today = startOfDay(new Date());
  
  // Agrupar leads por fecha de último contacto
  const leadsByDate = useMemo(() => {
    const grouped = new Map<string, Lead[]>();
    
    leads.forEach(lead => {
      const contactDate = new Date(lead.lastContact);
      const dateKey = formatDateKey(contactDate);
      
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(lead);
    });
    
    return grouped;
  }, [leads]);

  // Identificar leads que necesitan acción
  const getLeadsNeedingAction = useMemo(() => {
    return leads.filter(lead => {
      const lastContact = new Date(lead.lastContact);
      const daysSinceContact = Math.floor((today.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
      
      // Estados activos que requieren seguimiento
      const activeStates = ['contacted', 'visit_pending', 'quote_sent', 'negotiation'];
      
      // 1. Leads que no se han contactado en más de 3 días Y están en estados activos
      const needsFollowUp = daysSinceContact >= 3 && activeStates.includes(lead.columnId);
      
      // 2. Leads con urgencia alta
      const isUrgent = lead.urgency === 'Alta';
      
      // 3. Leads nuevos sin canales de contacto
      const isNewWithoutContact = lead.columnId === 'new' && (!lead.contactChannels || lead.contactChannels.length === 0);
      
      // 4. Leads en negociación sin movimiento reciente (más de 5 días)
      const isStaleNegotiation = lead.columnId === 'negotiation' && daysSinceContact >= 5;
      
      return needsFollowUp || isUrgent || isNewWithoutContact || isStaleNegotiation;
    }).sort((a, b) => {
      // Ordenar por urgencia primero
      if (a.urgency === 'Alta' && b.urgency !== 'Alta') return -1;
      if (a.urgency !== 'Alta' && b.urgency === 'Alta') return 1;
      
      // Luego por días sin contacto (más días primero)
      const aDays = Math.floor((today.getTime() - new Date(a.lastContact).getTime()) / (1000 * 60 * 60 * 24));
      const bDays = Math.floor((today.getTime() - new Date(b.lastContact).getTime()) / (1000 * 60 * 60 * 24));
      return bDays - aDays;
    });
  }, [leads, today]);

  // Obtener leads para una fecha específica
  const getLeadsForDate = (date: Date): Lead[] => {
    const dateKey = formatDateKey(date);
    return leadsByDate.get(dateKey) || [];
  };

  // Obtener leads que necesitan acción para una fecha específica
  const getActionLeadsForDate = (date: Date): Lead[] => {
    const dateKey = formatDateKey(date);
    const dateLeads = leadsByDate.get(dateKey) || [];
    
    // Si es hoy, incluir todos los leads que necesitan acción
    if (dateKey === formatDateKey(today)) {
      return getLeadsNeedingAction;
    }
    
    // Para otros días, solo los leads que tienen actividad ese día Y necesitan acción
    return dateLeads.filter(lead => 
      getLeadsNeedingAction.some(actionLead => actionLead.id === lead.id)
    );
  };

  // Obtener datos del calendario para un mes
  const getCalendarData = (month: Date): CalendarDayData[] => {
    const days: CalendarDayData[] = [];
    const start = startOfDay(new Date(month.getFullYear(), month.getMonth(), 1));
    const end = endOfDay(new Date(month.getFullYear(), month.getMonth() + 1, 0));
    
    // Iterar por todos los días del mes
    const current = new Date(start);
    while (current <= end) {
      const dateKey = formatDateKey(current);
      const dayLeads = leadsByDate.get(dateKey) || [];
      const urgentLeads = dayLeads.filter(lead => lead.urgency === 'Alta').length;
      const actionLeads = getActionLeadsForDate(current);
      
      days.push({
        date: new Date(current),
        leads: dayLeads,
        totalLeads: dayLeads.length,
        urgentLeads,
        actionLeads,
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Obtener estadísticas del mes
  const getMonthStats = (month: Date) => {
    const calendarData = getCalendarData(month);
    const totalLeads = calendarData.reduce((sum, day) => sum + day.totalLeads, 0);
    const totalUrgent = calendarData.reduce((sum, day) => sum + day.urgentLeads, 0);
    const daysWithLeads = calendarData.filter(day => day.totalLeads > 0).length;
    
    return {
      totalLeads,
      totalUrgent,
      daysWithLeads,
      totalDays: calendarData.length,
    };
  };

  return {
    leadsByDate,
    getLeadsForDate,
    getActionLeadsForDate,
    getLeadsNeedingAction,
    getCalendarData,
    getMonthStats,
  };
};

