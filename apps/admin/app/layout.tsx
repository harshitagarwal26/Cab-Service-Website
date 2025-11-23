import "./globals.css";
import Link from "next/link";
import { headers } from "next/headers";

export const metadata = { title: "CabPrime Admin" };

function NavLink({ href, label }: { href: string; label: string }) {
  const h = headers();
  const path = h.get("x-matched-path") || h.get("x-invoke-path") || "";
  const active = path === href || (href !== "/" && path.startsWith(href));
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`px-2 py-1 text-sm transition ${
        active ? "text-white underline" : "text-slate-300 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="border-b border-white/10 bg-white/5 backdrop-blur">
          <div className="container flex h-14 items-center justify-between">
            <div className="text-lg font-semibold tracking-tight">
              CabPrime <span className="text-indigo-400">Admin</span>
            </div>
            <nav className="flex items-center gap-4">
              <NavLink href="/" label="Dashboard" />
              <NavLink href="/inquiries" label="Inquiries" /> {/* New Link */}
              <NavLink href="/cities" label="Cities" />
              <NavLink href="/cabs" label="Cabs" />
              <NavLink href="/pricing" label="Pricing" />
              <NavLink href="/settings" label="Settings" />
            </nav>
          </div>
        </div>
        <main className="container py-8">{children}</main>
      </body>
    </html>
  );
}