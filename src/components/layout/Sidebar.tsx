import { useState, useEffect } from 'react';
import { LayoutGrid, Clock, Send, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const Sidebar = ({ activeFilter, onFilterChange }: SidebarProps) => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Depuración temporal - ver qué datos tenemos del usuario
  useEffect(() => {
    if (user) {
      console.log('🔍 Usuario completo:', user);
      console.log('📋 user_metadata:', user.user_metadata);
      console.log('📋 app_metadata:', user.app_metadata);
    }
  }, [user]);
  
  const menuItems = [
    { id: 'all', label: 'Todos los leads', icon: LayoutGrid },
    { id: 'today', label: 'Activos hoy', icon: Clock },
    { id: 'sent', label: 'Presupuestos enviados', icon: Send },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
  ];

  // Obtener nombre del usuario
  const getUserName = () => {
    if (!user) return 'Usuario';
    
    // Intentar obtener el nombre completo de Google
    const fullName = user.user_metadata?.full_name || 
                     user.user_metadata?.name ||
                     user.user_metadata?.display_name;
    
    if (fullName) return fullName;
    
    // Si no hay nombre, usar el email sin el dominio
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'Usuario';
  };

  // Obtener foto de perfil de Google
  const getUserAvatar = () => {
    if (!user) return null;
    
    // Verificar todos los campos posibles donde puede estar la foto
    const avatarUrl = 
      user.user_metadata?.avatar_url || 
      user.user_metadata?.picture ||
      user.user_metadata?.avatar ||
      user.user_metadata?.photo_url ||
      user.user_metadata?.image ||
      user.app_metadata?.avatar_url ||
      user.app_metadata?.picture ||
      user.app_metadata?.provider_metadata?.avatar_url ||
      user.app_metadata?.provider_metadata?.picture ||
      null;
    
    if (avatarUrl) {
      console.log('✅ Avatar URL encontrada:', avatarUrl);
    } else {
      console.log('⚠️ No se encontró avatar URL en los metadatos');
    }
    
    return avatarUrl;
  };

  // Obtener iniciales para el avatar (fallback si no hay foto)
  const getInitials = () => {
    const name = getUserName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const avatarUrl = getUserAvatar();

  // Resetear error de imagen cuando cambia el usuario o la URL
  useEffect(() => {
    setImageError(false);
  }, [user, avatarUrl]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <aside className="w-64 bg-white dark:bg-[#252525] border-r border-slate-200 dark:border-[#3d3d3d] flex-shrink-0 hidden md:flex flex-col z-20 transition-colors duration-300">
      <div className="p-6 border-b border-slate-100 dark:border-[#3d3d3d]">
        <div className="flex items-center gap-3">
          <img 
            src="https://res.cloudinary.com/dq1uhbo74/image/upload/v1765676550/poolFlow_hses0n.png" 
            alt="Pool Flow" 
            className="h-10 w-auto"
          />
          <span className="text-white font-bold text-2xl">Pool Flow</span>
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
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors font-medium ${activeFilter === item.id ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  style={activeFilter === item.id ? {
                    backgroundColor: '#2b0071'
                  } : {}}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="p-4 border-t border-slate-100 dark:border-[#3d3d3d]">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#353535] transition-colors"
          >
            {avatarUrl && !imageError ? (
              <img 
                src={avatarUrl} 
                alt={getUserName()}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-slate-800 dark:border-slate-900"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onError={(e) => {
                  console.error('❌ Error cargando imagen de avatar:', avatarUrl);
                  console.error('Error details:', e);
                  setImageError(true);
                }}
                onLoad={() => {
                  console.log('✅ Imagen de avatar cargada exitosamente');
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: '#2b0071' }}>
                {getInitials()}
              </div>
            )}
            <div className="flex-1 overflow-hidden min-w-0 text-left">
              <p className="text-sm font-medium truncate text-slate-900 dark:text-slate-200">
                {getUserName()}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 truncate">Online</p>
            </div>
          </button>
          
          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-[#2d2d2d] rounded-lg shadow-lg border border-slate-200 dark:border-[#3d3d3d] z-50 py-2">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-[#3d3d3d] flex items-center gap-3">
                  {avatarUrl && !imageError ? (
                    <img 
                      src={avatarUrl} 
                      alt={getUserName()}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-slate-800 dark:border-slate-900"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: '#2b0071' }}>
                      {getInitials()}
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {getUserName()}
                    </p>
                    {user?.email && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#353535] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

