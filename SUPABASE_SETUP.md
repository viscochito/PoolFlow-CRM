# Configuración de Supabase para PoolFlow CRM

## Pasos para configurar Supabase

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta o inicia sesión
2. Crea un nuevo proyecto
3. Espera a que se complete la configuración (puede tardar unos minutos)

### 2. Obtener credenciales

1. En el dashboard de tu proyecto, ve a **Settings** > **API**
2. Copia los siguientes valores:
   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon/public key** (la clave que comienza con `eyJ...`)

### 3. Configurar variables de entorno

1. Crea un archivo `.env.local` en la raíz del proyecto (si no existe)
2. Agrega las siguientes variables:

```env
VITE_SUPABASE_URL=tu-project-url-aqui
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**Ejemplo:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI4MCwiZXhwIjoxOTU0NTQzMjgwfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

### 4. Crear las tablas en Supabase

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Abre el archivo `supabase/schema.sql` de este proyecto
3. Copia todo el contenido del archivo
4. Pégalo en el SQL Editor de Supabase
5. Haz clic en **Run** para ejecutar el script

Esto creará:
- La tabla `leads` con todos los campos necesarios
- La tabla `lead_history` para el historial de actividades
- Los índices para mejorar el rendimiento
- Las políticas RLS (Row Level Security) básicas
- La configuración de Realtime para sincronización en tiempo real

### 5. Habilitar Realtime (si no se habilitó automáticamente)

1. Ve a **Database** > **Replication** en el dashboard
2. Asegúrate de que las tablas `leads` y `lead_history` estén habilitadas para Realtime
3. Si no están habilitadas, haz clic en el toggle para activarlas

### 6. Reiniciar el servidor de desarrollo

1. Detén el servidor de desarrollo (Ctrl+C)
2. Reinicia con `npm run dev`
3. La aplicación debería conectarse a Supabase automáticamente

## Verificación

Una vez configurado, deberías poder:
- Ver los leads cargándose desde Supabase (inicialmente estará vacío)
- Crear nuevos leads que se guardan en la base de datos
- Ver cambios en tiempo real si abres la aplicación en múltiples ventanas
- El historial de actividades se guarda automáticamente

## Solución de problemas

### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env.local` existe y tiene las variables correctas
- Asegúrate de reiniciar el servidor después de crear/modificar `.env.local`

### Error: "Error al cargar los leads"
- Verifica que las credenciales de Supabase sean correctas
- Asegúrate de que las tablas se hayan creado correctamente ejecutando el script SQL
- Revisa la consola del navegador para más detalles del error

### Los cambios no se sincronizan en tiempo real
- Verifica que Realtime esté habilitado en las tablas `leads` y `lead_history`
- Asegúrate de que las políticas RLS permitan las operaciones necesarias

### Error de permisos (RLS)
- Si tienes problemas con permisos, verifica las políticas RLS en Supabase
- Las políticas actuales permiten todas las operaciones (puedes restringirlas después con autenticación)

## Próximos pasos

- Implementar autenticación de usuarios
- Agregar filtros por usuario
- Configurar permisos más granulares
- Implementar backup automático

