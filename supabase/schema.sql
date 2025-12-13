-- Tabla de leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  project_type TEXT,
  source TEXT NOT NULL DEFAULT 'Directo',
  location TEXT,
  column_id TEXT NOT NULL DEFAULT 'new',
  budget TEXT,
  quote_status TEXT NOT NULL DEFAULT 'none',
  urgency TEXT NOT NULL DEFAULT 'Media',
  last_contact TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contact_channels JSONB DEFAULT '[]'::jsonb,
  context TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID
);

-- Tabla de historial de leads
CREATE TABLE IF NOT EXISTS lead_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'system',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_leads_column_id ON leads(column_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_history_lead_id ON lead_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_history_created_at ON lead_history(created_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en leads
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Realtime en las tablas
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE lead_history;

-- Políticas RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_history ENABLE ROW LEVEL SECURITY;

-- Política para leads: usuarios autenticados pueden leer todos los leads
CREATE POLICY "Authenticated users can read all leads" ON leads
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para leads: usuarios autenticados pueden crear leads
CREATE POLICY "Authenticated users can create leads" ON leads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para leads: usuarios autenticados pueden actualizar leads
CREATE POLICY "Authenticated users can update leads" ON leads
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para leads: usuarios autenticados pueden eliminar leads
CREATE POLICY "Authenticated users can delete leads" ON leads
  FOR DELETE USING (auth.role() = 'authenticated');

-- Política para lead_history: usuarios autenticados pueden leer historial
CREATE POLICY "Authenticated users can read history" ON lead_history
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para lead_history: usuarios autenticados pueden crear eventos de historial
CREATE POLICY "Authenticated users can create history" ON lead_history
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

