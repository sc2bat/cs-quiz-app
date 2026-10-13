# cs-quiz-app

### 멀티 트랙 퀴즈 학습 플랫폼

CS 면접, 정보처리기사, SQLP, AWS 등 **여러 학습 트랙**을 하나의 퀴즈 엔진으로 풀기 위한 개인 학습용 웹 앱입니다.

- **설계:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **구현 순서:** [docs/ROADMAP.md](docs/ROADMAP.md)

---

### 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 개발 기간 | 2025.11.30 ~ (진행 중) |
| 개발 인원 | 1인 (개인 프로젝트) |
| 구조 | `client/` + `server/` 이중 패키지 (루트 monorepo 아님) |

**목표**

- TypeScript 풀스택(React + Express + MySQL) 경험
- 트랙(Track) 단위로 콘텐츠를 나누는 확장 가능한 퀴즈 도메인
- Practice(타이머·오답·해설) 중심 UX, 이후 Exam·Admin·기록 연동

---

### Tech Stack

**Frontend**

<img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=black"/> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white"/> <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=Vite&logoColor=white"/>

- Vite, React 19, Axios
- 스타일: CSS (`App.css` 등)

**Backend**

<img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=Node.js&logoColor=white"/> <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=Express&logoColor=white"/> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white"/>

- Express 5, Passport (Google/GitHub OAuth), JWT
- MySQL2 (connection pool), Winston

**Database**

<img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=MySQL&logoColor=white"/>

- `categories` → `questions` → `choices` (+ `users`, `quiz_records`)
- 목표 스키마: `tracks` 및 트랙별 카테고리 — [ARCHITECTURE.md](docs/ARCHITECTURE.md) 참고

---

### Key Features

#### 구현됨 (현재)

- 객관식 / 주관식 퀴즈, 문제당 30초 타이머
- 랜덤 출제 (`ORDER BY RAND()`)
- 즉시 정오답·해설 UI
- 오답 ID localStorage 저장 및 결과 화면에서 복습(현재 세션 문제 기준 — [ROADMAP Phase 3](docs/ROADMAP.md))
- 백엔드: OAuth, JWT, quiz records API

#### 로드맵 (예정)

| 기능 | Phase |
|------|-------|
| 트랙 선택 (CS / 정보처리기사 등) | 2 |
| 카테고리 선택 UI, 오답 ID 재조회 | 3 |
| 로그인·풀이 기록 UI | 4 |
| Admin 문제 CRUD | 5 |
| Exam 모드(서버 채점) | 6 |

자세한 완료 조건은 [ROADMAP.md](docs/ROADMAP.md)를 본다.

---

### Getting Started

#### 1. 환경 변수

**Server** — `server/.env` 예시:

```env
PORT=8081
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cs_quiz
DB_USER_DEV=root
DB_PASSWORD_DEV=yourpassword
JWT_SECRET=your_jwt_secret
CORS_ORIGIN_LOCAL=http://localhost:5173
# OAuth (사용 시)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=
```

**Client** — `client/.env` (Vite):

```env
VITE_PORT=5173
VITE_QUIZ_API_BASE_URL=http://localhost:8081
VITE_ALLOW_HOST=localhost
VITE_ALLOW_HOST_WWW=
```

`axiosClient.ts`는 `VITE_QUIZ_API_BASE_URL`을 baseURL로 사용한다.

#### 2. 설치 및 실행

```bash
git clone https://github.com/sc2bat/cs-quiz-app.git
cd cs-quiz-app

# Backend
cd server && npm install && npm run dev

# Frontend (새 터미널)
cd client && npm install && npm run dev
```

---

### Retrospective (개발 회고)

<!-- 진행하며 이 섹션에 트러블슈팅을 추가 -->

- **타입 중복:** client/server 각각 `types/` — 공유 패키지는 ARCHITECTURE 중기 목표
- **타이머:** `useEffect` cleanup으로 `clearInterval` 처리

---

### Commit Convention

**Git Conventional Commits** (`type: subject`, subject는 명령문)

| Tag | Description | 예시 |
|:---:|:---|:---|
| `feat` | 새 기능 | `feat: add track list API` |
| `fix` | 버그 수정 | `fix: cursor pagination SQL` |
| `docs` | 문서 | `docs: add architecture` |
| `style` | 포맷 (로직 무) | `style: fix indentation` |
| `refactor` | 리팩터 | `refactor: quiz service DTO` |
| `chore` | 설정 등 | `chore: update gitignore` |
