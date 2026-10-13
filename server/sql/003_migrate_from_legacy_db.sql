-- Copy question bank + users from cs_quiz_legacy into cs_quiz (cs-interview track).
-- Prerequisite: cs_quiz_legacy has the OLD schema tables; cs_quiz has 001+002 applied.

USE cs_quiz;

SET @cs_track_id := (SELECT track_id FROM tracks WHERE slug = 'cs-interview' LIMIT 1);

INSERT INTO categories (track_id, name, sort_order)
SELECT @cs_track_id, lc.name COLLATE utf8mb4_general_ci, lc.category_id
FROM cs_quiz_legacy.categories lc
WHERE NOT EXISTS (
  SELECT 1 FROM categories c
  WHERE c.track_id = @cs_track_id
    AND c.name = (lc.name COLLATE utf8mb4_general_ci)
);

INSERT INTO questions (
  category_id, question_type, question_text, explanation,
  subjective_answer, created_at
)
SELECT
  nc.category_id,
  lq.question_type,
  lq.question_text,
  lq.explanation,
  lq.subjective_answer,
  lq.created_at
FROM cs_quiz_legacy.questions lq
INNER JOIN cs_quiz_legacy.categories lc ON lc.category_id = lq.category_id
INNER JOIN categories nc
  ON nc.track_id = @cs_track_id
 AND nc.name = (lc.name COLLATE utf8mb4_general_ci);

INSERT INTO choices (question_id, choice_text, is_correct, sort_order)
SELECT
  nq.question_id,
  lch.choice_text,
  lch.is_correct,
  lch.choice_id
FROM cs_quiz_legacy.choices lch
INNER JOIN cs_quiz_legacy.questions lq ON lq.question_id = lch.question_id
INNER JOIN cs_quiz_legacy.categories lc ON lc.category_id = lq.category_id
INNER JOIN categories nc
  ON nc.track_id = @cs_track_id
 AND nc.name = (lc.name COLLATE utf8mb4_general_ci)
INNER JOIN questions nq
  ON nq.category_id = nc.category_id
 AND nq.question_text = (lq.question_text COLLATE utf8mb4_general_ci);

INSERT INTO users (
  email, nickname, profile_image_url, provider, sns_id,
  user_role, refresh_token, last_login_at, created_at
)
SELECT
  lu.email, lu.nickname, lu.profile_image_url, lu.provider, lu.sns_id,
  lu.user_role, lu.refresh_token, lu.last_login_at, lu.created_at
FROM cs_quiz_legacy.users lu
WHERE NOT EXISTS (
  SELECT 1 FROM users u
  WHERE u.provider = (lu.provider COLLATE utf8mb4_general_ci)
    AND u.sns_id = (lu.sns_id COLLATE utf8mb4_general_ci)
);
