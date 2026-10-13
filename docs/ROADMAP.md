# Roadmap

[ARCHITECTURE.md](./ARCHITECTURE.md)의 To-Be를 구현하기 위한 단계별 계획이다.  
각 Phase는 **이전 Phase 완료**를 전제로 순서대로 진행한다.

---

## Phase 0 — 설계·문서

**목표:** 제품 포지션과 목표 아키텍처를 문서로 고정한다.

| 작업 | 상태 |
|------|------|
| `docs/ARCHITECTURE.md` 작성 | 완료 |
| `docs/ROADMAP.md` 작성 | 완료 |
| `README.md` 포지션·스택·실행 방법 정합 | 완료 |

**Definition of Done**

- 멀티 트랙( CS / 정보처리기사 / 확장 트랙 ) 포지션이 README와 ARCHITECTURE에 동일하게 기술되어 있다.
- As-Is 갭 목록과 Phase 매핑(아래 표)이 ROADMAP에 있다.

---

## Phase 1 — 기반 안정화

**목표:** 현재 코드가 로컬·배포 환경에서 안정적으로 동작하도록 버그와 저장소·타입 불일치를 정리한다.

| 작업 | 상태 | 참고 |
|------|------|------|
| `GET_QUIZ_RECORDS_BY_CURSOR` SQL 괄호 수정 | 완료 | `server/src/models/queries.ts` |
| `quiz_records` 쿼리·DTO를 `track_id` 스키마에 맞춤 | 완료 | 새 DB 반영 |
| `globalErrorHandler` `error.message` 오타 수정 | 완료 | `server/src/utils/errorHandler.ts` |
| `axiosClient.ts` 커밋 + env 기반 baseURL | 완료 | `client/src/api/` |
| 카테고리 API camelCase + 타입 정렬 | 완료 | `quizService`, client types |
| env 문서 (`VITE_QUIZ_API_BASE_URL` 등) | 완료 | README |
| `/api/system/db-check` production 비활성 | 완료 | `systemRoutes.ts` |

**Definition of Done**

- `npm run build`가 client/server에서 성공한다.
- 클론 후 env만 채우면 client가 API에 연결 가능하다.
- cursor 기록 조회 API가 MySQL 문법 오류 없이 실행된다.

---

## Phase 2 — Track 도입

**목표:** DB·API·홈 화면에 **트랙** 개념을 넣고 CS / 정보처리기사 시드를 둔다.

| 작업 | 상태 | 설명 |
|------|------|------|
| 마이그레이션 | 완료 | `server/sql/` + `cs_quiz` / `cs_quiz_legacy` |
| 시드 | 완료 | cs-interview, engineer-ipe, sqlp, aws-saa |
| API | 완료 | `GET /api/tracks`, `GET /api/tracks/:slug/categories` |
| 출제 API | 완료 | quizzes/categories에 `track` 쿼리 지원 |
| Client | 완료 | TrackSelect → 트랙별 퀴즈 세션 |

**Definition of Done**

- 사용자가 트랙을 고른 뒤, 해당 트랙 카테고리 문제만 출제된다.
- 기존 DB 데이터는 마이그레이션 스크립트로 기본 트랙에 귀속된다.

---

## Phase 3 — 학습 UX 완성 (Practice)

**목표:** 트랙 단위 **Practice** 플로우를 끝까지 연결한다.

| 작업 | 설명 |
|------|------|
| CategorySelect UI | 미사용 `CategoryFilter` 흡수, 프로젝트 CSS 기준 스타일 |
| 출제 | 선택한 `categoryIds`만 전달 (전체 자동 선택 제거) |
| 오답 API | `GET /api/quiz/questions?ids=` |
| Review | localStorage ID → API 재조회 후 복습 (트랙별 storage 키) |
| React Router | TrackSelect → CategorySelect → Quiz → Result 경로 |

**Definition of Done**

- 트랙 → 카테고리 → 퀴즈 → 결과 → 오답 복습이 새로고침·재출제 후에도 오답 ID 기준으로 동작한다.
- 타이머·즉시 해설·localStorage 오답 저장이 트랙별로 격리된다.

