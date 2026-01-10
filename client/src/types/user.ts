export type UserRole = 'USER' | 'ADMIN';
export type AuthProvider = 'google' | 'github';

export interface User {
  userId: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  provider: AuthProvider;
  role: UserRole;
  lastLoginAt?: string;
}

export interface RawUserFromDB {
  user_id: number;
  email: string;
  nickname: string;
  profile_image_url: string | null;
  provider: AuthProvider;
  role: UserRole;
  sns_id: string;
  last_login_at: string;
}

export interface AuthResponse {
  user: RawUserFromDB;
}