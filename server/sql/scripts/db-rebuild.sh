#!/usr/bin/env bash
# Simple rebuild:
#   1) (admin) CREATE DATABASE cs_quiz_legacy + GRANT  → 000_admin_create_cs_quiz_legacy.sql
#   2) restore original dump into cs_quiz_legacy (if empty)
#   3) wipe cs_quiz tables, apply 001 + 002
#   4) copy content from cs_quiz_legacy → cs_quiz
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SQL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

MYSQL=(mysql -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" -u "$DB_USER_DEV" -p"$DB_PASSWORD_DEV")
DUMP_FILE="${1:-}"

db_exists() {
  "${MYSQL[@]}" -N -e "SHOW DATABASES LIKE '$1';" 2>/dev/null | grep -qx "$1"
}

if ! db_exists cs_quiz_legacy; then
  cat <<EOF
[!] cs_quiz_legacy 데이터베이스가 없습니다.

quiz_dev 계정은 CREATE DATABASE 권한이 없습니다.
MySQL root로 아래를 한 번 실행한 뒤, 이 스크립트를 다시 돌려 주세요:

  mysql -h ${DB_HOST} -P ${DB_PORT} -u root -p < ${SQL_DIR}/000_admin_create_cs_quiz_legacy.sql

EOF
  exit 1
fi

# Prefer an explicit dump path; else newest backup; else dump current cs_quiz
BACKUP_DIR="$SQL_DIR/backups"
mkdir -p "$BACKUP_DIR"

if [[ -z "$DUMP_FILE" ]]; then
  DUMP_FILE="$(ls -1t "$BACKUP_DIR"/cs_quiz_*.sql 2>/dev/null | head -1 || true)"
fi

LEGACY_HAS_TABLES=$("${MYSQL[@]}" -N -e \
  "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='cs_quiz_legacy';" 2>/dev/null || echo 0)

if [[ "${LEGACY_HAS_TABLES}" == "0" ]]; then
  if [[ -z "$DUMP_FILE" || ! -f "$DUMP_FILE" ]]; then
    STAMP="$(date +%Y%m%d_%H%M%S)"
    DUMP_FILE="$BACKUP_DIR/cs_quiz_${STAMP}.sql"
    echo "[1] Dump current cs_quiz -> $DUMP_FILE"
    mysqldump -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" -u "$DB_USER_DEV" -p"$DB_PASSWORD_DEV" \
      --no-tablespaces --single-transaction cs_quiz > "$DUMP_FILE"
  else
    echo "[1] Use dump: $DUMP_FILE"
  fi
  echo "[2] Import dump into cs_quiz_legacy"
  "${MYSQL[@]}" cs_quiz_legacy < "$DUMP_FILE"
else
  echo "[1-2] cs_quiz_legacy already has tables — skip import"
fi

echo "[3] Apply new schema to cs_quiz"
"${MYSQL[@]}" < "$SQL_DIR/001_schema.sql"
"${MYSQL[@]}" < "$SQL_DIR/002_seed.sql"

echo "[4] Migrate content from cs_quiz_legacy"
"${MYSQL[@]}" < "$SQL_DIR/003_migrate_from_legacy_db.sql"

echo "[5] Counts"
"${MYSQL[@]}" cs_quiz -e "
SELECT 'tracks' AS t, COUNT(*) AS c FROM tracks
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'questions', COUNT(*) FROM questions
UNION ALL SELECT 'choices', COUNT(*) FROM choices
UNION ALL SELECT 'users', COUNT(*) FROM users;
"

echo "Done. Old data: cs_quiz_legacy | New app DB: cs_quiz"
