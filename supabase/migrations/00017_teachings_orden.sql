ALTER TABLE grupos ADD COLUMN posicion integer DEFAULT 0;
ALTER TABLE videos ADD COLUMN posicion integer DEFAULT 0;

-- Set initial positions based on created_at order
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 AS pos
  FROM grupos
)
UPDATE grupos SET posicion = numbered.pos FROM numbered WHERE grupos.id = numbered.id;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 AS pos
  FROM videos
)
UPDATE videos SET posicion = numbered.pos FROM numbered WHERE videos.id = numbered.id;
