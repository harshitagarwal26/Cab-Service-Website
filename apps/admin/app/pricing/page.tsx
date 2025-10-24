'use client';

import { useState, useEffect } from 'react';

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

export default function PricingPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [cabTypes, setCabTypes] = useState<CabType[]>([]);
  const [routePricings, setRoutePricings] = useState<RoutePricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  // Load initial data when component mounts
  useEffect(() => {
    fetchCabTypes();
    fetchRoutePricings();
    fetchCities(); // Load all cities immediately
  }, []);

  // Handle search functionality
  useEffect(() => {
    if (searchCity.trim()) {
      fetchCities(searchCity);
    } else {
      // If search is cleared, reload all cities
      fetchCities();
    }
  }, [searchCity]);

  const fetchCities = async (search = '') => {
    try {
      setError(null);
      const response = await fetch(`/api/cities?search=${encodeURIComponent(search)}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Cities response:', data);
      console.log('Cities count:', data.data?.length || 0);
      setCities(data.data || []);
    } catch (error: any) {
      console.error('Error fetching cities:', error);
      setError(`Failed to fetch cities: ${error.message}`);
    }
  };

  const fetchCabTypes = async () => {
    try {
      setError(null);
      console.log('Fetching cab types from /api/cab-types');
      const response = await fetch('/api/cab-types');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Cab types response:', data);
      setCabTypes(data.data || []);
    } catch (error: any) {
      console.error('Error fetching cab types:', error);
      setError(`Failed to fetch cab types: ${error.message}`);
    }
  };

  const fetchRoutePricings = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/route-pricing');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Route pricings response:', data);
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
            active: formData.active 
          }
        : {
            ...formData,
            price: parseInt(formData.price),
            distanceKm: formData.distanceKm ? parseInt(formData.distanceKm) : undefined,
            durationMin: formData.durationMin ? parseInt(formData.durationMin) : undefined,
          };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        resetForm();
        fetchRoutePricings();
        alert(editingId ? 'Route pricing updated!' : 'Route pricing created!');
      } else {
        throw new Error('Failed to save route pricing');
      }
    } catch (error) {
      console.error('Error saving route pricing:', error);
      alert('Error saving route pricing');
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
      distanceKm: rp.route.distanceKm.toString(),
      durationMin: rp.route.durationMin.toString(),
      active: rp.active,
    });
    setEditingId(rp.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route pricing?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/route-pricing?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchRoutePricings();
        alert('Route pricing deleted!');
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

  const selectedFromCity = cities.find(c => c.id === formData.fromCityId);
  const selectedToCity = cities.find(c => c.id === formData.toCityId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Route Pricing Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create and manage pricing for specific routes and car categories.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Debug Info */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
        <strong>Debug:</strong> Found {cabTypes.length} cab types, {cities.length} cities, {routePricings.length} route pricings
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          {editingId ? 'Edit Route Pricing' : 'Add Route Pricing'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Trip Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Trip Type *
              </label>
              <select
                value={formData.tripType}
                onChange={(e) => setFormData(prev => ({ ...prev, tripType: e.target.value }))}
                required
                disabled={!!editingId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="ONE_WAY">One Way</option>
                <option value="ROUND_TRIP">Round Trip</option>
              </select>
            </div>

            {/* Cab Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Car Category *
              </label>
              <select
                value={formData.cabTypeId}
                onChange={(e) => setFormData(prev => ({ ...prev, cabTypeId: e.target.value }))}
                required
                disabled={!!editingId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select car category</option>
                {cabTypes.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.name} ({ct.seats} seats, {ct.luggage} luggage)
                  </option>
                ))}
              </select>
            </div>

            {/* City Search */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Search Cities (optional - cities are pre-loaded)
              </label>
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Type to filter cities in dropdowns below..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {cities.length > 0 && (
                <p className="text-sm text-green-600">
                  ✓ {cities.length} cities available in dropdowns below
                </p>
              )}
            </div>

            {/* From City */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Source City *
              </label>
              <select
                value={formData.fromCityId}
                onChange={(e) => setFormData(prev => ({ ...prev, fromCityId: e.target.value }))}
                required
                disabled={!!editingId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select source city</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.state}
                  </option>
                ))}
              </select>
              {selectedFromCity && (
                <p className="text-sm text-gray-600">
                  Selected: {selectedFromCity.name}, {selectedFromCity.state}
                </p>
              )}
            </div>

            {/* To City */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Destination City *
              </label>
              <select
                value={formData.toCityId}
                onChange={(e) => setFormData(prev => ({ ...prev, toCityId: e.target.value }))}
                required
                disabled={!!editingId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select destination city</option>
                {cities.filter(c => c.id !== formData.fromCityId).map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.state}
                  </option>
                ))}
              </select>
              {selectedToCity && (
                <p className="text-sm text-gray-600">
                  Selected: {selectedToCity.name}, {selectedToCity.state}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Price (₹) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
                placeholder="Enter price"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Distance (Optional) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Distance (km) - Optional
              </label>
              <input
                type="number"
                min="1"
                value={formData.distanceKm}
                onChange={(e) => setFormData(prev => ({ ...prev, distanceKm: e.target.value }))}
                placeholder="Enter distance"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Duration (Optional) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Duration (minutes) - Optional
              </label>
              <input
                type="number"
                min="1"
                value={formData.durationMin}
                onChange={(e) => setFormData(prev => ({ ...prev, durationMin: e.target.value }))}
                placeholder="Enter duration"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>

      {/* Route Pricing List */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Existing Route Pricing</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Car Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routePricings.map((rp) => (
                <tr key={rp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {rp.route.fromCity.name} → {rp.route.toCity.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {rp.tripType.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {rp.cabType.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ₹{rp.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {rp.route.distanceKm > 0 ? `${rp.route.distanceKm} km` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      rp.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {rp.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(rp)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rp.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {routePricings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No route pricing found. Create one above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
