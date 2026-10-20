import { db } from "../config/db";
import { TrackRow } from "../types/track";
import { TRACK_QUERIES } from "./queries";

export const trackModel = {
    async getActiveTracks(): Promise<TrackRow[]> {
        const [rows] = await db.query<TrackRow[]>(TRACK_QUERIES.GET_ACTIVE_TRACKS);
        return rows;
    },
    async getTrackBySlug(slug: string): Promise<TrackRow | null> {
        const [rows] = await db.query<TrackRow[]>(TRACK_QUERIES.GET_TRACK_BY_SLUG, [slug]);
        return rows[0] ?? null;
    },
    async getTrackById(trackId: number): Promise<TrackRow | null> {
        const [rows] = await db.query<TrackRow[]>(TRACK_QUERIES.GET_TRACK_BY_ID, [trackId]);
        return rows[0] ?? null;
    },
};
