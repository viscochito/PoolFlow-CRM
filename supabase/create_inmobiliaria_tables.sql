-- Tabla de leads para inmobiliaria
CREATE TABLE IF NOT EXISTS leads_inmobiliaria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  instagram TEXT,
  website TEXT,
  project_type TEXT,
  source TEXT NOT NULL DEFAULT 'Directo',
  location TEXT,
  column_id TEXT NOT NULL DEFAULT 'new',
  budget TEXT,
  quote_status TEXT NOT NULL DEFAULT 'none',
  urgency TEXT NOT NULL DEFAULT 'Media',
  last_contact TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contact_channels JSONB DEFAULT '[]'::jsonb,
  services JSONB DEFAULT '[]'::jsonb,
  context TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID
);

-- Tabla de historial para inmobiliaria
CREATE TABLE IF NOT EXISTS lead_history_inmobiliaria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads_inmobiliaria(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'system',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_leads_inmobiliaria_column_id ON leads_inmobiliaria(column_id);
CREATE INDEX IF NOT EXISTS idx_leads_inmobiliaria_created_at ON leads_inmobiliaria(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_history_inmobiliaria_lead_id ON lead_history_inmobiliaria(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_history_inmobiliaria_created_at ON lead_history_inmobiliaria(created_at);

-- Trigger para updated_at
CREATE TRIGGER update_leads_inmobiliaria_updated_at BEFORE UPDATE ON leads_inmobiliaria
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE leads_inmobiliaria;
ALTER PUBLICATION supabase_realtime ADD TABLE lead_history_inmobiliaria;

-- RLS Policies
ALTER TABLE leads_inmobiliaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_history_inmobiliaria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own leads_inmobiliaria" ON leads_inmobiliaria
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads_inmobiliaria" ON leads_inmobiliaria
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads_inmobiliaria" ON leads_inmobiliaria
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads_inmobiliaria" ON leads_inmobiliaria
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own lead_history_inmobiliaria" ON lead_history_inmobiliaria
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lead_history_inmobiliaria" ON lead_history_inmobiliaria
  FOR INSERT WITH CHECK (auth.uid() = user_id);

