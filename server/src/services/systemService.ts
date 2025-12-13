import { db } from "../config/db"
import { COMMON_QUERIES } from "../models/queries"

export const systemService = {
    checkDatabaseConnection: async () => {
        const [rows] = await db.query(COMMON_QUERIES.GET_SELECT_ONE);

        if (!rows || rows.length === 0) {
            throw new Error('DB connection check failed');
        }

        return rows;
    },

    // memory or cpu check?
}