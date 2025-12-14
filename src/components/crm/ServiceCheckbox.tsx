import { useState } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';
import { Service, ServiceStatus } from '@/types';

const PREDEFINED_SERVICES = [
  { id: 'landing', name: 'Landing', isCustom: false },
  { id: 'anuncios', name: 'Anuncios', isCustom: false },
  { id: 'sistema_presupuestos', name: 'Sistema de presupuestos', isCustom: false },
];

const STATUS_OPTIONS: ServiceStatus[] = ['propuesto', 'aceptado', 'rechazado', 'en_proceso'];

const STATUS_COLORS: Record<ServiceStatus, string> = {
  propuesto: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700/30 dark:text-slate-300 dark:border-slate-600',
  aceptado: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  rechazado: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  en_proceso: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
};

interface ServiceCheckboxProps {
  services: Service[];
  onServicesChange: (services: Service[]) => void;
  compact?: boolean;
}

export const ServiceCheckbox = ({ services, onServicesChange, compact = false }: ServiceCheckboxProps) => {
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customServiceName, setCustomServiceName] = useState('');
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());

  const toggleService = (serviceId: string) => {
    const existingService = services.find(s => s.id === serviceId);
    
    if (existingService) {
      // Si existe, lo removemos
      onServicesChange(services.filter(s => s.id !== serviceId));
      setExpandedServices(prev => {
        const next = new Set(prev);
        next.delete(serviceId);
        return next;
      });
    } else {
      // Si no existe, lo agregamos con estado por defecto
      const predefined = PREDEFINED_SERVICES.find(s => s.id === serviceId);
      const newService: Service = {
        id: serviceId,
        name: predefined?.name || customServiceName,
        status: 'propuesto',
        price: null,
        isCustom: predefined ? false : true,
      };
      onServicesChange([...services, newService]);
      if (!compact) {
        setExpandedServices(prev => new Set(prev).add(serviceId));
      }
    }
  };

  const updateService = (serviceId: string, updates: Partial<Service>) => {
    onServicesChange(
      services.map(s => 
        s.id === serviceId ? { ...s, ...updates } : s
      )
    );
  };

  const removeService = (serviceId: string) => {
    onServicesChange(services.filter(s => s.id !== serviceId));
    setExpandedServices(prev => {
      const next = new Set(prev);
      next.delete(serviceId);
      return next;
    });
  };

  const addCustomService = () => {
    if (customServiceName.trim()) {
      const newService: Service = {
        id: `custom_${Date.now()}`,
        name: customServiceName.trim(),
        status: 'propuesto',
        price: null,
        isCustom: true,
      };
      onServicesChange([...services, newService]);
      setCustomServiceName('');
      setShowAddCustom(false);
      if (!compact) {
        setExpandedServices(prev => new Set(prev).add(newService.id));
      }
    }
  };

  const toggleExpand = (serviceId: string) => {
    setExpandedServices(prev => {
      const next = new Set(prev);
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      return next;
    });
  };

  if (compact) {
    // Vista compacta para la tarjeta
    const selectedServices = services.filter(s => 
      PREDEFINED_SERVICES.some(p => p.id === s.id) || s.isCustom
    );
    
    return (
      <div className="mt-2 space-y-1">
        <div className="flex flex-wrap gap-1">
          {PREDEFINED_SERVICES.map(predefined => {
            const isSelected = services.some(s => s.id === predefined.id);
            return (
              <label
                key={predefined.id}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleService(predefined.id);
                }}
                className={`
                  inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer
                  border transition-colors
                  ${isSelected 
                    ? 'bg-primary-100 text-primary-700 border-primary-300 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800' 
                    : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-[#353535] dark:text-slate-400 dark:border-[#3d3d3d] hover:bg-slate-100 dark:hover:bg-slate-700'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                  className="w-2.5 h-2.5 rounded border-slate-300 dark:border-slate-600"
                />
                {predefined.name}
              </label>
            );
          })}
        </div>
        
        {selectedServices.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedServices.map(service => (
              <div
                key={service.id}
                onClick={(e) => e.stopPropagation()}
                className={`
                  inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border
                  ${STATUS_COLORS[service.status]}
                `}
              >
                {service.name}
                {service.price !== null && (
                  <span className="text-[9px] opacity-75">${service.price}</span>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowAddCustom(!showAddCustom);
          }}
          className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors mt-1"
        >
          <Plus className="w-3 h-3" />
          Agregar servicio
        </button>

        {showAddCustom && (
          <div onClick={(e) => e.stopPropagation()} className="mt-1 flex gap-1">
            <input
              type="text"
              value={customServiceName}
              onChange={(e) => setCustomServiceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addCustomService();
                } else if (e.key === 'Escape') {
                  setShowAddCustom(false);
                  setCustomServiceName('');
                }
              }}
              placeholder="Nombre del servicio..."
              className="flex-1 px-2 py-1 text-xs bg-white dark:bg-[#353535] border border-slate-200 dark:border-[#3d3d3d] rounded focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 focus:border-transparent outline-none"
              autoFocus
            />
            <button
              onClick={addCustomService}
              className="px-2 py-1 text-xs bg-primary-950 text-white rounded hover:bg-primary-900 transition-colors"
            >
              Agregar
            </button>
          </div>
        )}
      </div>
    );
  }

  // Vista completa para el sidebar
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Servicios</h3>
      </div>

      {/* Servicios predefinidos */}
      <div className="space-y-2">
        {PREDEFINED_SERVICES.map(predefined => {
          const service = services.find(s => s.id === predefined.id);
          const isSelected = !!service;
          const isExpanded = expandedServices.has(predefined.id);

          return (
            <div key={predefined.id} className="border border-slate-200 dark:border-[#3d3d3d] rounded-lg p-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleService(predefined.id)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary-950 focus:ring-primary-950"
                />
                <label 
                  className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                  onClick={() => toggleService(predefined.id)}
                >
                  {predefined.name}
                </label>
                {isSelected && (
                  <button
                    onClick={() => toggleExpand(predefined.id)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>

              {isSelected && isExpanded && service && (
                <div className="mt-2 pl-6 space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Estado
                    </label>
                    <select
                      value={service.status}
                      onChange={(e) => updateService(predefined.id, { status: e.target.value as ServiceStatus })}
                      className="w-full px-2 py-1 text-sm bg-white dark:bg-[#353535] text-slate-800 dark:text-white border border-slate-200 dark:border-[#3d3d3d] rounded focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 focus:border-transparent outline-none"
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status} className="bg-white dark:bg-[#353535] text-slate-800 dark:text-white">
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Precio
                    </label>
                    <input
                      type="number"
                      value={service.price ?? ''}
                      onChange={(e) => updateService(predefined.id, { 
                        price: e.target.value === '' ? null : parseFloat(e.target.value) 
                      })}
                      placeholder="Opcional"
                      className="w-full px-2 py-1 text-sm bg-white dark:bg-[#353535] text-slate-800 dark:text-white border border-slate-200 dark:border-[#3d3d3d] rounded focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Servicios personalizados */}
      {services.filter(s => s.isCustom).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Servicios Personalizados
          </h4>
          {services.filter(s => s.isCustom).map(service => {
            const isExpanded = expandedServices.has(service.id);
            return (
              <div key={service.id} className="border border-slate-200 dark:border-[#3d3d3d] rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => removeService(service.id)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary-950 focus:ring-primary-950"
                  />
                  <label className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {service.name}
                  </label>
                  <button
                    onClick={() => toggleExpand(service.id)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  <button
                    onClick={() => removeService(service.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-2 pl-6 space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Estado
                      </label>
                      <select
                        value={service.status}
                        onChange={(e) => updateService(service.id, { status: e.target.value as ServiceStatus })}
                        className="w-full px-2 py-1 text-sm bg-white dark:bg-[#353535] text-slate-800 dark:text-white border border-slate-200 dark:border-[#3d3d3d] rounded focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 focus:border-transparent outline-none"
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status} value={status} className="bg-white dark:bg-[#353535] text-slate-800 dark:text-white">
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Precio
                      </label>
                      <input
                        type="number"
                        value={service.price ?? ''}
                        onChange={(e) => updateService(service.id, { 
                          price: e.target.value === '' ? null : parseFloat(e.target.value) 
                        })}
                        placeholder="Opcional"
                        className="w-full px-2 py-1 text-sm bg-white dark:bg-[#353535] text-slate-800 dark:text-white border border-slate-200 dark:border-[#3d3d3d] rounded focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Botón para agregar servicio personalizado */}
      <button
        onClick={() => setShowAddCustom(!showAddCustom)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#3d3d3d] rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Agregar servicio personalizado
      </button>

      {showAddCustom && (
        <div className="flex gap-2">
          <input
            type="text"
            value={customServiceName}
            onChange={(e) => setCustomServiceName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addCustomService();
              } else if (e.key === 'Escape') {
                setShowAddCustom(false);
                setCustomServiceName('');
              }
            }}
            placeholder="Nombre del servicio..."
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-[#353535] text-slate-800 dark:text-white border border-slate-200 dark:border-[#3d3d3d] rounded-lg focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 focus:border-transparent outline-none"
            autoFocus
          />
          <button
            onClick={addCustomService}
            className="px-4 py-2 text-sm bg-primary-950 text-white rounded-lg hover:bg-primary-900 transition-colors"
          >
            Agregar
          </button>
          <button
            onClick={() => {
              setShowAddCustom(false);
              setCustomServiceName('');
            }}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

