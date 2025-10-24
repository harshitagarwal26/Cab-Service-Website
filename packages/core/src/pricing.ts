import { QuoteInput } from './types';

export function computeQuotePaise(input: QuoteInput): number {
  const { distanceKm, durationMin, baseFare, perKm, perMinute, surge = 1 } = input;
  const variable = distanceKm * perKm + durationMin * perMinute;
  const subtotal = baseFare + variable;
  const surged = Math.round(subtotal * surge);
  // optionally add taxes/fees here
  return surged;
}

export function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
}
