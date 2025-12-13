# Configuración de Autenticación con Google en Supabase

Esta guía te ayudará a configurar el login con Google para PoolFlow CRM.

## Paso 1: Configurar Google OAuth

### 1.1 Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** > **Credentials**

### 1.2 Crear credenciales OAuth 2.0

1. Haz clic en **Create Credentials** > **OAuth client ID**
2. Si es la primera vez, configura la pantalla de consentimiento:
   - Tipo de usuario: **External**
   - Nombre de la app: `PoolFlow CRM`
   - Email de soporte: tu email
   - Guarda y continúa
3. En **Scopes**, agrega:
   - `userinfo.email`
   - `userinfo.profile`
4. En **Test users**, agrega los emails de los usuarios que podrán acceder
5. Guarda y continúa

### 1.3 Crear OAuth Client ID

1. Tipo de aplicación: **Web application**
2. Nombre: `PoolFlow CRM Web`
3. **Authorized JavaScript origins**:
   ```
   http://localhost:3001
   https://tu-dominio.com
   ```
   (Agrega todas las URLs donde se ejecutará la app)

4. **Authorized redirect URIs**:
   ```
   https://iuyltiqxahuwlxxtxshi.supabase.co/auth/v1/callback
   ```
   (Reemplaza con tu URL de Supabase)

5. Haz clic en **Create**
6. **IMPORTANTE**: Copia el **Client ID** y **Client Secret** (los necesitarás en el siguiente paso)

## Paso 2: Configurar Google en Supabase

### 2.1 Habilitar proveedor Google

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Authentication** > **Providers**
3. Busca **Google** y haz clic para habilitarlo

### 2.2 Agregar credenciales

1. Pega el **Client ID** de Google en el campo correspondiente
2. Pega el **Client Secret** de Google en el campo correspondiente
3. Haz clic en **Save**

### 2.3 Configurar URL de redirección

Supabase automáticamente usa: `https://tu-proyecto.supabase.co/auth/v1/callback`

Asegúrate de que esta URL esté en la lista de **Authorized redirect URIs** en Google Cloud Console.

## Paso 3: Verificar configuración

### 3.1 Probar login

1. Ejecuta tu aplicación: `npm run dev`
2. Deberías ver la pantalla de login
3. Haz clic en "Continuar con Google"
4. Deberías ser redirigido a Google para autenticarte
5. Después de autenticarte, serás redirigido de vuelta a la aplicación

### 3.2 Verificar usuarios

1. En Supabase Dashboard, ve a **Authentication** > **Users**
2. Deberías ver el usuario que acabas de crear
3. Verifica que el email y la información del perfil sean correctos

## Paso 4: Configurar dominio de producción (cuando despliegues)

Cuando despliegues tu aplicación a producción:

1. En Google Cloud Console, agrega tu dominio de producción a:
   - **Authorized JavaScript origins**
   - **Authorized redirect URIs** (si es necesario)

2. En Supabase, verifica que la URL de redirección incluya tu dominio de producción

## Solución de problemas

### Error: "redirect_uri_mismatch"

- Verifica que la URL de redirección en Google Cloud Console coincida exactamente con la de Supabase
- La URL debe ser: `https://tu-proyecto.supabase.co/auth/v1/callback`

### Error: "access_denied"

- Verifica que el email del usuario esté en la lista de "Test users" en Google Cloud Console
- O publica la aplicación para que cualquier usuario de Google pueda acceder

### No aparece el botón de Google

- Verifica que hayas habilitado el proveedor Google en Supabase
- Verifica que hayas guardado las credenciales correctamente
- Revisa la consola del navegador por errores

### Usuario no se crea en Supabase

- Verifica que las políticas RLS permitan la creación de usuarios
- Revisa los logs en Supabase Dashboard > Logs

## Notas importantes

- **Seguridad**: Nunca compartas tu Client Secret públicamente
- **Test users**: Durante desarrollo, solo los emails en "Test users" pueden acceder
- **Producción**: Publica tu app en Google Cloud Console para permitir acceso público
- **RLS**: Las políticas RLS ahora requieren autenticación, asegúrate de que todos los usuarios estén autenticados

## Próximos pasos

- Configurar roles de usuario (admin, empleado, etc.)
- Agregar más información del perfil de usuario
- Implementar permisos granulares por rol
- Agregar más proveedores OAuth (GitHub, Microsoft, etc.)

