import { generateToken } from '../../src/utils/jwt';
import { UserRow } from '../../src/types/user';

type TokenUser = Pick<UserRow, 'user_id' | 'email' | 'nickname' | 'user_role'>;

/** Issue a JWT the same way production auth does (no OAuth). */
export function authToken(user: TokenUser): string {
  return generateToken(user as UserRow);
}

export function adminToken(overrides: Partial<TokenUser> = {}): string {
  return authToken({
    user_id: overrides.user_id ?? 1,
    email: overrides.email ?? 'admin@test.local',
    nickname: overrides.nickname ?? 'admin',
    user_role: 'ADMIN',
  });
}

export function userToken(overrides: Partial<TokenUser> = {}): string {
  return authToken({
    user_id: overrides.user_id ?? 2,
    email: overrides.email ?? 'user@test.local',
    nickname: overrides.nickname ?? 'user',
    user_role: 'USER',
  });
}
