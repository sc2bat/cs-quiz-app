import { db } from "../config/db";
import { UserRow } from "../types/user";
import { USER_QUERIES } from "./queries";

export const userModel = {
    async getUserBySnsId(): Promise<UserRow[]> {
        const [rows] = await db.query<UserRow[]>(
            USER_QUERIES.GET_USER_BY_SNS_ID
        );
        return rows;
    }
}