CREATE TABLE grupos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE grupos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read grupos"
  ON grupos FOR SELECT USING (true);

CREATE POLICY "Admins can insert grupos"
  ON grupos FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update grupos"
  ON grupos FOR UPDATE USING (true);

CREATE POLICY "Admins can delete grupos"
  ON grupos FOR DELETE USING (true);

-- Migrate existing categorias to grupos
INSERT INTO grupos (id, nombre, slug, created_at)
SELECT
  id,
  nombre,
  LOWER(REGEXP_REPLACE(nombre, '[^a-zA-Z0-9]+', '-', 'g')),
  created_at
FROM categorias;

-- Create a default group for videos without a category
INSERT INTO grupos (nombre, slug)
SELECT 'General', 'general'
WHERE EXISTS (SELECT 1 FROM videos WHERE categoria_id IS NULL);

-- Add grupo_id column
ALTER TABLE videos ADD COLUMN grupo_id uuid REFERENCES grupos(id) ON DELETE CASCADE;

-- Migrate categoria_id -> grupo_id
UPDATE videos v SET grupo_id = v.categoria_id WHERE v.categoria_id IS NOT NULL;

-- Assign uncategorized videos to General group
UPDATE videos v SET grupo_id = (SELECT id FROM grupos WHERE slug = 'general')
WHERE v.grupo_id IS NULL;

-- Make grupo_id mandatory
ALTER TABLE videos ALTER COLUMN grupo_id SET NOT NULL;

-- Add description length check
ALTER TABLE videos ADD CONSTRAINT videos_descripcion_check CHECK (char_length(descripcion) <= 100);

-- Drop old column and table
ALTER TABLE videos DROP COLUMN categoria_id;
DROP TABLE categorias;
