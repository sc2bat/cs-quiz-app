-- Add IPE written-exam passRule to engineer-ipe track defaults (existing DBs).
-- Safe to re-run: overwrites passRule / ensures questionLimit & secondsPerQuestion keys.

UPDATE tracks
SET defaults = JSON_SET(
  COALESCE(defaults, JSON_OBJECT()),
  '$.questionLimit', COALESCE(JSON_EXTRACT(defaults, '$.questionLimit'), 10),
  '$.secondsPerQuestion', COALESCE(JSON_EXTRACT(defaults, '$.secondsPerQuestion'), 30),
  '$.passRule', JSON_OBJECT('minPerCategory', 40, 'minAverage', 60)
)
WHERE slug = 'engineer-ipe';
