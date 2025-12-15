import { db } from "../config/db";
import { COMMON_QUERIES } from "./queries";
import { DateTimeRow } from "../types/system";
import {RowDataPacket} from "mysql2";

export const systemModel = {
    async getSelectOne(): Promise<RowDataPacket[]> {
        const [rows] = await db.query<RowDataPacket[]>(
            COMMON_QUERIES.GET_SELECT_ONE
        );
        return rows;
    },
    async getDatabaseDateTime(): Promise<Date | null>{
        const [rows] = await db.query<DateTimeRow[]>(COMMON_QUERIES.GET_NOW);
        return rows[0]?.now || null;
    }
}