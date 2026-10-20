export interface TrackPassRule {
  minPerCategory: number;
  /** IPE-style: arithmetic mean of category scores (0–100) */
  minAverage?: number;
  /** SQLP-style: overall correct/total × 100 */
  minOverall?: number;
}

export interface Track {
  trackId: number;
  slug: string;
  name: string;
  description: string | null;
  defaults: {
    questionLimit?: number;
    secondsPerQuestion?: number;
    passRule?: TrackPassRule;
  } | null;
}
