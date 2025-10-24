import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@cab/db/src/client";
import bcrypt from "bcryptjs";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(creds) {
        if (!creds?.email || !creds.password) return null;
        const user = await prisma.user.findUnique({ where: { email: String(creds.email) } });
        if (!user) return null;
        const ok = await bcrypt.compare(String(creds.password), user.hashedPassword);
        if (!ok) return null;
        return { id: user.id, name: user.name ?? 'Admin', email: user.email, role: user.role };
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" }
});
