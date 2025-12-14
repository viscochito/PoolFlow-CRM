import { Search, Plus, Moon, Sun, FlaskConical, Upload } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewLead: () => void;
  onImportLeads?: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onGenerateTestData: () => void;
}

export const Header = ({ 
  searchQuery, 
  onSearchChange, 
  onNewLead,
  onImportLeads,
  darkMode, 
  onToggleDarkMode,
  onGenerateTestData 
}: HeaderProps) => {

  return (
    <header className="h-16 bg-white dark:bg-[#252525] border-b border-slate-200 dark:border-[#3d3d3d] px-6 flex items-center justify-between flex-shrink-0 transition-colors duration-300">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 hidden lg:block">Tablero Comercial</h1>
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block"></div>
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar cliente..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-[#2d2d2d] border-transparent focus:bg-white dark:focus:bg-[#353535] focus:ring-2 focus-primary rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none"
            value={searchQuery} 
            onChange={(e) => onSearchChange(e.target.value)} 
          />
        </div>
      </div>
      <div className="flex items-center gap-3 pl-4">
        <button 
          onClick={onGenerateTestData} 
          className="p-2 text-purple-500 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-full transition-colors" 
          title="Generar 5 Leads de Prueba"
        >
          <FlaskConical className="w-5 h-5" />
        </button>
        {onImportLeads && (
          <button 
            onClick={onImportLeads} 
            className="hidden sm:flex items-center gap-2 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-[#353535] hover:bg-slate-200 dark:hover:bg-[#404040] transition-colors"
            title="Importar leads desde Excel"
          >
            <Upload className="w-4 h-4" /> 
            <span className="hidden md:inline">Importar</span>
          </button>
        )}
        <button 
          onClick={onToggleDarkMode} 
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#353535] rounded-full transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button 
          onClick={onNewLead} 
          className="hidden sm:flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          style={{ 
            backgroundColor: '#2b0071',
            boxShadow: '0 1px 3px rgba(43, 0, 113, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#35008a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2b0071';
          }}
        >
          <Plus className="w-4 h-4" /> 
          Nuevo Lead
        </button>
      </div>
    </header>
  );
};

