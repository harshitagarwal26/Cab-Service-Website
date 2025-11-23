'use client';

import { useState, useEffect } from 'react';

interface City {
  id: string;
  name: string;
  state: string;
  active: boolean;
  isAirport: boolean;
}

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    isAirport: false,
    active: true
  });

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async (q = '') => {
    try {
      const res = await fetch(`/api/cities?search=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const data = await res.json();
      setCities(data.data || []);
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
      
      const res = await fetch('/api/cities', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        // Success Feedback
        alert(editingId ? `City "${formData.name}" updated successfully!` : `City "${formData.name}" added successfully!`);
        
        resetForm();
        fetchCities();
      } else {
        const text = await res.text();
        try {
          const err = JSON.parse(text);
          alert(err.details || err.error || 'Operation failed');
        } catch {
          alert(text || 'Operation failed');
        }
      }
    } catch (error) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (city: City) => {
    setFormData({
      name: city.name,
      state: city.state,
      isAirport: city.isAirport,
      active: city.active
    });
    setEditingId(city.id);
    // Optional: Scroll to top for better UX on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (city: City) => {
    if (!confirm(`Are you sure you want to delete ${city.name}?`)) return;
    try {
      const res = await fetch(`/api/cities?id=${city.id}`, { method: 'DELETE' });
      if (res.ok) {
        alert(`City "${city.name}" deleted successfully!`);
        fetchCities();
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
    setFormData({ name: '', state: '', isAirport: false, active: true });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Manage Cities</h1>

      <div className="card bg-white/5 border-white/10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label mb-1">City Name</label>
              <input 
                className="input bg-black/20 border-white/10 text-white focus:border-indigo-500"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Mumbai"
                required 
              />
            </div>
            <div>
              <label className="label mb-1">State</label>
              <input 
                className="input bg-black/20 border-white/10 text-white focus:border-indigo-500"
                value={formData.state}
                onChange={e => setFormData({...formData, state: e.target.value})}
                placeholder="e.g. Maharashtra"
                required 
              />
            </div>
          </div>
          
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.isAirport}
                onChange={e => setFormData({...formData, isAirport: e.target.checked})}
                className="rounded border-white/20 bg-white/5 text-indigo-500"
              />
              Is Airport Location
            </label>
            
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
              {loading ? 'Saving...' : editingId ? 'Update City' : 'Add City'}
            </button>
          </div>
        </form>
      </div>

      <input 
        className="input max-w-md bg-white/5 border-white/10 text-white placeholder:text-slate-500"
        placeholder="Search cities..."
        value={search}
        onChange={e => { setSearch(e.target.value); fetchCities(e.target.value); }}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map(city => (
          <div key={city.id} className="card bg-white/5 border-white/10 hover:border-indigo-500/30 transition-colors group">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-lg text-white">
                  {city.name}
                  {city.isAirport && <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Airport</span>}
                </h3>
                <p className="text-sm text-slate-400">{city.state}</p>
              </div>
              <div className={`w-2 h-2 rounded-full mt-2 ${city.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </div>
            
            <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(city)} className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-slate-200">
                Edit
              </button>
              <button onClick={() => handleDelete(city)} className="text-xs px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}