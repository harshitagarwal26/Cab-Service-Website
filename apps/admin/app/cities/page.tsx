import { prisma } from "@cab/db/src/client";
import { revalidatePath } from "next/cache";

async function addCity(formData: FormData) {
  "use server";
  const name = String(formData.get("name"));
  const state = String(formData.get("state"));
  await prisma.city.create({ data: { name, state } });
  revalidatePath("/cities");
}

export default async function Cities() {
  const cities = await prisma.city.findMany({ orderBy: [{ name: 'asc' }] });
  return (
    <div className="space-y-6">
      <form action={addCity} className="flex gap-2">
        <input name="name" placeholder="City" className="rounded-md bg-white/5 border border-white/10 px-3 py-2" required/>
        <input name="state" placeholder="State" className="rounded-md bg-white/5 border border-white/10 px-3 py-2" required/>
        <button className="rounded-md bg-brand-600 hover:bg-brand-500 px-4">Add</button>
      </form>
      <div className="grid md:grid-cols-2 gap-3">
        {cities.map(c => (
          <div key={c.id} className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center justify-between">
            <div>{c.name}, {c.state}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
