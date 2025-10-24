export type QuoteInput = {
  distanceKm: number;
  durationMin: number;
  baseFare: number;
  perKm: number;
  perMinute: number;
  surge?: number; // e.g., 1.0 no surge, 1.2 20% surge
};