USE cs_quiz;

INSERT INTO tracks (slug, name, description, defaults) VALUES
(
  'cs-interview',
  'CS Interview',
  'Developer interview CS topics (OS, Network, DB, etc.)',
  JSON_OBJECT('questionLimit', 10, 'secondsPerQuestion', 30)
),
(
  'engineer-ipe',
  'Information Processing Engineer',
  'Korean information processing engineer certification study',
  JSON_OBJECT(
    'questionLimit', 10,
    'secondsPerQuestion', 30,
    'passRule', JSON_OBJECT('minPerCategory', 40, 'minAverage', 60)
  )
),
(
  'sqlp',
  'SQL Developer (SQLP)',
  'SQLP certification preparation (written subjects; practical essay not simulated)',
  JSON_OBJECT(
    'questionLimit', 10,
    'secondsPerQuestion', 30,
    'passRule', JSON_OBJECT('minPerCategory', 40, 'minOverall', 75)
  )
),
(
  'aws-saa',
  'AWS Solutions Architect Associate',
  'AWS SAA exam preparation',
  JSON_OBJECT('questionLimit', 10, 'secondsPerQuestion', 30)
);

INSERT INTO categories (track_id, name, sort_order)
SELECT track_id, 'Software Design', 1 FROM tracks WHERE slug = 'engineer-ipe'
UNION ALL
SELECT track_id, 'Software Development', 2 FROM tracks WHERE slug = 'engineer-ipe'
UNION ALL
SELECT track_id, 'Database', 3 FROM tracks WHERE slug = 'engineer-ipe'
UNION ALL
SELECT track_id, 'Information System Construction', 4 FROM tracks WHERE slug = 'engineer-ipe'
UNION ALL
SELECT track_id, 'Data Modeling', 1 FROM tracks WHERE slug = 'sqlp'
UNION ALL
SELECT track_id, 'SQL Basics', 2 FROM tracks WHERE slug = 'sqlp'
UNION ALL
SELECT track_id, 'SQL Advanced Tuning', 3 FROM tracks WHERE slug = 'sqlp';
