// import { prisma } from "@cab/db/src/client";

// export default async function Page() {
//   const [cities, cabs, rules] = await Promise.all([
//     prisma.city.count(),
//     prisma.cabType.count(),
//     prisma.pricingRule.count()
//   ]);
//   return (
//     <div className="grid md:grid-cols-3 gap-4">
//       <div className="rounded-xl bg-white/5 border border-white/10 p-4">Cities: {cities}</div>
//       <div className="rounded-xl bg-white/5 border border-white/10 p-4">Cab types: {cabs}</div>
//       <div className="rounded-xl bg-white/5 border border-white/10 p-4">Pricing rules: {rules}</div>
//     </div>
//   );
// }

import { prisma } from "@cab/db/src/client";
import { GlowGrid } from "./_ui/GlowGrid";
import { StatCard } from "./_ui/StatCard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [cities, cabs, rules] = await Promise.allSettled([
    prisma.city.count(),
    prisma.cabType.count(),
    prisma.pricingRule.count()
  ]);

  const toNum = (r: PromiseSettledResult<number>) =>
    r.status === "fulfilled" ? r.value : 0;

  const nf = new Intl.NumberFormat("en-IN");
  const V = (n: number) => nf.format(n);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-400">Key stats for operations</p>
        </div>
        <div className="hidden gap-3 md:flex">
          <a href="/cities" className="btn btn-ghost">Manage Cities</a>
          <a href="/cabs" className="btn btn-ghost">Manage Cabs</a>
          <a href="/pricing" className="btn btn-primary">Edit Pricing</a>
        </div>
      </div>

      {/* Stats */}
      <GlowGrid>
        <StatCard
          label="Cities"
          value={V(toNum(cities))}
          icon={
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              <path fill="currentColor" d="M3 21h18v-2H3v2Zm2-4h14V5H5v12Zm2-2V7h10v8H7Z" />
            </svg>
          }
        />
        <StatCard
          label="Cab types"
          value={V(toNum(cabs))}
          icon={
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              <path
                fill="currentColor"
                d="M5 11l1.5-4.5h11L19 11h1a2 2 0 0 1 2 2v4h-2v-2H4v2H2v-4a2 2 0 0 1 2-2h1Zm2.1-3L6.4 11h11.2l-.7-3H7.1ZM6 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm12 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
              />
            </svg>
          }
        />
        <StatCard
          label="Pricing rules"
          value={V(toNum(rules))}
          icon={
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              <path fill="currentColor" d="M3 5h18v2H3V5Zm0 6h18v2H3v-2Zm0 6h18v2H3v-2Z" />
            </svg>
          }
        />
      </GlowGrid>

      {/* Secondary cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card card-hover">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <a href="/pricing" className="text-sm text-indigo-400 hover:underline">
              View all
            </a>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span>Edited pricing for “Sedan”</span>
              <span className="text-slate-400">2h ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Added city “Surat”</span>
              <span className="text-slate-400">5h ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Created cab type “Honda City”</span>
              <span className="text-slate-400">Yesterday</span>
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Quick actions</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <a href="/cities" className="btn btn-ghost">Add city</a>
            <a href="/cabs" className="btn btn-ghost">Add cab type</a>
            <a href="/pricing" className="btn btn-primary">Create pricing rule</a>
            <a href="/settings" className="btn btn-ghost">Payment settings</a>
          </div>
        </div>
      </div>
    </div>
  );
}
