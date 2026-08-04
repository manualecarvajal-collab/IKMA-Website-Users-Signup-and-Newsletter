ALTER TABLE videos ADD COLUMN IF NOT EXISTS gratis boolean NOT NULL DEFAULT false;

UPDATE videos SET gratis = true
WHERE slug = 'session-1-ap-francisco-hernndez-gods-heart-for-the-medical-field'
  AND grupo_id = (SELECT id FROM grupos WHERE slug = 'conference-january-2026' LIMIT 1);
