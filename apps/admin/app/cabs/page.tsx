'use client';

import { useState, useEffect } from 'react';

interface CabType {
  id: string;
  name: string;
  seats: number;
  luggage: number;
  active: boolean;
}

export default function CabsPage() {
  const [cabs, setCabs] = useState<CabType[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    seats: '4',
    luggage: '2',
    active: true
  });

  useEffect(() => {
    fetchCabs();
  }, []);

  const fetchCabs = async () => {
    try {
      const res = await fetch('/api/cab-types');
      if (!res.ok) return;
      const data = await res.json();
      setCabs(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;
      
      const res = await fetch('/api/cab-types', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        resetForm();
        fetchCabs();
      } else {
        const text = await res.text();
        try {
          const err = JSON.parse(text);
          // Show specific details if available
          alert(err.details || err.error || 'Operation failed');
        } catch {
          alert(text || 'Operation failed');
        }
      }
    } catch (error) {
      alert('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cab: CabType) => {
    setFormData({
      name: cab.name,
      seats: cab.seats.toString(),
      luggage: cab.luggage.toString(),
      active: cab.active
    });
    setEditingId(cab.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cab type?')) return;
    try {
      const res = await fetch(`/api/cab-types?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCabs();
      } else {
        const text = await res.text();
        try {
          const err = JSON.parse(text);
          alert(err.error || 'Delete failed');
        } catch {
          alert('Delete failed');
        }
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', seats: '4', luggage: '2', active: true });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Manage Cab Types</h1>

      <div className="card bg-white/5 border-white/10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label mb-1">Category Name</label>
              <input 
                className="input bg-black/20 border-white/10 text-white focus:border-indigo-500"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Sedan"
                required 
              />
            </div>
            <div>
              <label className="label mb-1">Seats</label>
              <input 
                type="number"
                className="input bg-black/20 border-white/10 text-white focus:border-indigo-500"
                value={formData.seats}
                onChange={e => setFormData({...formData, seats: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className="label mb-1">Luggage Capacity</label>
              <input 
                type="number"
                className="input bg-black/20 border-white/10 text-white focus:border-indigo-500"
                value={formData.luggage}
                onChange={e => setFormData({...formData, luggage: e.target.value})}
                required 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.active}
                onChange={e => setFormData({...formData, active: e.target.checked})}
                className="rounded border-white/20 bg-white/5 text-indigo-500"
              />
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3">
            {editingId && (
              <button type="button" onClick={resetForm} className="btn btn-ghost">
                Cancel
              </button>
            )}
            <button disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : editingId ? 'Update Cab' : 'Add Cab'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cabs.map(cab => (
          <div key={cab.id} className="card bg-white/5 border-white/10 hover:border-indigo-500/30 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium text-lg text-white">{cab.name}</h3>
                <div className="flex gap-3 text-sm text-slate-400 mt-1">
                  <span>💺 {cab.seats} Seats</span>
                  <span>wq {cab.luggage} Bags</span>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full mt-2 ${cab.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </div>
            
            <div className="flex justify-end gap-2 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(cab)} className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-slate-200">
                Edit
              </button>
              <button onClick={() => handleDelete(cab.id)} className="text-xs px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}