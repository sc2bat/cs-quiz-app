import { systemModel } from "../models/systemModel";

export const systemService = {
    async getDatabaseDateTime() {
        const databaseTime = await systemModel.getDatabaseDateTime();

        return databaseTime;
    },
    async checkDatabaseConnection() {
        const rows = await systemModel.getSelectOne();

        if(!rows || rows.length === 0 ){
            throw new Error('DB connection check failed');
        }

        return rows;
    }
    // memory or cpu check?
}