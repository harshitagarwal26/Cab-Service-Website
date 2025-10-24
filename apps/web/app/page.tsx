// import { prisma } from '@cab/db/src/client';

// export default async function Page() {
//   const cities = await prisma.city.findMany({ where: { active: true }, orderBy: [{ name: 'asc' }] });
//   return (
//     <div className="rounded-2xl bg-white/5 border border-white/10 p-6 shadow-xl">
//       <h1 className="text-2xl font-semibold mb-6">Book your cab</h1>
//       <form action="/results" className="grid md:grid-cols-2 gap-6">
//         <div>
//           <label className="block text-sm text-slate-300 mb-2">From</label>
//           <select name="from" className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2" required>
//             <option value="">Select city</option>
//             {cities.map(c => <option key={c.id} value={c.id}>{c.name}, {c.state}</option>)}
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm text-slate-300 mb-2">To</label>
//           <select name="to" className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2" required>
//             <option value="">Select city</option>
//             {cities.map(c => <option key={c.id} value={c.id}>{c.name}, {c.state}</option>)}
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm text-slate-300 mb-2">Start date & time</label>
//           <input name="startAt" type="datetime-local" className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2" required/>
//         </div>
//         <div>
//           <label className="block text-sm text-slate-300 mb-2">End date & time</label>
//           <input name="endAt" type="datetime-local" className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2" required/>
//         </div>
//         <div className="md:col-span-2">
//           <button className="inline-flex items-center rounded-md bg-brand-600 hover:bg-brand-500 px-4 py-2">Search Cabs</button>
//         </div>
//       </form>
//     </div>
//   );
// }

import { prisma } from "@cab/db/src/client";

export default async function Page() {
  const cities = await prisma.city.findMany({
    where: { active: true },
    orderBy: [{ name: "asc" }]
  });

  return (
    <div className="container py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Book your cab</h1>
        <p className="text-slate-500">Outstation, one‑way, and round trips with transparent pricing.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <form action="/results" className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">From</label>
            <select
              name="from"
              required
              className="select"
              defaultValue=""
            >
              <option value="" disabled>
                Select city
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.state}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">Pickup city or airport.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">To</label>
            <select
              name="to"
              required
              className="select"
              defaultValue=""
            >
              <option value="" disabled>
                Select city
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.state}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">Drop city or landmark.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Start date & time
            </label>
            <input
              name="startAt"
              type="datetime-local"
              required
              className="input"
            />
            <p className="text-xs text-slate-500">For round trips, this is the pickup time.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              End date & time
            </label>
            <input
              name="endAt"
              type="datetime-local"
              required
              className="input"
            />
            <p className="text-xs text-slate-500">For round trips, choose the return time.</p>
          </div>

          <div className="md:col-span-2 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Instant quotes. No hidden fees.
            </div>
            <button className="btn btn-primary">
              Search Cabs
              <svg viewBox="0 0 24 24" className="ml-1 h-5 w-5" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M5 12h12l-4-4 1.4-1.4L21.8 12l-7.4 5.4L13 16l4-4H5z"
                />
              </svg>
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="mb-1 text-lg font-semibold">Clean cars</div>
          <p className="text-sm text-slate-600">Verified partners and well‑maintained vehicles.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="mb-1 text-lg font-semibold">Transparent fares</div>
          <p className="text-sm text-slate-600">Know your price upfront with itemized quotes.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="mb-1 text-lg font-semibold">24x7 support</div>
          <p className="text-sm text-slate-600">Help whenever it’s needed, along your route.</p>
        </div>
      </section>
    </div>
  );
}
