import { prisma } from "@cab/db/src/client";
import { computeQuotePaise, formatINR } from "@cab/core/src/pricing";
import Link from "next/link";

export default async function Page({ searchParams }: { searchParams: any }) {
  const { from, to, startAt, endAt } = searchParams;

  const [fromCity, toCity, cabTypes, rules] = await Promise.all([
    prisma.city.findUnique({ where: { id: String(from) } }),
    prisma.city.findUnique({ where: { id: String(to) } }),
    prisma.cabType.findMany({ where: { active: true } }),
    prisma.pricingRule.findMany({ where: { active: true } })
  ]);

  // placeholder route metrics (can be replaced with real routing later)
  const distanceKm = 250;
  const durationMin = 360;

  const quotes = cabTypes
    .map((ct) => {
      const r = rules.find((rr) => rr.cabTypeId === ct.id);
      if (!r) return null;
      const price = computeQuotePaise({
        distanceKm,
        durationMin,
        baseFare: r.baseFare,
        perKm: r.perKm,
        perMinute: r.perMinute
      });
      return { ct, rule: r, price };
    })
    .filter(Boolean) as Array<{ ct: (typeof cabTypes)[number]; rule: (typeof rules)[number]; price: number }>;
  quotes.sort((a, b) => a.price - b.price);

  const startStr = startAt ? new Date(startAt).toLocaleString() : "";
  const endStr = endAt ? new Date(endAt).toLocaleString() : "";

  return (
    <div className="container py-8">
      {/* Trip summary */}
      <div className="sticky top-4 z-10 mb-6 rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Trip</div>
            <div className="text-lg font-medium">
              {fromCity?.name} → {toCity?.name}
            </div>
            <div className="text-sm text-slate-500">
              {startStr} — {endStr}
            </div>
          </div>
          <div className="text-sm text-slate-500">
            {distanceKm} km • {Math.round(durationMin / 60)} hrs
          </div>
        </div>
      </div>

      {/* Result list */}
      <div className="grid gap-4">
        {quotes.map(({ ct, price }) => (
          <article
            key={ct.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition hover:shadow-lg"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={ct.image || "/cabs/sedan.jpg"}
                  alt={ct.name}
                  className="h-16 w-24 rounded-xl object-cover"
                />
                <div>
                  <div className="text-lg font-semibold">{ct.name}</div>
                  <div className="text-sm text-slate-600">
                    {ct.seats} seats • {ct.luggage} luggage
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-semibold">{formatINR(price)}</div>
                <div className="text-xs text-slate-500">All‑inclusive estimate</div>
                <Link
                  href={{
                    pathname: "/booking",
                    query: { from, to, startAt, endAt, cabTypeId: ct.id, price }
                  }}
                  className="btn btn-primary mt-2 w-full justify-center"
                >
                  Select
                </Link>
              </div>
            </div>
          </article>
        ))}

        {quotes.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600">
            No active pricing rules found for available cab types.
          </div>
        )}
      </div>
    </div>
  );
}
