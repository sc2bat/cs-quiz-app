export interface Track {
  trackId: number;
  slug: string;
  name: string;
  description: string | null;
  defaults: {
    questionLimit?: number;
    secondsPerQuestion?: number;
  } | null;
}
