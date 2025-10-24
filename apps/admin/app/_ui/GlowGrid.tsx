"use client";

export function GlowGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="grid gap-6 md:grid-cols-3"
      onMouseMove={(e) => {
        const t = e.currentTarget as HTMLElement;
        const r = t.getBoundingClientRect();
        t.style.setProperty("--x", `${e.clientX - r.left}px`);
        t.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </div>
  );
}

