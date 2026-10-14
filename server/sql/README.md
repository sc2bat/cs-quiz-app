# Database

목표 흐름은 단순합니다.

1. 기존 `cs_quiz` → **`cs_quiz_legacy`** 로 보존  
2. 빈 **`cs_quiz`** 에 새 스키마 생성  
3. (선택) `cs_quiz_legacy` 문제 은행을 `cs-interview` 트랙으로 복사

## 왜 admin이 한 번 필요한가

`quiz_dev` 권한은 `cs_quiz.*` 만 있습니다.  
`CREATE DATABASE cs_quiz_legacy` 는 **root/admin** 이 해야 합니다.

```bash
mysql -h HOST -P PORT -u root -p < sql/000_admin_create_cs_quiz_legacy.sql
```

## 그다음 (app 계정)

```bash
cd server
./sql/scripts/db-rebuild.sh
# 또는 특정 dump 지정:
./sql/scripts/db-rebuild.sh sql/backups/cs_quiz_20261013_104423.sql
```

권장 dump: 혼잡해지기 **전** 백업 `sql/backups/cs_quiz_20261013_104423.sql`

## 파일

| 파일 | 역할 |
|------|------|
| `000_admin_create_cs_quiz_legacy.sql` | root: DB 생성 + GRANT |
| `001_schema.sql` | 새 `cs_quiz` 테이블 |
| `002_seed.sql` | tracks 시드 |
| `003_migrate_from_legacy_db.sql` | legacy → 새 DB 콘텐츠 복사 |
| `scripts/db-rebuild.sh` | 위 순서 실행 |

## 새 스키마 요약

`tracks` → `categories` → `questions` → `choices`  
`users`, `quiz_records`(+`track_id`), `quiz_record_categories`, `quiz_submissions`, `wrong_answers`

추가 마이그레이션:
- `004_questions_is_active.sql` — 문제 soft-delete (`is_active`)
