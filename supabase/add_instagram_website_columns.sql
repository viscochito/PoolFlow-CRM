-- Agregar columnas instagram y website a la tabla leads
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;

