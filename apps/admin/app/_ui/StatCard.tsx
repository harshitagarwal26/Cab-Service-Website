export function StatCard({
  label,
  value,
  icon
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="card card-hover group relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(800px circle at var(--x,50%) var(--y,50%), rgba(99,102,241,0.12), transparent 40%)"
        }}
      />
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
          {icon}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
        </div>
      </div>
    </div>
  );
}
