import { ResultSetHeader } from "mysql2";
import { db } from "../config/db";
import { CreateUserDto, UpdateUserDto, UpdateUserLoginInfoDto, UserRow } from "../types/user";
import { USER_QUERIES } from "./queries";
import { QUIZ_SETTINGS } from "./constants";

export const userModel = {
    async getUserBySnsId(provider: string, snsId: string): Promise<UserRow | undefined> {
        const [rows] = await db.query<UserRow[]>(
            USER_QUERIES.GET_USER_BY_SNS_ID,
            [provider, snsId]
        );
        return rows[0];
    },
    async getUserByUserId(user_id: number): Promise<UserRow | undefined> {
        const [rows] = await db.query<UserRow[]>(
            USER_QUERIES.GET_USER_BY_USER_ID,
            [user_id]
        );
        return rows[0];
    },
    async createUserProfile(dto: CreateUserDto): Promise<number> {
        const result = await db.execute(
            USER_QUERIES.CREATE_USER,
            [
                dto.email,
                dto.nickname,
                dto.profile_image_url,
                dto.provider,
                dto.sns_id,
                QUIZ_SETTINGS.DEFAULT_USER_ROLE
            ]
        );
        return result.insertId;
    },
    async updateUserLoginInfo(dto: UpdateUserLoginInfoDto) {
        const result = await db.execute(
            USER_QUERIES.UPDATE_USER_LOGIN_INFO,
            [
                dto.profile_image_url,
                dto.provider,
                dto.sns_id
            ]
        );
        return result.affectedRows > 0;
    }
}