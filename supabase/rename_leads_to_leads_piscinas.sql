-- Script para renombrar leads a leads_piscinas
-- Este script es idempotente: puede ejecutarse múltiples veces sin causar errores

-- Paso 1: Renombrar tabla de leads a leads_piscinas (solo si aún no fue renombrada)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads') THEN
    ALTER TABLE leads RENAME TO leads_piscinas;
    RAISE NOTICE 'Tabla "leads" renombrada a "leads_piscinas"';
  ELSE
    RAISE NOTICE 'La tabla "leads" ya fue renombrada o no existe';
  END IF;
END $$;

-- Paso 2: Renombrar tabla de historial a lead_history_piscinas (solo si aún no fue renombrada)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lead_history') THEN
    ALTER TABLE lead_history RENAME TO lead_history_piscinas;
    RAISE NOTICE 'Tabla "lead_history" renombrada a "lead_history_piscinas"';
  ELSE
    RAISE NOTICE 'La tabla "lead_history" ya fue renombrada o no existe';
  END IF;
END $$;

-- Paso 3: Renombrar índices (solo si existen)
ALTER INDEX IF EXISTS idx_leads_column_id RENAME TO idx_leads_piscinas_column_id;
ALTER INDEX IF EXISTS idx_leads_created_at RENAME TO idx_leads_piscinas_created_at;
ALTER INDEX IF EXISTS idx_lead_history_lead_id RENAME TO idx_lead_history_piscinas_lead_id;
ALTER INDEX IF EXISTS idx_lead_history_created_at RENAME TO idx_lead_history_piscinas_created_at;

-- Paso 4: Renombrar trigger (solo si existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_leads_updated_at' 
    AND tgrelid = 'leads_piscinas'::regclass
  ) THEN
    ALTER TRIGGER update_leads_updated_at ON leads_piscinas RENAME TO update_leads_piscinas_updated_at;
    RAISE NOTICE 'Trigger renombrado';
  END IF;
END $$;

-- Paso 5: Actualizar políticas RLS (eliminar las antiguas si existen y crear las nuevas)
DROP POLICY IF EXISTS "Users can view their own leads" ON leads_piscinas;
DROP POLICY IF EXISTS "Users can insert their own leads" ON leads_piscinas;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads_piscinas;
DROP POLICY IF EXISTS "Users can delete their own leads" ON leads_piscinas;
DROP POLICY IF EXISTS "Users can view their own lead_history" ON lead_history_piscinas;
DROP POLICY IF EXISTS "Users can insert their own lead_history" ON lead_history_piscinas;

-- Crear las nuevas políticas RLS (solo si las tablas existen)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads_piscinas') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'leads_piscinas' 
      AND policyname = 'Users can view their own leads_piscinas'
    ) THEN
      CREATE POLICY "Users can view their own leads_piscinas" ON leads_piscinas
        FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'leads_piscinas' 
      AND policyname = 'Users can insert their own leads_piscinas'
    ) THEN
      CREATE POLICY "Users can insert their own leads_piscinas" ON leads_piscinas
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'leads_piscinas' 
      AND policyname = 'Users can update their own leads_piscinas'
    ) THEN
      CREATE POLICY "Users can update their own leads_piscinas" ON leads_piscinas
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'leads_piscinas' 
      AND policyname = 'Users can delete their own leads_piscinas'
    ) THEN
      CREATE POLICY "Users can delete their own leads_piscinas" ON leads_piscinas
        FOR DELETE USING (auth.uid() = user_id);
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lead_history_piscinas') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'lead_history_piscinas' 
      AND policyname = 'Users can view their own lead_history_piscinas'
    ) THEN
      CREATE POLICY "Users can view their own lead_history_piscinas" ON lead_history_piscinas
        FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'lead_history_piscinas' 
      AND policyname = 'Users can insert their own lead_history_piscinas'
    ) THEN
      CREATE POLICY "Users can insert their own lead_history_piscinas" ON lead_history_piscinas
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
  END IF;
END $$;

-- Paso 6: Actualizar publicación de Realtime
DO $$
BEGIN
  -- Remover las tablas antiguas de la publicación (si existen)
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE leads;
    RAISE NOTICE 'Tabla "leads" removida de la publicación Realtime';
  EXCEPTION WHEN OTHERS THEN
    -- La tabla no estaba en la publicación o ya fue renombrada, continuar
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE lead_history;
    RAISE NOTICE 'Tabla "lead_history" removida de la publicación Realtime';
  EXCEPTION WHEN OTHERS THEN
    -- La tabla no estaba en la publicación o ya fue renombrada, continuar
    NULL;
  END;
  
  -- Remover las nuevas tablas si ya estaban agregadas (por si se ejecutó el script parcialmente)
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE leads_piscinas;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE lead_history_piscinas;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  -- Agregar las nuevas tablas a la publicación (solo si las tablas existen)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads_piscinas') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE leads_piscinas;
      RAISE NOTICE 'Tabla "leads_piscinas" agregada a la publicación Realtime';
    EXCEPTION WHEN OTHERS THEN
      -- La tabla ya estaba en la publicación, continuar
      NULL;
    END;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lead_history_piscinas') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE lead_history_piscinas;
      RAISE NOTICE 'Tabla "lead_history_piscinas" agregada a la publicación Realtime';
    EXCEPTION WHEN OTHERS THEN
      -- La tabla ya estaba en la publicación, continuar
      NULL;
    END;
  END IF;
END $$;

-- Paso 7: Actualizar la referencia de la tabla 'tasks' a 'leads_piscinas' (si existe la tabla tasks)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
    -- Verificar si la constraint existe y actualizarla
    IF EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'tasks_lead_id_fkey' 
      AND conrelid = 'tasks'::regclass
    ) THEN
      ALTER TABLE tasks DROP CONSTRAINT tasks_lead_id_fkey;
    END IF;
    
    -- Crear la nueva constraint
    ALTER TABLE tasks ADD CONSTRAINT tasks_lead_id_fkey 
      FOREIGN KEY (lead_id) REFERENCES leads_piscinas(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Referencia de la tabla "tasks" actualizada a "leads_piscinas"';
  END IF;
END $$;
