'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface City {
  id: string;
  name: string;
  state: string;
  active: boolean;
  isAirport: boolean;
}

interface OneWayFormProps {
  cities: City[];
}

export default function OneWayForm({ cities }: OneWayFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    startDate: '',
    startTime: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fromCity = cities.find(c => c.id === formData.from);
    const toCity = cities.find(c => c.id === formData.to);

    // Check if route exists in our database
    const routeExists = await checkRouteAvailability(formData.from, formData.to);
    
    if (routeExists) {
      // Redirect to results page
      const params = new URLSearchParams({
        tripType: 'ONE_WAY',
        from: formData.from,
        to: formData.to,
        startDate: formData.startDate,
        startTime: formData.startTime,
      });
      router.push(`/results?${params.toString()}`);
    } else {
      // Redirect to inquiry page
      const params = new URLSearchParams({
        tripType: 'ONE_WAY',
        fromLocation: `${fromCity?.name}, ${fromCity?.state}` || 'Unknown',
        toLocation: `${toCity?.name}, ${toCity?.state}` || 'Unknown',
        startDate: formData.startDate,
        startTime: formData.startTime,
      });
      router.push(`/inquiry?${params.toString()}`);
    }
  };

  const checkRouteAvailability = async (fromCityId: string, toCityId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/check-route?from=${fromCityId}&to=${toCityId}`);
      const data = await response.json();
      return data.available;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* From City */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            From
          </label>
          <select
            value={formData.from}
            onChange={(e) => handleInputChange('from', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select pickup city</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}, {city.state}
              </option>
            ))}
          </select>
        </div>

        {/* To City */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            To
          </label>
          <select
            value={formData.to}
            onChange={(e) => handleInputChange('to', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select destination city</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}, {city.state}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Departure Date
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Start Time */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Departure Time
          </label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => handleInputChange('startTime', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Search Cabs
        </button>
      </div>
    </form>
  );
}