---

## Phase 4 — 계정·이력

**목표:** OAuth·JWT·quiz records를 클라이언트와 연결한다.

| 작업 | 설명 |
|------|------|
| `/login/success` | 토큰 수신·저장, 홈 이동 |
| JWT 전달 | 쿼리스트링 대신 code 교환 또는 HttpOnly 쿠키 |
| OAuth redirect | 환경별 `CORS_ORIGIN_*` 선택 |
| `logout` 라우트 등록 | `authRoutes.ts` |
| Records UI | 세션 종료 시 `POST /api/quiz/records` (`trackId` 포함) |
| History | `GET /api/quiz/records` 트랙 필터 |
| 오답 동기화 | 로그인 시 localStorage → `wrong_answers` merge |

**Definition of Done**

- 로그인 사용자는 트랙별 풀이 기록을 조회·삭제할 수 있다.
- 게스트는 기존처럼 localStorage만 사용 가능하다.

---

## Phase 5 — 콘텐츠 운영 (Admin)

**목표:** 코드 배포 없이 트랙·문제를 추가할 수 있는 최소 Admin을 제공한다.

| 작업 | 설명 |
|------|------|
| `requireAdmin` 미들웨어 | `user_role === ADMIN` |
| Admin API | 트랙·카테고리·문제·보기 CRUD |
| Admin UI | 별도 `/admin` 라우트 (간단한 폼 CRUD) |
| 운영 가이드 | 시드·Admin으로 SQLP/AWS 트랙 추가 절차 문서화 |

**Definition of Done**

- ADMIN 계정으로 새 트랙(`sqlp` 등)과 카테고리·문제를 등록하면 Practice에서 바로 풀 수 있다.

---

## Phase 6 — Exam 모드 (선택)

**목표:** 시험형 세션 — 서버 채점, 정답 비노출, 해설 지연.

| 작업 | 설명 |
|------|------|
| 출제 API variant | `mode=exam` 시 choices without `isCorrect`, no `subjectiveAnswer` |
| Submit API | 문항별 답안 제출, 서버 채점 |
| `quiz_submissions` | 저장·재채점·감사 (테이블 도입 또는 기존 상수 정리) |
| Client Exam UI | 전체 제한 시간, 종료 후 일괄 해설 |

**Definition of Done**

- Exam 세션 점수는 서버 채점 결과와만 일치하며, 진행 중 네트워크로 정답을 알 수 없다.

---

## As-Is 갭 → Phase 매핑

| 갭 | Phase |
|----|-------|
| Track 계층 없음 | 2 |
| 전 카테고리 혼합 출제 | 2, 3 |
| CategoryFilter 미사용 | 3 |
| 오답 in-memory 필터만 | 3 |
| Auth/Records 클라이언트 없음 | 4 |
| JWT URL 노출, redirect env | 4 |
| Admin CRUD 없음 | 5 |
| API 정답 노출 (Exam 대비) | 6 (Practice는 허용 유지) |
| cursor SQL, errorHandler, axiosClient gitignore | 1 |
| README·env 불일치 | 0, 1 |
| 타입 중복·필드명 불일치 | 1 (정리), ARCHITECTURE 중기 목표 |

---

## CI/CD (현행·목표)

**현행:** push `main` → SSH → `npm install/build` → pm2 restart, lint/test 없음.

**목표 (Phase 1 이후 권장):**

- PR/push 시 `client` eslint + `tsc -b`, `server` `tsc` job 추가
- (Phase 3+) 핵심 훅/API 통합 테스트 최소 1 suite

---

## 콘텐츠 확장 (트랙 추가 체크리스트)

Phase 2·5 완료 후 새 자격증 트랙 추가 시:

1. `tracks` row 추가 (`slug`, `name`, `defaults`)
2. `categories` + `questions` + `choices` (Admin 또는 SQL 시드)
3. README 또는 `docs/content/<slug>.md`에 과목·출처 메모 (선택)
4. Practice에서 smoke test (출제·채점·오답·기록)
