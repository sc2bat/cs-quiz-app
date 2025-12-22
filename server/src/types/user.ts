import { RowDataPacket } from "mysql2";

export interface UserRow extends RowDataPacket {
    user_id: number;
    email: string;
    nickname: string;
    profile_image_url: string;
    provider:string;
    sns_id:string;
    user_role: string;
    last_login_at: Date;
    create_at: Date;
}

export type CreateUserDto = Pick<
    UserRow, 
    'email' | 'nickname' | 'profile_image_url' | 'provider' | 'sns_id'
>;

export type UpdateUserDto = Pick<UserRow, 'user_id'> & 
    Partial<Pick<UserRow, 'nickname' | 'profile_image_url'>>;

export type UpdateUserLoginInfoDto = Pick<UserRow, 'provider' | 'sns_id'> & 
    Partial<Pick<UserRow, 'nickname' | 'profile_image_url'>>;