import { useState, useMemo, useEffect, useCallback } from 'react';
import { Lead, LeadStatus, ContactChannel } from '@/types';
import { COLUMNS } from '@/constants/columns';
import {
  fetchLeads,
  createLead,
  updateLead,
  addHistoryEvent,
  getLeadHistory,
} from '@/services/leadsService';
import { supabase } from '@/lib/supabase';

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar leads iniciales
  useEffect(() => {
    const loadLeads = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadedLeads = await fetchLeads();
        setLeads(loadedLeads);
      } catch (err) {
        console.error('Error loading leads:', err);
        setError('Error al cargar los leads. Verifica tu conexión a Supabase.');
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, []);

  // Suscripción Realtime para cambios en leads
  useEffect(() => {
    const leadsChannel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        async (payload) => {
          console.log('Lead change detected:', payload.eventType);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Recargar el lead específico con su historial
            try {
              const { data: leadData } = await supabase
                .from('leads')
                .select('*')
                .eq('id', payload.new.id)
                .single();

              if (leadData) {
                const history = await getLeadHistory(leadData.id);
                
                // Convertir a formato Lead
                const updatedLead: Lead = {
                  id: leadData.id,
                  name: leadData.name,
                  phone: leadData.phone || '',
                  email: leadData.email || '',
                  projectType: leadData.project_type || '',
                  source: leadData.source as Lead['source'],
                  location: leadData.location || '',
                  columnId: leadData.column_id as LeadStatus,
                  budget: leadData.budget,
                  quoteStatus: leadData.quote_status as Lead['quoteStatus'],
                  urgency: leadData.urgency as Lead['urgency'],
                  lastContact: leadData.last_contact,
                  contactChannels: (leadData.contact_channels || []) as ContactChannel[],
                  context: leadData.context || '',
                  createdAt: leadData.created_at,
                  history: history,
                };

                setLeads((prev) => {
                  const existingIndex = prev.findIndex((l) => l.id === updatedLead.id);
                  if (existingIndex >= 0) {
                    // Actualizar lead existente
                    const newLeads = [...prev];
                    newLeads[existingIndex] = updatedLead;
                    return newLeads;
                  } else {
                    // Agregar nuevo lead
                    return [updatedLead, ...prev];
                  }
                });

                // Actualizar selectedLead si es el que cambió
                setSelectedLead((prev) => {
                  if (prev && prev.id === updatedLead.id) {
                    return updatedLead;
                  }
                  return prev;
                });
              }
            } catch (err) {
              console.error('Error processing realtime update:', err);
            }
          } else if (payload.eventType === 'DELETE') {
            // Eliminar lead del estado
            setLeads((prev) => prev.filter((l) => l.id !== payload.old.id));
            if (selectedLead?.id === payload.old.id) {
              setSelectedLead(null);
            }
          }
        }
      )
      .subscribe();

    // Suscripción Realtime para cambios en historial
    const historyChannel = supabase
      .channel('history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lead_history',
        },
        async (payload) => {
          console.log('History change detected:', payload.eventType);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Recargar historial del lead afectado
            try {
              const history = await getLeadHistory(payload.new.lead_id);
              
              setLeads((prev) =>
                prev.map((lead) => {
                  if (lead.id === payload.new.lead_id) {
                    return { ...lead, history };
                  }
                  return lead;
                })
              );

              setSelectedLead((prev) => {
                if (prev && prev.id === payload.new.lead_id) {
                  return { ...prev, history };
                }
                return prev;
              });
            } catch (err) {
              console.error('Error processing history update:', err);
            }
          }
        }
      )
      .subscribe();

    return () => {
      leadsChannel.unsubscribe();
      historyChannel.unsubscribe();
    };
  }, [selectedLead]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = (lead.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                            (lead.projectType?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (activeFilter === 'sent') return lead.quoteStatus === 'sent';
      if (activeFilter === 'today') {
        const lastContact = lead.lastContact;
        return lastContact?.includes('min') || lastContact?.includes('h');
      }
      return true;
    });
  }, [leads, searchQuery, activeFilter]);

  const addLead = useCallback(async (formData: Partial<Lead>) => {
    try {
      setError(null);
      const newLead = await createLead(formData);
      setLeads((prev) => [newLead, ...prev]);
      return newLead;
    } catch (err) {
      console.error('Error adding lead:', err);
      setError('Error al crear el lead. Intenta nuevamente.');
      throw err;
    }
  }, []);

  const updateLeadColumn = useCallback(async (leadId: string, newColumnId: LeadStatus) => {
    try {
      setError(null);
      const targetColumn = COLUMNS.find(c => c.id === newColumnId);
      const activityText = `Estado actualizado: ${targetColumn?.title || 'Nueva etapa'}`;
      
      // Actualizar lead
      const updatedLead = await updateLead(leadId, {
        columnId: newColumnId,
        lastContact: new Date().toISOString(),
        context: activityText,
      });

      // Agregar evento al historial
      await addHistoryEvent(leadId, {
        type: 'system',
        text: activityText,
        date: new Date().toLocaleString(),
      });

      // Actualizar estado local (optimistic update)
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? updatedLead : lead))
      );

      setSelectedLead((prev) => (prev?.id === leadId ? updatedLead : prev));
    } catch (err) {
      console.error('Error updating lead column:', err);
      setError('Error al actualizar el estado del lead.');
      throw err;
    }
  }, []);

  const updateLeadName = useCallback(async (leadId: string, newName: string) => {
    try {
      setError(null);
      const updatedLead = await updateLead(leadId, { name: newName });
      
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? updatedLead : lead))
      );

      setSelectedLead((prev) => (prev?.id === leadId ? updatedLead : prev));
    } catch (err) {
      console.error('Error updating lead name:', err);
      setError('Error al actualizar el nombre del lead.');
      throw err;
    }
  }, []);

  const addNoteToLead = useCallback(async (leadId: string, note: string) => {
    try {
      setError(null);
      const newHistoryItem = {
        type: 'note' as const,
        text: note,
        date: new Date().toLocaleString(),
      };

      // Agregar nota al historial
      await addHistoryEvent(leadId, newHistoryItem);

      // Actualizar lead con nueva nota y contexto
      const updatedLead = await updateLead(leadId, {
        context: note,
        lastContact: new Date().toISOString(),
      });

      // Recargar historial completo
      const history = await getLeadHistory(leadId);
      const leadWithHistory = { ...updatedLead, history };

      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? leadWithHistory : lead))
      );

      setSelectedLead((prev) => (prev?.id === leadId ? leadWithHistory : prev));
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Error al agregar la nota.');
      throw err;
    }
  }, []);

  const toggleContactChannel = useCallback(async (lead: Lead, channelId: ContactChannel) => {
    try {
      setError(null);
      const currentChannels = lead.contactChannels || [];
      const isActive = currentChannels.includes(channelId);
      
      let updates: Partial<Lead> = {};
      let historyEvent: { type: 'system' | 'note' | 'contact'; text: string; date: string } | null = null;

      if (isActive) {
        updates = { contactChannels: currentChannels.filter(c => c !== channelId) };
      } else {
        updates = {
          contactChannels: [...currentChannels, channelId],
          lastContact: new Date().toISOString(),
        };
        
        if (lead.columnId === 'new') {
          updates.columnId = 'contacted';
          const activityText = 'Contactado por primera vez';
          updates.context = activityText;
          historyEvent = {
            type: 'system',
            text: activityText,
            date: new Date().toLocaleString(),
          };
        }
      }

      const updatedLead = await updateLead(lead.id, updates);

      if (historyEvent) {
        await addHistoryEvent(lead.id, historyEvent);
        const history = await getLeadHistory(lead.id);
        const leadWithHistory = { ...updatedLead, history };
        
        setLeads((prev) =>
          prev.map((l) => (l.id === lead.id ? leadWithHistory : l))
        );
        setSelectedLead((prev) => (prev?.id === lead.id ? leadWithHistory : prev));
      } else {
        setLeads((prev) =>
          prev.map((l) => (l.id === lead.id ? updatedLead : l))
        );
        setSelectedLead((prev) => (prev?.id === lead.id ? updatedLead : prev));
      }
    } catch (err) {
      console.error('Error toggling contact channel:', err);
      setError('Error al actualizar el canal de contacto.');
      throw err;
    }
  }, []);

  const generateTestData = useCallback(async () => {
    try {
      setError(null);
      const now = Date.now();
      const testLeadsData = [
        { name: "Test: Recién", offset: 0, col: 'new' as LeadStatus },
        { name: "Test: 45 Min", offset: 45 * 60 * 1000, col: 'new' as LeadStatus },
        { name: "Test: 3 Horas", offset: 3 * 60 * 60 * 1000, col: 'contacted' as LeadStatus },
        { name: "Test: 2 Días", offset: 2 * 24 * 60 * 60 * 1000, col: 'visit_pending' as LeadStatus },
        { name: "Test: 5 Días (Alerta)", offset: 5 * 24 * 60 * 60 * 1000, col: 'visit_pending' as LeadStatus },
      ];

      for (const testData of testLeadsData) {
        await createLead({
          name: testData.name,
          projectType: 'Dato de Prueba',
          source: 'Directo',
          columnId: testData.col,
          lastContact: new Date(now - testData.offset).toISOString(),
          contactChannels: [],
          budget: null,
          quoteStatus: 'none',
          urgency: 'Baja',
          context: '',
          phone: '',
          email: '',
          location: '',
        });
      }
    } catch (err) {
      console.error('Error generating test data:', err);
      setError('Error al generar datos de prueba.');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    leads,
    filteredLeads,
    selectedLead,
    setSelectedLead,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    addLead,
    updateLeadColumn,
    updateLeadName,
    addNoteToLead,
    toggleContactChannel,
    generateTestData,
    loading,
    error,
    clearError,
  };
};
