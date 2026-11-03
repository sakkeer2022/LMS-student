// What the landing page shows that must come from the backend. There is no public endpoint for it yet
// (see amentorz-backend/docs/PENDING_DECISIONS.md, T9), so every value is empty and each section renders
// its empty state until the API exists. Nothing here is sample data.
export interface FeaturedTutor {
  id: string;
  name: string;
  headline: string;
  rating: number;
  pricePerSession: number;
  photoUrl: string | null;
}

export interface LandingStat {
  value: string;
  label: string;
}

export interface LandingData {
  /** Free resource count per category key (see content.ts); absent when unknown. */
  resourceCounts: Partial<Record<string, number>>;
  tutors: FeaturedTutor[];
  stats: LandingStat[];
}

export async function getLandingData(): Promise<LandingData> {
  return { resourceCounts: {}, tutors: [], stats: [] };
}
