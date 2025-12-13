import { useState } from 'react';
import { Search, Plus, Moon, Sun, FlaskConical, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

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
        
        {/* Perfil de usuario */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-teal-500 dark:bg-teal-600 flex items-center justify-center text-white text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
            </div>
            <span className="hidden md:block text-sm text-slate-700 dark:text-slate-300 max-w-[150px] truncate">
              {user?.email || 'Usuario'}
            </span>
          </button>
          
          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 py-2">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {user?.email}
                  </p>
                  {user?.user_metadata?.full_name && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {user.user_metadata.full_name}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

