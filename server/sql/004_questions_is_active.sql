-- Soft-delete flag for questions (keep quiz_submissions FK history)
-- Prefer is_active to match tracks.is_active (same meaning as use_yn='Y'/'N')

ALTER TABLE questions
  ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER subjective_answer,
  ADD KEY idx_questions_active (is_active);
