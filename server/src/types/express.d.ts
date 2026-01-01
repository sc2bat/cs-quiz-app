/**
 * [타입 정의 파일: express.d.ts]
 *
 * 1. .d.ts (Definition) 란?
 * - 컴파일 후 .js로 변환되지 않는 순수 '타입 선언(설명서)' 파일
 * - 실제 실행 로직은 없으며, 컴파일러에게 "이 변수는 이런 타입이다"라고 알려주는 역할만 수행
 *
 * 2. 파일명이 express인 이유
 * - Express 라이브러리의 기존 타입을 확장하거나 수정한다는 것을 명시하기 위함
 *
 * 3. 목적
 * - Express의 기본 Request 객체에는 'user' 속성이 존재하지 않음
 * - 미들웨어(authMiddleware)에서 할당하는 req.user를 TypeScript가 인식할 수 있도록
 * 전역(Global)으로 타입을 확장해주는 설정
 */

// UserRow 타입을 import 해서 구체적으로 명시
import { UserRow } from './user'; 

declare global {
    namespace Express {
        interface User extends UserRow{}
    }
}

export {};