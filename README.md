# PoolFlow CRM

Sistema de gestión de leads (CRM) profesional para el seguimiento de clientes potenciales en el negocio de piscinas. Desarrollado con React, TypeScript y Tailwind CSS.

## 🚀 Características

- **Tablero Kanban**: Visualización de leads en columnas por estado
- **Drag & Drop**: Arrastra y suelta leads entre columnas
- **Gestión de Contactos**: Marca canales de contacto (Instagram, WhatsApp, Email)
- **Historial de Actividad**: Seguimiento completo de interacciones
- **Búsqueda y Filtros**: Encuentra leads rápidamente
- **Modo Oscuro**: Interfaz adaptable con tema claro/oscuro
- **Responsive**: Diseño adaptable a diferentes tamaños de pantalla

## 📋 Requisitos

- Node.js 18+
- npm o yarn

## 🛠️ Instalación

1. Navegar al directorio del proyecto:
```bash
cd poolflow-crm
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3001`

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Genera el build de producción
- `npm run preview` - Previsualiza el build de producción
- `npm run lint` - Ejecuta el linter
- `npm run type-check` - Verifica los tipos TypeScript

## 🏗️ Estructura del Proyecto

```
poolflow-crm/
├── src/
│   ├── components/
│   │   ├── crm/              # Componentes específicos del CRM
│   │   │   ├── ContactToggles.tsx
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── LeadCard.tsx
│   │   │   ├── LeadSidebar.tsx
│   │   │   └── NewLeadModal.tsx
│   │   ├── layout/           # Componentes de layout
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/               # Componentes UI reutilizables
│   │       └── Badge.tsx
│   ├── constants/            # Constantes y configuraciones
│   │   └── columns.ts
│   ├── hooks/                # Custom hooks
│   │   ├── useDragAndDrop.ts
│   │   └── useLeads.ts
│   ├── types/                # Definiciones de tipos TypeScript
│   │   └── index.ts
│   ├── utils/                # Funciones de utilidad
│   │   └── helpers.ts
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎨 Tecnologías Utilizadas

- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **Lucide React** - Iconos

## 📝 Funcionalidades Principales

### Gestión de Leads
- Crear nuevos leads con información de contacto
- Editar nombres de leads (doble click)
- Mover leads entre columnas mediante drag & drop
- Agregar notas y seguimiento de actividad

### Estados del Lead
1. **Nuevo Lead** - Lead recién creado
2. **Contactado** - Primer contacto establecido
3. **Pendiente Relevo** - Esperando relevamiento
4. **Presupuesto Generado** - Presupuesto creado
5. **Presupuesto Enviado** - Presupuesto compartido
6. **En Negociación** - En proceso de negociación
7. **Ganado** - Lead convertido en cliente
8. **Perdido** - Lead perdido

### Canales de Contacto
- Instagram
- WhatsApp
- Email

## 🔧 Configuración

El proyecto está configurado para usar:
- **Puerto**: 3001 (configurable en `vite.config.ts`)
- **Alias de rutas**: `@/` apunta a `./src/`
- **Modo oscuro**: Activado por defecto

## 📄 Licencia

Este proyecto es privado y confidencial.

---

**Desarrollado con ❤️ para PoolFlow**

