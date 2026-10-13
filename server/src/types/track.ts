import { RowDataPacket } from "mysql2";

export interface TrackRow extends RowDataPacket {
  track_id: number;
  slug: string;
  name: string;
  description: string | null;
  defaults: unknown;
  is_active: number;
}
