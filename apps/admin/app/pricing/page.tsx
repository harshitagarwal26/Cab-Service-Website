'use client';

import { useState, useEffect, useRef } from 'react';

interface City {
  id: string;
  name: string;
  state: string;
}

interface CabType {
  id: string;
  name: string;
  seats: number;
  luggage: number;
}

interface RoutePricing {
  id: string;
  price: number;
  active: boolean;
  tripType: string;
  createdAt: string;
  cabType: CabType;
  route: {
    fromCity: City;
    toCity: City;
    distanceKm: number;
    durationMin: number;
  };
}

// Simple Searchable Dropdown Component
function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder 
}: { 
  options: City[], 
  value: string, 
  onChange: (val: string) => void, 
  placeholder: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => 
    option.name.toLowerCase().includes(search.toLowerCase()) ||
    option.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 cursor-pointer flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? `${selectedOption.name}, ${selectedOption.state}` : placeholder}
        </span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2 sticky top-0 bg-white border-b">
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500"
              placeholder="Search city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-gray-900 ${option.id === value ? 'bg-blue-50 font-medium' : ''}`}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                  setSearch('');
                }}
              >
                {option.name}, {option.state}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 text-sm">No cities found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PricingPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [cabTypes, setCabTypes] = useState<CabType[]>([]);
  const [routePricings, setRoutePricings] = useState<RoutePricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters for the list view
  const [filterFromCity, setFilterFromCity] = useState('');
  const [filterToCity, setFilterToCity] = useState('');
  const [showAll, setShowAll] = useState(false);

  const [formData, setFormData] = useState({
    tripType: 'ONE_WAY',
    fromCityId: '',
    toCityId: '',
    cabTypeId: '',
    price: '',
    distanceKm: '',
    durationMin: '',
    active: true,
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    fetchCabTypes();
    fetchCities();
  }, []);

  // Fetch pricings when filters change or "Show All" is toggled
  useEffect(() => {
    if (showAll || (filterFromCity && filterToCity)) {
      fetchRoutePricings();
    } else {
      setRoutePricings([]); // Clear list if filters aren't met
    }
  }, [filterFromCity, filterToCity, showAll]);

  const fetchCities = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/cities?limit=1000`); 
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setCities(data.data || []);
    } catch (error: any) {
      console.error('Error fetching cities:', error);
      setError(`Failed to fetch cities: ${error.message}`);
    }
  };

  const fetchCabTypes = async () => {
    try {
      setError(null);
      const response = await fetch('/api/cab-types');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setCabTypes(data.data || []);
    } catch (error: any) {
      console.error('Error fetching cab types:', error);
      setError(`Failed to fetch cab types: ${error.message}`);
    }
  };

  const fetchRoutePricings = async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (!showAll) {
        if (filterFromCity) params.append('fromCityId', filterFromCity);
        if (filterToCity) params.append('toCityId', filterToCity);
      }
      
      const response = await fetch(`/api/admin/route-pricing?${params.toString()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setRoutePricings(data.data || []);
    } catch (error: any) {
      console.error('Error fetching route pricings:', error);
      setError(`Failed to fetch route pricings: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = '/api/admin/route-pricing';

      const body = editingId 
        ? { 
            id: editingId, 
            price: parseInt(formData.price), 
            active: formData.active,
            distanceKm: formData.distanceKm ? parseInt(formData.distanceKm) : undefined,
            durationMin: formData.durationMin ? parseInt(formData.durationMin) : undefined,
          }
        : {
            ...formData,
            price: parseInt(formData.price),
            distanceKm: formData.distanceKm ? parseInt(formData.distanceKm) : undefined,
            durationMin: formData.durationMin ? parseInt(formData.durationMin) : undefined,
          };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        resetForm();
        // Refresh list if it matches current filters or we are showing all
        if (showAll || (filterFromCity === formData.fromCityId && filterToCity === formData.toCityId)) {
          fetchRoutePricings();
        }
        alert(editingId ? 'Route pricing updated!' : 'Route pricing created!');
      } else {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save route pricing');
      }
    } catch (error: any) {
      console.error('Error saving route pricing:', error);
      alert(error.message || 'Error saving route pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rp: RoutePricing) => {
    setFormData({
      tripType: rp.tripType,
      fromCityId: rp.route.fromCity.id,
      toCityId: rp.route.toCity.id,
      cabTypeId: rp.cabType.id,
      price: rp.price.toString(),
      distanceKm: rp.route.distanceKm?.toString() || '',
      durationMin: rp.route.durationMin?.toString() || '',
      active: rp.active,
    });
    setEditingId(rp.id);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route pricing?')) return;

    try {
      const response = await fetch(`/api/admin/route-pricing?id=${id}`, { method: 'DELETE' });

      if (response.ok) {
        fetchRoutePricings();
      } else {
        throw new Error('Failed to delete route pricing');
      }
    } catch (error) {
      console.error('Error deleting route pricing:', error);
      alert('Error deleting route pricing');
    }
  };

  const resetForm = () => {
    setFormData({
      tripType: 'ONE_WAY',
      fromCityId: '',
      toCityId: '',
      cabTypeId: '',
      price: '',
      distanceKm: '',
      durationMin: '',
      active: true,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Route Pricing Management</h1>
        <p className="mt-1 text-sm text-gray-400">
          Create and manage pricing for specific routes and car categories.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Create/Edit Form */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-100 mb-6">
          {editingId ? 'Edit Route Pricing' : 'Add Route Pricing'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Trip Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Trip Type *</label>
              <select
                value={formData.tripType}
                onChange={(e) => setFormData(prev => ({ ...prev, tripType: e.target.value }))}
                required
                disabled={!!editingId}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="ONE_WAY">One Way</option>
                <option value="ROUND_TRIP">Round Trip</option>
              </select>
            </div>

            {/* Cab Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Car Category *</label>
              <select
                value={formData.cabTypeId}
                onChange={(e) => setFormData(prev => ({ ...prev, cabTypeId: e.target.value }))}
                required
                disabled={!!editingId}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="">Select car category</option>
                {cabTypes.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.name} ({ct.seats} seats, {ct.luggage} luggage)
                  </option>
                ))}
              </select>
            </div>

            {/* From City */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Source City *</label>
              {editingId ? (
                <div className="px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed">
                  {cities.find(c => c.id === formData.fromCityId)?.name || 'Unknown'}
                </div>
              ) : (
                <SearchableSelect 
                  options={cities}
                  value={formData.fromCityId}
                  onChange={(val) => setFormData(prev => ({ ...prev, fromCityId: val }))}
                  placeholder="Select source city"
                />
              )}
            </div>

            {/* To City */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Destination City *</label>
              {editingId ? (
                <div className="px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed">
                  {cities.find(c => c.id === formData.toCityId)?.name || 'Unknown'}
                </div>
              ) : (
                <SearchableSelect 
                  options={cities}
                  value={formData.toCityId}
                  onChange={(val) => setFormData(prev => ({ ...prev, toCityId: val }))}
                  placeholder="Select destination city"
                />
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Price (₹) *</label>
              <input
                type="number"
                min="1"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
                placeholder="Enter price"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Distance */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Distance (km)</label>
              <input
                type="number"
                min="1"
                value={formData.distanceKm}
                onChange={(e) => setFormData(prev => ({ ...prev, distanceKm: e.target.value }))}
                placeholder="Enter distance"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Duration (minutes)</label>
              <input
                type="number"
                min="1"
                value={formData.durationMin}
                onChange={(e) => setFormData(prev => ({ ...prev, durationMin: e.target.value }))}
                placeholder="Enter duration"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Active Status */}
            <div className="space-y-2 pt-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 bg-gray-700"
                />
                <span className="text-sm font-medium text-gray-300">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/30"
            >
              {loading ? 'Saving...' : editingId ? 'Update Pricing' : 'Create Pricing'}
            </button>
          </div>
        </form>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-medium text-gray-100 mb-4">Search Route Pricing</h2>
          
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:flex-1 space-y-2">
              <label className="text-sm text-gray-400">Source City</label>
              <SearchableSelect 
                options={cities}
                value={filterFromCity}
                onChange={setFilterFromCity}
                placeholder="Filter by source..."
              />
            </div>
            
            <div className="w-full md:flex-1 space-y-2">
              <label className="text-sm text-gray-400">Destination City</label>
              <SearchableSelect 
                options={cities}
                value={filterToCity}
                onChange={setFilterToCity}
                placeholder="Filter by destination..."
              />
            </div>

            <div className="pb-2">
              <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                <input 
                  type="checkbox"
                  checked={showAll}
                  onChange={e => setShowAll(e.target.checked)}
                  className="rounded bg-white/10 border-white/20 text-indigo-500 focus:ring-indigo-500/50"
                />
                <span>Show All Routes</span>
              </label>
            </div>
          </div>
        </div>

        {/* List Content */}
        {(showAll || (filterFromCity && filterToCity)) ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-black/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Car</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Distance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {routePricings.map((rp) => (
                  <tr key={rp.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {rp.route.fromCity.name} → {rp.route.toCity.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {rp.tripType.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {rp.cabType.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-100">
                      ₹{rp.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {rp.route.distanceKm > 0 ? `${rp.route.distanceKm} km` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        rp.active 
                          ? 'bg-green-900/30 text-green-400 border border-green-800' 
                          : 'bg-red-900/30 text-red-400 border border-red-800'
                      }`}>
                        {rp.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex space-x-3">
                        <button onClick={() => handleEdit(rp)} className="text-indigo-400 hover:text-indigo-300 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(rp.id)} className="text-red-400 hover:text-red-300 transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {routePricings.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No route pricing found for the selected filters.
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-200 mb-1">Select Cities to View Pricing</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Choose a source and destination city above to see pricing for that specific route, or toggle "Show All Routes" to view everything.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}