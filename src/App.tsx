import { useState, useEffect } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { LeadSidebar } from '@/components/crm/LeadSidebar';
import { NewLeadModal } from '@/components/crm/NewLeadModal';
import { Login } from '@/components/auth/Login';
import { Lead } from '@/types';
import { AlertCircle, X } from 'lucide-react';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    generateTestData,
    loading,
    error,
    clearError,
  } = useLeads();

  const {
    draggedLeadId,
    dragOverColumnId,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop();

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

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
    <div className={`${darkMode ? 'dark' : ''} flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300`}>
      <Sidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
        <Header 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewLead={() => setIsModalOpen(true)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onGenerateTestData={handleGenerateTestData}
        />

        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 relative">
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
          <KanbanBoard
            leads={filteredLeads}
            loading={loading}
            draggedLeadId={draggedLeadId}
            dragOverColumnId={dragOverColumnId || ''}
            selectedLeadId={selectedLead?.id || null}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e, columnId) => handleDrop(e, columnId, updateLeadColumn)}
            onLeadClick={setSelectedLead}
            onToggleChannel={toggleContactChannel}
            onUpdateName={updateLeadName}
          />
        </div>
      </main>

      {selectedLead && (
        <LeadSidebar
          selectedLead={selectedLead}
          onClose={() => setSelectedLead(null)}
          newNote={newNote}
          onNoteChange={setNewNote}
          onAddNote={handleAddNote}
        />
      )}

      <NewLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddLead} 
        isSaving={isSaving} 
      />
    </div>
  );
}

export default App;

