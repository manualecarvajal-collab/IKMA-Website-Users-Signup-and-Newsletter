CREATE TABLE categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categorias"
  ON categorias FOR SELECT USING (true);

CREATE POLICY "Admins can insert categorias"
  ON categorias FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update categorias"
  ON categorias FOR UPDATE USING (true);

CREATE POLICY "Admins can delete categorias"
  ON categorias FOR DELETE USING (true);

ALTER TABLE videos ADD COLUMN categoria_id uuid REFERENCES categorias(id) ON DELETE SET NULL;
