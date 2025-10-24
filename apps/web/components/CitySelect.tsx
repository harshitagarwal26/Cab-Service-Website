'use client';
import { useEffect, useMemo, useState } from 'react';

type City = { id: string; name: string; state: string; };

export default function CitySelect({ name, value, onChange, cities }: {
  name: string; value?: string; onChange: (val: string) => void; cities: City[];
}) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return cities.filter(c => (c.name + ', ' + c.state).toLowerCase().includes(s)).slice(0, 20);
  }, [q, cities]);

  return (
    <div className="space-y-2">
      <input
        className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
        placeholder="Search city"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
      >
        <option value="">Select</option>
        {filtered.map(c => (
          <option key={c.id} value={c.id}>{c.name}, {c.state}</option>
        ))}
      </select>
    </div>
  );
}
