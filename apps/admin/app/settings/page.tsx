import { prisma } from "@cab/db/src/client";
import { revalidatePath } from "next/cache";

async function save(formData: FormData) {
  "use server";
  const keyId = String(formData.get("keyId"));
  const keySecret = String(formData.get("keySecret"));
  await prisma.setting.upsert({
    where: { key: "payment.razorpay" },
    update: { valueJson: { keyId, keySecret } as any },
    create: { key: "payment.razorpay", valueJson: { keyId, keySecret } as any }
  });
  revalidatePath("/settings");
}

export default async function Settings() {
  const s = await prisma.setting.findUnique({ where: { key: "payment.razorpay" } });
  const val = (s?.valueJson as any) ?? { keyId: "", keySecret: "" };
  return (
    <form action={save} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-300 mb-2">Razorpay Key ID</label>
          <input name="keyId" defaultValue={val.keyId} className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"/>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-2">Razorpay Key Secret</label>
          <input name="keySecret" defaultValue={val.keySecret} className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"/>
        </div>
      </div>
      <button className="rounded-md bg-brand-600 hover:bg-brand-500 px-4 py-2">Save</button>
    </form>
  );
}
