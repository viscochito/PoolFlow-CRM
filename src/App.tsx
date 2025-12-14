import { useState, useEffect } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useColumnOrder } from '@/hooks/useColumnOrder';
import { useCustomColumns } from '@/hooks/useCustomColumns';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { LeadSidebar } from '@/components/crm/LeadSidebar';
import { NewLeadModal } from '@/components/crm/NewLeadModal';
import { NewColumnModal } from '@/components/crm/NewColumnModal';
import { EditColumnModal } from '@/components/crm/EditColumnModal';
import { Login } from '@/components/auth/Login';
import { Lead, Column, ContactChannel, Service } from '@/types';
import { AlertCircle, X } from 'lucide-react';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isEditColumnModalOpen, setIsEditColumnModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newNote, setNewNote] = useState('');

  const {
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
  } = useLeads();

  const {
    draggedLeadId,
    dragOverColumnId,
    draggedColumnId,
    dragOverColumnIndex,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleColumnDragStart,
    handleColumnDragOver,
    handleColumnDrop,
    handleColumnDragEnd,
  } = useDragAndDrop();

  const { customColumns, addColumn, removeColumn, updateColumn } = useCustomColumns();
  const { getOrderedColumns, reorderColumns } = useColumnOrder(customColumns);

  useEffect(() => {
    if (selectedLead) {
      const updatedLead = leads.find(l => l.id === selectedLead.id);
      if (updatedLead) setSelectedLead(updatedLead);
    }
  }, [leads, selectedLead, setSelectedLead]);

  const handleAddLead = async (formData: Partial<Lead>) => {
    setIsSaving(true);
    try {
      await addLead(formData);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding lead:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLeadToColumn = async (name: string, columnId: string, contactChannels: ContactChannel[], service?: Service) => {
    setIsSaving(true);
    try {
      await addLead({
        name: name,
        email: contactChannels.includes('mail') ? '' : '',
        phone: contactChannels.includes('whatsapp') ? '' : '',
        projectType: '',
        source: 'Directo',
        location: '',
        columnId: columnId,
        context: '',
        contactChannels: contactChannels,
        services: service ? [service] : [],
      });
    } catch (err) {
      console.error('Error adding lead to column:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedLead || !newNote.trim()) return;
    try {
      await addNoteToLead(selectedLead.id, newNote);
      setNewNote('');
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const handleGenerateTestData = async () => {
    setIsSaving(true);
    try {
      await generateTestData();
    } catch (err) {
      console.error('Error generating test data:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddColumn = (column: Column) => {
    addColumn(column);
    setIsColumnModalOpen(false);
  };

  const handleEditColumn = (column: Column) => {
    setEditingColumn(column);
    setIsEditColumnModalOpen(true);
  };

  const handleUpdateColumn = (column: Column) => {
    // Si es una columna predefinida que se está editando, convertirla en personalizada
    // pero mantener el mismo ID para que los leads sigan asociados
    if (!column.isCustom) {
      // Crear una nueva columna personalizada basada en la predefinida con el mismo ID
      const customColumn: Column = {
        ...column,
        isCustom: true,
      };
      addColumn(customColumn);
    } else {
      // Si ya es personalizada, solo actualizarla
      updateColumn(column.id, column);
    }
    setIsEditColumnModalOpen(false);
    setEditingColumn(null);
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      // Mover todos los leads de la columna eliminada a "Nuevo Lead"
      await moveLeadsFromColumn(columnId, 'new');
      // Eliminar la columna
      removeColumn(columnId);
    } catch (err) {
      console.error('Error deleting column:', err);
    }
  };

  const handleEditLead = (lead: Lead) => {
    // Abrir el panel lateral con el lead seleccionado
    setSelectedLead(lead);
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(leadId);
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#1d1d1d]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-950 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar login si no está autenticado
  if (!user) {
    return <Login />;
  }

  return (
    <div className={`${darkMode ? 'dark' : ''} flex h-screen bg-slate-50 dark:bg-[#1d1d1d] text-slate-800 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300`}>
      <Sidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-[#1d1d1d] transition-colors duration-300">
        <Header 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewLead={() => setIsModalOpen(true)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onGenerateTestData={handleGenerateTestData}
        />

        <div 
          className="flex-1 overflow-x-auto overflow-y-hidden p-6 relative"
          onClick={(e) => {
            // Si se hace clic en el área del tablero (no en tarjetas, columnas u otros elementos interactivos), cerrar el panel
            const target = e.target as HTMLElement;
            // Solo cerrar si el click es directamente en el contenedor o en el área vacía del board-container
            if (target === e.currentTarget || 
                (target.classList.contains('board-container') && 
                 !target.closest('[data-lead-id]') && 
                 !target.closest('.column-header') &&
                 !target.closest('button') &&
                 !target.closest('input') &&
                 !target.closest('textarea'))) {
              setSelectedLead(null);
            }
          }}
        >
          {error && (
            <div className="absolute top-4 right-4 z-50 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg flex items-start gap-3 max-w-md">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="board-container">
          <KanbanBoard
            leads={filteredLeads}
            loading={loading}
            draggedLeadId={draggedLeadId}
            dragOverColumnId={dragOverColumnId || ''}
            draggedColumnId={draggedColumnId}
            dragOverColumnIndex={dragOverColumnIndex}
            columns={getOrderedColumns()}
            selectedLeadId={selectedLead?.id || null}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e, columnId) => handleDrop(e, columnId, updateLeadColumn)}
            onLeadClick={(lead) => {
              // Si se pasa null, cerrar el panel; si no, seleccionar el lead
              if (lead === null) {
                setSelectedLead(null);
              } else {
                setSelectedLead(lead);
              }
            }}
            onToggleChannel={toggleContactChannel}
            onUpdateName={updateLeadName}
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onColumnDragStart={handleColumnDragStart}
            onColumnDragOver={handleColumnDragOver}
            onColumnDrop={(e, targetIndex) => {
              if (draggedColumnId) {
                handleColumnDrop(e, targetIndex, reorderColumns);
              }
            }}
            onColumnDragEnd={handleColumnDragEnd}
            onAddColumn={() => setIsColumnModalOpen(true)}
            onEditColumn={handleEditColumn}
            onDeleteColumn={handleDeleteColumn}
            onAddLeadToColumn={handleAddLeadToColumn}
          />
          </div>
        </div>
      </main>

      {selectedLead && (
        <LeadSidebar
          selectedLead={selectedLead}
          onClose={() => setSelectedLead(null)}
          newNote={newNote}
          onNoteChange={setNewNote}
          onAddNote={handleAddNote}
          onUpdateServices={updateLeadServices}
        />
      )}

      <NewLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddLead} 
        isSaving={isSaving} 
      />

      <NewColumnModal 
        isOpen={isColumnModalOpen} 
        onClose={() => setIsColumnModalOpen(false)} 
        onSave={handleAddColumn} 
        isSaving={false} 
      />

      <EditColumnModal 
        isOpen={isEditColumnModalOpen} 
        onClose={() => {
          setIsEditColumnModalOpen(false);
          setEditingColumn(null);
        }} 
        onSave={handleUpdateColumn} 
        column={editingColumn}
        isSaving={false} 
      />
    </div>
  );
}

export default App;

