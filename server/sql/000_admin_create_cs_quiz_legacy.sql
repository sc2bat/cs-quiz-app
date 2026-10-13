-- Run once as MySQL root / admin (quiz_dev cannot CREATE DATABASE).
-- After this, quiz_dev can move data and rebuild cs_quiz.

CREATE DATABASE IF NOT EXISTS cs_quiz_legacy
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

GRANT ALL PRIVILEGES ON cs_quiz_legacy.* TO 'quiz_dev'@'%';
FLUSH PRIVILEGES;
