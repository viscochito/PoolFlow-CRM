import { Search, Plus, Moon, Sun, FlaskConical } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewLead: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onGenerateTestData: () => void;
}

export const Header = ({ 
  searchQuery, 
  onSearchChange, 
  onNewLead, 
  darkMode, 
  onToggleDarkMode,
  onGenerateTestData 
}: HeaderProps) => {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between flex-shrink-0 transition-colors duration-300">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 hidden lg:block">Tablero Comercial</h1>
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block"></div>
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar cliente..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-teal-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none" 
            value={searchQuery} 
            onChange={(e) => onSearchChange(e.target.value)} 
          />
        </div>
      </div>
      <div className="flex items-center gap-3 pl-4">
        <button 
          onClick={onGenerateTestData} 
          className="p-2 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors" 
          title="Generar 5 Leads de Prueba"
        >
          <FlaskConical className="w-5 h-5" />
        </button>
        <button 
          onClick={onToggleDarkMode} 
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button 
          onClick={onNewLead} 
          className="hidden sm:flex items-center gap-2 bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> 
          Nuevo Lead
        </button>
      </div>
    </header>
  );
};

