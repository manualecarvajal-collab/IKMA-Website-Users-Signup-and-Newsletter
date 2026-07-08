CREATE TABLE videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  slug text NOT NULL UNIQUE,
  descripcion text,
  embed_url text NOT NULL,
  imagen_preview text,
  publicado boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published videos"
  ON videos FOR SELECT USING (publicado = true);

CREATE POLICY "Admins can insert videos"
  ON videos FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update videos"
  ON videos FOR UPDATE USING (true);

CREATE POLICY "Admins can delete videos"
  ON videos FOR DELETE USING (true);
