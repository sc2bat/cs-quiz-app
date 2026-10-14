# Admin 운영 가이드

## ADMIN 권한 부여

앱이 쓰는 DB는 `cs_quiz` 입니다 (`server/.env`의 `DB_NAME`).

```sql
-- 반드시 cs_quiz 에서 실행
USE cs_quiz;
UPDATE users SET user_role = 'ADMIN' WHERE email = 'your@email.com';
-- 또는
UPDATE users SET user_role = 'ADMIN' WHERE nickname = 'your-nickname';

-- 확인
SELECT nickname, user_role FROM users WHERE nickname = 'your-nickname';
```

**중요:** Admin 버튼은 DB가 아니라 **로그인 시 발급된 JWT의 `role`** 을 봅니다.  
role을 올린 뒤에는 **로그아웃 → 다시 로그인** 해야 버튼이 나타납니다.  
프론트 `/admin` 과 API `/api/admin/*` 에 접근할 수 있습니다.

## 새 트랙(SQLP / AWS 등) 추가 절차

Admin은 **드릴다운** 구조입니다. 브레드크럼으로 현재 위치를 확인하세요.

1. `/admin` → 트랙 카드 선택 (또는 트랙 추가)  
   - 예: slug `sqlp`, name `SQL Developer (SQLP)`
2. `/admin/tracks/:trackId` → 해당 트랙의 카테고리(과목) 추가·선택
3. `/admin/tracks/:trackId/categories/:categoryId` → 문제 추가  
   - 객관식: 보기마다 입력란 + 정답 라디오 (textarea 한 칸 아님)
4. 홈 → 해당 트랙 → Practice/Exam에서 바로 확인

## API 요약

| Method | Path | 설명 |
|--------|------|------|
| GET/POST | `/api/admin/tracks` | 트랙 목록/생성 |
| PATCH/DELETE | `/api/admin/tracks/:id` | 수정/삭제 |
| GET/POST | `/api/admin/categories` | 카테고리 (`?trackId=`) |
| PATCH/DELETE | `/api/admin/categories/:id` | 수정/삭제 |
| GET/POST | `/api/admin/questions` | 문제 (`?categoryId=`) |
| PATCH/DELETE | `/api/admin/questions/:id` | 수정/삭제 |
