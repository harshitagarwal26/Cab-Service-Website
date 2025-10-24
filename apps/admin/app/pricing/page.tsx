import { prisma } from "@cab/db/src/client";
import { revalidatePath } from "next/cache";

async function addRule(formData: FormData) {
  "use server";
  const cabTypeId = String(formData.get("cabTypeId"));
  const baseFare = Math.round(Number(formData.get("baseFare")) * 100);
  const perKm = Math.round(Number(formData.get("perKm")) * 100);
  const perMinute = Math.round(Number(formData.get("perMinute")) * 100);
  await prisma.pricingRule.create({ data: { cabTypeId, baseFare, perKm, perMinute } });
  revalidatePath("/pricing");
}

export default async function Pricing() {
  const [cabs, rules] = await Promise.all([
    prisma.cabType.findMany({ orderBy: [{ name: 'asc' }] }),
    prisma.pricingRule.findMany({ include: { cabType: true } })
  ]);

  return (
    <div className="space-y-6">
      <form action={addRule} className="grid md:grid-cols-5 gap-2">
        <select name="cabTypeId" className="rounded-md bg-white/5 border border-white/10 px-3 py-2">
          {cabs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input name="baseFare" placeholder="Base (INR)" className="rounded-md bg-white/5 border border-white/10 px-3 py-2" required/>
        <input name="perKm" placeholder="Per Km (INR)" className="rounded-md bg-white/5 border border-white/10 px-3 py-2" required/>
        <input name="perMinute" placeholder="Per Min (INR)" className="rounded-md bg-white/5 border border-white/10 px-3 py-2" required/>
        <button className="rounded-md bg-brand-600 hover:bg-brand-500 px-4">Add Rule</button>
      </form>

      <div className="space-y-2">
        {rules.map(r => (
          <div key={r.id} className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center justify-between">
            <div>{r.cabType.name}</div>
            <div className="text-sm text-slate-300">Base ₹{(r.baseFare/100).toFixed(2)} • PerKm ₹{(r.perKm/100).toFixed(2)} • PerMin ₹{(r.perMinute/100).toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
