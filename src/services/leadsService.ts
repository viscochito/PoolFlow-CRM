import { supabase } from '@/lib/supabase';
import { Lead, HistoryEvent, LeadStatus, ContactChannel, Service } from '@/types';

// Tipos para la base de datos
interface LeadRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  project_type: string | null;
  source: string;
  location: string | null;
  column_id: string;
  budget: string | null;
  quote_status: string;
  urgency: string;
  last_contact: string;
  contact_channels: string[];
  services: Service[] | null;
  context: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

interface HistoryRow {
  id: string;
  lead_id: string;
  type: string;
  text: string;
  created_at: string;
  user_id: string | null;
}

// Convertir fila de BD a Lead
function rowToLead(row: LeadRow, history: HistoryEvent[]): Lead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    projectType: row.project_type || '',
    source: row.source as Lead['source'],
    location: row.location || '',
    columnId: row.column_id, // Now accepts any string, not just LeadStatus
    budget: row.budget,
    quoteStatus: row.quote_status as Lead['quoteStatus'],
    urgency: row.urgency as Lead['urgency'],
    lastContact: row.last_contact,
    contactChannels: (row.contact_channels || []) as ContactChannel[],
    services: (row.services || []) as Service[],
    context: row.context || '',
    createdAt: row.created_at,
    history: history,
  };
}

// Convertir Lead a fila de BD
function leadToRow(lead: Partial<Lead>): Partial<LeadRow> {
  return {
    name: lead.name,
    phone: lead.phone || null,
    email: lead.email || null,
    project_type: lead.projectType || null,
    source: lead.source,
    location: lead.location || null,
    column_id: lead.columnId,
    budget: lead.budget || null,
    quote_status: lead.quoteStatus,
    urgency: lead.urgency,
    last_contact: lead.lastContact,
    contact_channels: lead.contactChannels || [],
    services: lead.services || [],
    context: lead.context || null,
  };
}

// Obtener todos los leads con su historial
export async function fetchLeads(): Promise<Lead[]> {
  try {
    // Obtener todos los leads
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (leadsError) throw leadsError;
    if (!leadsData) return [];

    // Obtener todo el historial
    const { data: historyData, error: historyError } = await supabase
      .from('lead_history')
      .select('*')
      .order('created_at', { ascending: true });

    if (historyError) throw historyError;

    // Agrupar historial por lead_id
    const historyByLeadId = new Map<string, HistoryEvent[]>();
    (historyData || []).forEach((h: HistoryRow) => {
      if (!historyByLeadId.has(h.lead_id)) {
        historyByLeadId.set(h.lead_id, []);
      }
      historyByLeadId.get(h.lead_id)!.push({
        type: h.type as HistoryEvent['type'],
        text: h.text,
        date: new Date(h.created_at).toLocaleString(),
      });
    });

    // Combinar leads con su historial
    return leadsData.map((lead: LeadRow) => {
      const history = historyByLeadId.get(lead.id) || [];
      return rowToLead(lead, history);
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
}

// Crear un nuevo lead
export async function createLead(leadData: Partial<Lead>): Promise<Lead> {
  try {
    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    
    const now = new Date().toISOString();
    const rowData: Partial<LeadRow> = {
      ...leadToRow(leadData),
      column_id: leadData.columnId || 'new',
      quote_status: leadData.quoteStatus || 'none',
      urgency: leadData.urgency || 'Media',
      source: leadData.source || 'Directo',
      last_contact: leadData.lastContact || now,
      contact_channels: leadData.contactChannels || [],
      services: leadData.services || [],
      user_id: user?.id || null,
    };

    const { data, error } = await supabase
      .from('leads')
      .insert([rowData])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    // Crear evento inicial en el historial si hay contexto
    const history: HistoryEvent[] = [
      {
        type: 'system',
        text: 'Lead creado manualmente',
        date: new Date().toLocaleString(),
      },
    ];

    if (leadData.context) {
      history.push({
        type: 'note',
        text: leadData.context,
        date: new Date().toLocaleString(),
      });
    }

    // Guardar eventos de historial
    if (history.length > 0) {
      await addHistoryEvent(data.id, history[0]);
      if (history.length > 1) {
        await addHistoryEvent(data.id, history[1]);
      }
    }

    return rowToLead(data, history);
  } catch (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
}

// Actualizar un lead
export async function updateLead(
  leadId: string,
  updates: Partial<Lead>
): Promise<Lead> {
  try {
    const rowUpdates = leadToRow(updates);

    const { data, error } = await supabase
      .from('leads')
      .update(rowUpdates)
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from update');

    // Obtener historial actualizado
    const { data: historyData } = await supabase
      .from('lead_history')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });

    const history: HistoryEvent[] = (historyData || []).map((h: HistoryRow) => ({
      type: h.type as HistoryEvent['type'],
      text: h.text,
      date: new Date(h.created_at).toLocaleString(),
    }));

    return rowToLead(data, history);
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
}

// Eliminar un lead
export async function deleteLead(leadId: string): Promise<void> {
  try {
    const { error } = await supabase.from('leads').delete().eq('id', leadId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
}

// Agregar evento al historial
export async function addHistoryEvent(
  leadId: string,
  event: HistoryEvent
): Promise<void> {
  try {
    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('lead_history').insert([
      {
        lead_id: leadId,
        type: event.type,
        text: event.text,
        user_id: user?.id || null,
      },
    ]);

    if (error) throw error;
  } catch (error) {
    console.error('Error adding history event:', error);
    throw error;
  }
}

// Obtener historial de un lead específico
export async function getLeadHistory(leadId: string): Promise<HistoryEvent[]> {
  try {
    const { data, error } = await supabase
      .from('lead_history')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((h: HistoryRow) => ({
      type: h.type as HistoryEvent['type'],
      text: h.text,
      date: new Date(h.created_at).toLocaleString(),
    }));
  } catch (error) {
    console.error('Error fetching lead history:', error);
    throw error;
  }
}

