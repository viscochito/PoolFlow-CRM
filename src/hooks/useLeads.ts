import { useState, useMemo, useEffect, useCallback } from 'react';
import { Lead, LeadStatus, ContactChannel, Service } from '@/types';
import { COLUMNS } from '@/constants/columns';
import {
  fetchLeads,
  createLead,
  updateLead,
  deleteLead as deleteLeadService,
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
                  columnId: leadData.column_id, // Now accepts any string
                  budget: leadData.budget,
                  quoteStatus: leadData.quote_status as Lead['quoteStatus'],
                  urgency: leadData.urgency as Lead['urgency'],
                  lastContact: leadData.last_contact,
                  contactChannels: (leadData.contact_channels || []) as ContactChannel[],
                  services: (leadData.services || []) as Service[],
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

  const updateLeadColumn = useCallback(async (leadId: string, newColumnId: string) => {
    try {
      setError(null);
      
      // Buscar el lead actual
      const currentLead = leads.find(l => l.id === leadId);
      if (!currentLead) return;

      // Buscar en columnas predefinidas primero
      let targetColumn = COLUMNS.find(c => c.id === newColumnId);
      // Si no se encuentra, buscar en columnas personalizadas
      if (!targetColumn) {
        const savedCustomColumns = localStorage.getItem('custom_columns');
        if (savedCustomColumns) {
          try {
            const customColumns = JSON.parse(savedCustomColumns);
            targetColumn = customColumns.find((c: { id: string }) => c.id === newColumnId);
          } catch {
            // Ignore parse errors
          }
        }
      }
      const activityText = `Estado actualizado: ${targetColumn?.title || 'Nueva etapa'}`;
      
      // ACTUALIZACIÓN OPTIMISTA: Actualizar estado local inmediatamente
      // Preservar contactChannels y services del lead actual
      const optimisticLead: Lead = {
        ...currentLead,
        columnId: newColumnId,
        lastContact: new Date().toISOString(),
        context: activityText,
        contactChannels: currentLead.contactChannels || [], // Preservar canales de contacto
        services: currentLead.services || [], // Preservar servicios
        history: [
          ...currentLead.history,
          {
            type: 'system',
            text: activityText,
            date: new Date().toLocaleString(),
          }
        ],
      };

      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? optimisticLead : lead))
      );

      setSelectedLead((prev) => (prev?.id === leadId ? optimisticLead : prev));

      // Actualizar en la base de datos en segundo plano (sin esperar)
      // Preservar contactChannels y services en la actualización
      Promise.all([
        updateLead(leadId, {
          columnId: newColumnId,
          lastContact: new Date().toISOString(),
          context: activityText,
          contactChannels: currentLead.contactChannels || [], // Preservar canales de contacto
          services: currentLead.services || [], // Preservar servicios
        }),
        addHistoryEvent(leadId, {
          type: 'system',
          text: activityText,
          date: new Date().toLocaleString(),
        })
      ]).then(([updatedLead]) => {
        // Sincronizar con la respuesta del servidor cuando termine
        // Asegurar que se preserven contactChannels y services
        const history = updatedLead.history || optimisticLead.history;
        const syncedLead: Lead = { 
          ...updatedLead, 
          history,
          contactChannels: updatedLead.contactChannels || currentLead.contactChannels || [],
          services: updatedLead.services || currentLead.services || [],
        };
        
        setLeads((prev) =>
          prev.map((lead) => (lead.id === leadId ? syncedLead : lead))
        );

        setSelectedLead((prev) => (prev?.id === leadId ? syncedLead : prev));
      }).catch((err) => {
        console.error('Error updating lead column:', err);
        // Revertir cambios optimistas en caso de error
        setLeads((prev) =>
          prev.map((lead) => (lead.id === leadId ? currentLead : lead))
        );
        setSelectedLead((prev) => (prev?.id === leadId ? currentLead : prev));
        setError('Error al actualizar el estado del lead.');
      });
    } catch (err) {
      console.error('Error updating lead column:', err);
      setError('Error al actualizar el estado del lead.');
      throw err;
    }
  }, [leads]);

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

  const updateLeadServices = useCallback(async (leadId: string, services: Service[]) => {
    try {
      setError(null);
      // Buscar el lead actual para preservar los canales de contacto
      const currentLead = leads.find(l => l.id === leadId);
      const updatedLead = await updateLead(leadId, { 
        services,
        contactChannels: currentLead?.contactChannels || [], // Preservar canales de contacto
      });
      
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? updatedLead : lead))
      );

      setSelectedLead((prev) => (prev?.id === leadId ? updatedLead : prev));
    } catch (err) {
      console.error('Error updating lead services:', err);
      setError('Error al actualizar los servicios del lead.');
      throw err;
    }
  }, [leads]);

  const toggleContactChannel = useCallback(async (lead: Lead, channelId: ContactChannel) => {
    try {
      setError(null);
      const currentChannels = lead.contactChannels || [];
      const isActive = currentChannels.includes(channelId);
      
      // Calcular nuevos canales
      const newChannels = isActive 
        ? currentChannels.filter(c => c !== channelId)
        : [...currentChannels, channelId];
      
      let updates: Partial<Lead> = {};
      let historyEvent: { type: 'system' | 'note' | 'contact'; text: string; date: string } | null = null;
      let newColumnId = lead.columnId;

      if (!isActive) {
        // Se está agregando un canal
        updates = {
          contactChannels: newChannels,
          lastContact: new Date().toISOString(),
          services: lead.services || [], // Preservar servicios
        };
        
        // Si después de agregar hay al menos un canal y no está en "contacted", moverlo a "contacted"
        if (newChannels.length > 0 && lead.columnId !== 'contacted') {
          newColumnId = 'contacted';
          updates.columnId = 'contacted';
          const activityText = lead.columnId === 'new' 
            ? 'Contactado por primera vez' 
            : 'Estado actualizado: Contactado';
          updates.context = activityText;
          historyEvent = {
            type: 'system',
            text: activityText,
            date: new Date().toLocaleString(),
          };
        }
      } else {
        // Se está quitando un canal
        updates = { 
          contactChannels: newChannels,
          services: lead.services || [], // Preservar servicios
        };
      }

      // ACTUALIZACIÓN OPTIMISTA: Actualizar estado local inmediatamente
      const optimisticLead: Lead = {
        ...lead,
        contactChannels: newChannels,
        services: lead.services || [], // Preservar servicios
        columnId: newColumnId,
        lastContact: !isActive ? new Date().toISOString() : lead.lastContact,
        context: historyEvent ? historyEvent.text : lead.context,
        history: historyEvent 
          ? [...lead.history, historyEvent]
          : lead.history,
      };

      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? optimisticLead : l))
      );
      setSelectedLead((prev) => (prev?.id === lead.id ? optimisticLead : prev));

      // Actualizar en la base de datos en segundo plano
      Promise.all([
        updateLead(lead.id, updates),
        historyEvent ? addHistoryEvent(lead.id, historyEvent) : Promise.resolve(),
      ]).then(async ([updatedLead]) => {
        // Sincronizar con la respuesta del servidor cuando termine
        if (historyEvent) {
          const history = await getLeadHistory(lead.id);
          const syncedLead = { ...updatedLead, history };
          
          setLeads((prev) =>
            prev.map((l) => (l.id === lead.id ? syncedLead : l))
          );
          setSelectedLead((prev) => (prev?.id === lead.id ? syncedLead : prev));
        } else {
          // Asegurar que se preserven servicios y canales
          const syncedLead: Lead = {
            ...updatedLead,
            contactChannels: updatedLead.contactChannels || newChannels,
            services: updatedLead.services || lead.services || [],
          };
          
          setLeads((prev) =>
            prev.map((l) => (l.id === lead.id ? syncedLead : l))
          );
          setSelectedLead((prev) => (prev?.id === lead.id ? syncedLead : prev));
        }
      }).catch((err) => {
        console.error('Error updating contact channel:', err);
        // Revertir cambios optimistas en caso de error
        setLeads((prev) =>
          prev.map((l) => (l.id === lead.id ? lead : l))
        );
        setSelectedLead((prev) => (prev?.id === lead.id ? lead : prev));
        setError('Error al actualizar el canal de contacto.');
      });
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
          services: [],
        });
      }
    } catch (err) {
      console.error('Error generating test data:', err);
      setError('Error al generar datos de prueba.');
    }
  }, []);

  const moveLeadsFromColumn = useCallback(async (fromColumnId: string, toColumnId: string) => {
    try {
      setError(null);
      const leadsToMove = leads.filter(lead => lead.columnId === fromColumnId);
      
      // Mover todos los leads de la columna eliminada a "Nuevo Lead"
      for (const lead of leadsToMove) {
        await updateLeadColumn(lead.id, toColumnId);
      }
    } catch (err) {
      console.error('Error moving leads from column:', err);
      setError('Error al mover los leads de la columna.');
      throw err;
    }
  }, [leads, updateLeadColumn]);

  const deleteLead = useCallback(async (leadId: string) => {
    try {
      setError(null);
      await deleteLeadService(leadId);
      
      // Remover del estado local
      setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
      
      // Si el lead eliminado estaba seleccionado, deseleccionarlo
      setSelectedLead((prev) => (prev?.id === leadId ? null : prev));
    } catch (err) {
      console.error('Error deleting lead:', err);
      setError('Error al eliminar el lead.');
      throw err;
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
    updateLeadServices,
    generateTestData,
    moveLeadsFromColumn,
    deleteLead,
    loading,
    error,
    clearError,
  };
};
