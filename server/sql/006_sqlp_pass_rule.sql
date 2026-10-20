-- SQLP written-exam passRule + category shell (existing DBs).
-- Pass: each subject >= 40% AND overall (correct/total*100) >= 75.
-- Practical essay (실기 2문항) is not simulated.

UPDATE tracks
SET defaults = JSON_SET(
  COALESCE(defaults, JSON_OBJECT()),
  '$.questionLimit', COALESCE(JSON_EXTRACT(defaults, '$.questionLimit'), 10),
  '$.secondsPerQuestion', COALESCE(JSON_EXTRACT(defaults, '$.secondsPerQuestion'), 30),
  '$.passRule', JSON_OBJECT('minPerCategory', 40, 'minOverall', 75)
),
description = COALESCE(
  NULLIF(TRIM(description), ''),
  'SQLP certification preparation (written subjects; practical essay not simulated)'
)
WHERE slug = 'sqlp';

INSERT INTO categories (track_id, name, sort_order)
SELECT t.track_id, v.name, v.sort_order
FROM tracks t
CROSS JOIN (
  SELECT 'Data Modeling' AS name, 1 AS sort_order
  UNION ALL SELECT 'SQL Basics', 2
  UNION ALL SELECT 'SQL Advanced Tuning', 3
) v
WHERE t.slug = 'sqlp'
  AND NOT EXISTS (
    SELECT 1 FROM categories c
    WHERE c.track_id = t.track_id AND c.name = v.name
  );
