import { supabase } from '@/lib/supabase';
import { Lead, HistoryEvent, LeadStatus, ContactChannel, Service } from '@/types';

// Tipos para la base de datos
interface LeadRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  website: string | null;
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
    instagram: row.instagram || undefined,
    website: row.website || undefined,
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
    // category ya no se usa con tablas separadas
  };
}

// Convertir Lead a fila de BD
function leadToRow(lead: Partial<Lead>): Partial<LeadRow> {
  const row: Partial<LeadRow> = {};
  
  // Solo incluir campos que están definidos en el objeto lead
  if (lead.name !== undefined) row.name = lead.name;
  if (lead.phone !== undefined) row.phone = lead.phone || null;
  if (lead.email !== undefined) row.email = lead.email || null;
  if (lead.instagram !== undefined) row.instagram = lead.instagram || null;
  if (lead.website !== undefined) row.website = lead.website || null;
  if (lead.projectType !== undefined) row.project_type = lead.projectType || null;
  if (lead.source !== undefined) row.source = lead.source;
  if (lead.location !== undefined) row.location = lead.location || null;
  if (lead.columnId !== undefined) row.column_id = lead.columnId;
  if (lead.budget !== undefined) row.budget = lead.budget || null;
  if (lead.quoteStatus !== undefined) row.quote_status = lead.quoteStatus;
  if (lead.urgency !== undefined) row.urgency = lead.urgency;
  if (lead.lastContact !== undefined) row.last_contact = lead.lastContact;
  if (lead.contactChannels !== undefined) row.contact_channels = lead.contactChannels || [];
  if (lead.services !== undefined) row.services = lead.services || [];
  if (lead.context !== undefined) row.context = lead.context || null;
  
  return row;
}

// Tipo para el nombre de la tabla
export type LeadTableName = 'leads_piscinas' | 'leads_inmobiliaria';

// Obtener el nombre de la tabla de historial según la tabla de leads
function getHistoryTableName(tableName: LeadTableName): string {
  return tableName === 'leads_piscinas' ? 'lead_history_piscinas' : 'lead_history_inmobiliaria';
}

// Obtener todos los leads con su historial
export async function fetchLeads(tableName: LeadTableName = 'leads_piscinas'): Promise<Lead[]> {
  try {
    const historyTableName = getHistoryTableName(tableName);
    
    // Obtener todos los leads (especificar columnas explícitamente para evitar problemas con schema cache)
    const { data: leadsData, error: leadsError } = await supabase
      .from(tableName)
      .select('id, name, phone, email, instagram, website, project_type, source, location, column_id, budget, quote_status, urgency, last_contact, contact_channels, services, context, created_at, updated_at, user_id')
      .order('created_at', { ascending: false });

    if (leadsError) throw leadsError;
    if (!leadsData) return [];

    // Obtener todo el historial
    const { data: historyData, error: historyError } = await supabase
      .from(historyTableName)
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
export async function createLead(leadData: Partial<Lead>, tableName: LeadTableName = 'leads_piscinas'): Promise<Lead> {
  try {
    const historyTableName = getHistoryTableName(tableName);
    
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
      .from(tableName)
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
      await addHistoryEvent(data.id, history[0], tableName);
      if (history.length > 1) {
        await addHistoryEvent(data.id, history[1], tableName);
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
  updates: Partial<Lead>,
  tableName: LeadTableName = 'leads_piscinas'
): Promise<Lead> {
  try {
    const historyTableName = getHistoryTableName(tableName);
    
    // Primero obtener el lead actual para preservar campos que no se están actualizando
    const { data: currentLeadData } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', leadId)
      .single();
    
    if (!currentLeadData) {
      throw new Error('Lead not found');
    }
    
    // Convertir el lead actual a objeto Lead para tener los valores por defecto
    const currentHistory: HistoryEvent[] = [];
    const currentLead = rowToLead(currentLeadData, currentHistory);
    
    // Combinar updates con el lead actual, preservando campos que no se están actualizando
    const mergedUpdates: Partial<Lead> = {
      ...currentLead,
      ...updates,
      // Preservar explícitamente contactChannels y services si no están en updates
      contactChannels: updates.contactChannels !== undefined ? updates.contactChannels : currentLead.contactChannels,
      services: updates.services !== undefined ? updates.services : currentLead.services,
    };
    
    const rowUpdates = leadToRow(mergedUpdates);

    const { data, error } = await supabase
      .from(tableName)
      .update(rowUpdates)
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from update');

    // Obtener historial actualizado
    const { data: historyData } = await supabase
      .from(historyTableName)
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
export async function deleteLead(leadId: string, tableName: LeadTableName = 'leads_piscinas'): Promise<void> {
  try {
    const { error } = await supabase.from(tableName).delete().eq('id', leadId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
}

// Agregar evento al historial
export async function addHistoryEvent(
  leadId: string,
  event: HistoryEvent,
  tableName: LeadTableName = 'leads_piscinas'
): Promise<void> {
  try {
    const historyTableName = getHistoryTableName(tableName);
    
    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from(historyTableName).insert([
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
export async function getLeadHistory(leadId: string, tableName: LeadTableName = 'leads_piscinas'): Promise<HistoryEvent[]> {
  try {
    const historyTableName = getHistoryTableName(tableName);
    
    const { data, error } = await supabase
      .from(historyTableName)
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

