import { prisma } from "@cab/db/src/client";
import { revalidatePath } from "next/cache";

async function addCab(formData: FormData) {
  "use server";
  const name = String(formData.get("name"));
  const seats = Number(formData.get("seats"));
  const luggage = Number(formData.get("luggage"));
  await prisma.cabType.create({ data: { name, seats, luggage } });
  revalidatePath("/cabs");
}

export default async function Cabs() {
  const cabs = await prisma.cabType.findMany({ orderBy: [{ name: 'asc' }] });
  return (
    <div className="space-y-6">
      <form action={addCab} className="grid md:grid-cols-4 gap-2">
        <input name="name" placeholder="Name" className="rounded-md bg-white/5 border border-white/10 px-3 py-2" required/>
        <input name="seats" placeholder="Seats" className="rounded-md bg-white/5 border border-white/10 px-3 py-2" required/>
        <input name="luggage" placeholder="Luggage" className="rounded-md bg-white/5 border border-white/10 px-3 py-2" required/>
        <button className="rounded-md bg-brand-600 hover:bg-brand-500 px-4">Add</button>
      </form>
      <div className="grid md:grid-cols-2 gap-3">
        {cabs.map(c => (
          <div key={c.id} className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center justify-between">
            <div>{c.name} • {c.seats} seats • {c.luggage} luggage</div>
          </div>
        ))}
      </div>
    </div>
  );
}
