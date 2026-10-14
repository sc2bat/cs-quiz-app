-- Fresh multi-track schema for database cs_quiz
-- Prerequisite: empty cs_quiz (or only leftover tables will be dropped below)

USE cs_quiz;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS quiz_submissions;
DROP TABLE IF EXISTS quiz_record_categories;
DROP TABLE IF EXISTS wrong_answers;
DROP TABLE IF EXISTS quiz_records;
DROP TABLE IF EXISTS choices;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS tracks;
DROP TABLE IF EXISTS users;
-- leftovers from earlier half-migration (safe if absent)
DROP TABLE IF EXISTS legacy_quiz_submissions;
DROP TABLE IF EXISTS legacy_quiz_record_categories;
DROP TABLE IF EXISTS legacy_quiz_records;
DROP TABLE IF EXISTS legacy_choices;
DROP TABLE IF EXISTS legacy_questions;
DROP TABLE IF EXISTS legacy_categories;
DROP TABLE IF EXISTS legacy_users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE tracks (
  track_id INT NOT NULL AUTO_INCREMENT,
  slug VARCHAR(64) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500) DEFAULT NULL,
  defaults JSON DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (track_id),
  UNIQUE KEY uk_tracks_slug (slug),
  KEY idx_tracks_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE categories (
  category_id INT NOT NULL AUTO_INCREMENT,
  track_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (category_id),
  UNIQUE KEY uk_categories_track_name (track_id, name),
  KEY idx_categories_track_id (track_id),
  CONSTRAINT fk_cat_track
    FOREIGN KEY (track_id) REFERENCES tracks (track_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE questions (
  question_id INT NOT NULL AUTO_INCREMENT,
  category_id INT NOT NULL,
  question_type ENUM('MULTIPLE','SUBJECTIVE') NOT NULL,
  question_text TEXT NOT NULL,
  explanation TEXT DEFAULT NULL,
  subjective_answer VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (question_id),
  KEY idx_questions_category_id (category_id),
  KEY idx_questions_type (question_type),
  KEY idx_questions_active (is_active),
  CONSTRAINT fk_q_category
    FOREIGN KEY (category_id) REFERENCES categories (category_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE choices (
  choice_id INT NOT NULL AUTO_INCREMENT,
  question_id INT NOT NULL,
  choice_text VARCHAR(255) NOT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (choice_id),
  KEY idx_choices_question_id (question_id),
  CONSTRAINT fk_ch_question
    FOREIGN KEY (question_id) REFERENCES questions (question_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE users (
  user_id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) DEFAULT NULL,
  nickname VARCHAR(100) NOT NULL,
  profile_image_url VARCHAR(500) DEFAULT NULL,
  provider VARCHAR(20) NOT NULL,
  sns_id VARCHAR(255) NOT NULL,
  user_role VARCHAR(20) NOT NULL DEFAULT 'USER',
  refresh_token VARCHAR(500) DEFAULT NULL,
  last_login_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uk_users_provider_sns (provider, sns_id),
  KEY idx_users_role (user_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE quiz_records (
  quiz_record_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  track_id INT NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  taken_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (quiz_record_id),
  KEY idx_quiz_records_user_taken (user_id, taken_at DESC, quiz_record_id DESC),
  KEY idx_quiz_records_track (track_id),
  CONSTRAINT fk_qr_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_qr_track
    FOREIGN KEY (track_id) REFERENCES tracks (track_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE quiz_record_categories (
  quiz_record_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (quiz_record_id, category_id),
  KEY idx_qrc_category (category_id),
  CONSTRAINT fk_qrc_rec
    FOREIGN KEY (quiz_record_id) REFERENCES quiz_records (quiz_record_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_qrc_cat
    FOREIGN KEY (category_id) REFERENCES categories (category_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE quiz_submissions (
  quiz_submission_id INT NOT NULL AUTO_INCREMENT,
  quiz_record_id INT NOT NULL,
  question_id INT NOT NULL,
  choice_id INT DEFAULT NULL,
  subjective_answer TEXT DEFAULT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (quiz_submission_id),
  KEY idx_submissions_record (quiz_record_id),
  KEY idx_submissions_question (question_id),
  KEY idx_submissions_choice (choice_id),
  CONSTRAINT fk_qs_record
    FOREIGN KEY (quiz_record_id) REFERENCES quiz_records (quiz_record_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_qs_question
    FOREIGN KEY (question_id) REFERENCES questions (question_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_qs_choice
    FOREIGN KEY (choice_id) REFERENCES choices (choice_id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE wrong_answers (
  user_id INT NOT NULL,
  track_id INT NOT NULL,
  question_id INT NOT NULL,
  wrong_count INT NOT NULL DEFAULT 1,
  last_wrong_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, track_id, question_id),
  KEY idx_wrong_answers_track (track_id),
  KEY idx_wrong_answers_question (question_id),
  CONSTRAINT fk_wa_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_wa_track
    FOREIGN KEY (track_id) REFERENCES tracks (track_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_wa_question
    FOREIGN KEY (question_id) REFERENCES questions (question_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
