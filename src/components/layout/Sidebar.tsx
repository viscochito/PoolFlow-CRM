import { LayoutGrid, Clock, Send, Droplets } from 'lucide-react';

interface SidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const Sidebar = ({ activeFilter, onFilterChange }: SidebarProps) => {
  const menuItems = [
    { id: 'all', label: 'Todos los leads', icon: LayoutGrid },
    { id: 'today', label: 'Activos hoy', icon: Clock },
    { id: 'sent', label: 'Presupuestos enviados', icon: Send },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 hidden md:flex flex-col z-20 transition-colors duration-300">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400 font-bold text-xl">
          <Droplets className="w-7 h-7 fill-current" />
          <span>PoolQuote</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-8">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2">Vistas</h3>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button 
                  onClick={() => onFilterChange(item.id)} 
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${activeFilter === item.id ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-xs">AD</div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate dark:text-slate-200">Andrés Diseñador</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 truncate">Online</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

