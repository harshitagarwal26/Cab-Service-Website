'use server';

import { prisma } from "@cab/db/src/client";
import { revalidatePath } from "next/cache";

export async function updateProfile(userId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  
  await prisma.user.update({
    where: { id: userId },
    data: { name, phone }
  });
  
  revalidatePath("/profile");
}