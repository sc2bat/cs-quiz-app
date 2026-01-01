import {RowDataPacket} from "mysql2";

export interface DateTimeRow extends RowDataPacket {
    now: Date;
}