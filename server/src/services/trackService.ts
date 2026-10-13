import { trackModel } from "../models/trackModel";
import { quizModel } from "../models/quizModel";

function parseDefaults(raw: unknown): Record<string, unknown> | null {
    if (raw == null) return null;
    if (typeof raw === 'object') return raw as Record<string, unknown>;
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw) as Record<string, unknown>;
        } catch {
            return null;
        }
    }
    return null;
}

export const trackService = {
    async getTracks() {
        const rows = await trackModel.getActiveTracks();
        return rows.map((row) => ({
            trackId: row.track_id,
            slug: row.slug,
            name: row.name,
            description: row.description,
            defaults: parseDefaults(row.defaults),
        }));
    },
    async getCategoriesByTrackSlug(slug: string) {
        const track = await trackModel.getTrackBySlug(slug);
        if (!track) return null;

        const categories = await quizModel.getCategoriesByTrackId(track.track_id);
        return {
            track: {
                trackId: track.track_id,
                slug: track.slug,
                name: track.name,
                description: track.description,
                defaults: parseDefaults(track.defaults),
            },
            categories: categories.map((row) => ({
                categoryId: row.category_id,
                trackId: row.track_id,
                name: row.name,
            })),
        };
    },
};
