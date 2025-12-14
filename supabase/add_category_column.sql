-- Agregar columna category a la tabla leads
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'poolflow';

-- Crear índice para mejorar el rendimiento de las consultas por categoría
CREATE INDEX IF NOT EXISTS idx_leads_category ON leads(category);

-- Actualizar leads existentes para que tengan category 'poolflow' por defecto
UPDATE leads 
SET category = 'poolflow' 
WHERE category IS NULL;

