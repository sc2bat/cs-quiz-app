# cs-quiz-app

### 💻 CS Interview Master (CS 면접 대비 퀴즈 서비스)

"단순 암기는 지루하니까, 직접 만든 서비스로 재미있게 학습하자."

개발자 면접을 준비하며 CS(Computer Science) 지식을 체계적으로 학습하기 위해 개발한 웹 애플리케이션입니다.

---

### 📅 프로젝트 개요
개발 기간: 2025.11.30 ~ 2025.XX.XX (예정)

개발 인원: 1인 (개인 프로젝트)

목표:

React와 Node.js 환경에서 TypeScript를 도입하여 타입 안정성이 보장된 풀스택 개발 경험.

RESTful API 설계 및 RDBMS(MySQL) 모델링 경험.

단순 CRUD를 넘어 상태 관리(타이머, 오답 노트) 로직 구현.

🛠 Tech Stack (기술 스택)
Frontend
<img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=black"/> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white"/> <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=Vite&logoColor=white"/>

Vite: 빠른 개발 서버 구동과 HMR(Hot Module Replacement)을 위해 채택.

Axios: 백엔드 API와의 비동기 통신 처리.

CSS/Styled-components: 
<!-- (사용하시는 스타일 라이브러리에 맞춰 수정하세요) -->

Backend
<img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=Node.js&logoColor=white"/> <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=Express&logoColor=white"/> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white"/>

Express: 가볍고 유연한 라우팅 처리를 위해 사용.

MySQL2: DB 커넥션 풀 관리 및 쿼리 실행.

Database
<img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=MySQL&logoColor=white"/>

RDBMS: 문제(Questions)와 보기(Choices)의 관계형 데이터 모델링.

---

### 📌 Key Features (핵심 기능)

#### 1. 퀴즈 풀기 (Core)

카테고리별 학습: OS, Network, Data Structure 등 주제별 문제 풀이 가능.

다양한 문제 유형:

객관식: 4~5지 선다형.

주관식: 핵심 키워드 단답형 입력.

랜덤 출제: 매번 문제 순서를 섞어 단순 위치 암기 방지 (ORDER BY RAND() 및 클라이언트 셔플 활용).

#### 2. 학습 보조 기능 (Advanced)

⏱ 타임 어택: setInterval을 활용하여 한 문제당 30초 제한 기능 구현. 긴장감 조성 및 실제 면접 환경 모사.

📝 오답 노트: 틀린 문제는 LocalStorage에 ID를 저장하여, 서버 로그인 없이도 브라우저 기반으로 다시 풀기 기능 제공.

즉시 피드백: 답안 제출 시 정답 여부와 상세 해설(Explanation) 즉시 모달/UI로 노출.

#### 3. 관리자 (Admin)

별도의 관리자 페이지를 통해 CS 문제 CRUD(생성, 조회, 수정, 삭제) 관리.

🗂 Database Schema (ERD)
주관식과 객관식을 모두 수용하기 위해 다음과 같이 정규화하였습니다.

Questions: 문제 본문, 카테고리, 해설, (주관식 정답)

Choices: 객관식 보기 내용, 정답 여부 플래그 (is_correct)

<!-- (추후 이곳에 ERD 다이어그램 이미지를 캡처해서 넣으면 베스트입니다) -->

---
### 🚀 Getting Started (실행 방법)
이 프로젝트는 Monorepo 구조로 되어 있습니다.

### 1. 환경 변수 설정 (.env)
루트 디렉토리에 .env 파일을 생성하고 DB 정보를 입력해야 합니다.


DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=cs_quiz
PORT=8081

### 2. 설치 및 실행
### 레포지토리 클론
git clone https://github.com/sc2bat/cs-quiz-app.git

### 1. Backend 실행
cd server
npm install
npm run dev

### 2. Frontend 실행 (새 터미널)
cd client
npm install
npm run dev

---
### 🧐 Retrospective (개발 회고 & 트러블 슈팅)
<!-- (프로젝트를 진행하면서 겪은 어려움과 해결 과정을 이곳에 한두 줄씩 추가해 나가세요. 포트폴리오의 핵심입니다.)

문제점: React와 Node.js 양쪽에서 TypeScript 타입을 공유하지 못해 중복 정의가 발생함.

해결: (예: types 폴더를 공통으로 빼거나, 백엔드의 타입을 프론트에서 import 하는 방식 고민 중)

문제점: 타이머가 페이지를 이동해도 계속 돌아가거나 중복 실행되는 메모리 누수 발생.

해결: useEffect의 cleanup 함수(return () => clearInterval(timer))를 사용하여 컴포넌트 언마운트 시 타이머 해제. -->
---
### 📝 Commit Convention

이 프로젝트는 **Git Conventional Commits** 규칙을 준수하여, 체계적인 변경 이력 관리를 지향합니다.

| Tag | Description | 사용 예시 |
|:---:|:---|:---|
|  `feat` | 새로운 기능 추가 | `feat: add timer component` |
|  `fix` | 버그 수정 | `fix: correct typo in main page` |
|  `docs` | 문서 수정 | `docs: update README tech stack` |
|  `style` | 코드 포맷팅 (로직 변경 없음) | `style: fix indentation` |
|  `refactor` | 코드 리팩토링 | `refactor: simplify quiz logic` |
|  `chore` | 설정 변경 및 기타 작업 | `chore: update .gitignore` |

**작성 규칙:**
* `type: subject` 형식을 따릅니다.
* `subject`는 명령문으로 작성합니다.