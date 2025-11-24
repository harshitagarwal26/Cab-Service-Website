'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CitySearchDropdown from './CitySearchDropdown';
import Loader from '../ui/Loader';

interface City {
  id: string;
  name: string;
  state: string;
  isAirport: boolean;
  active: boolean;
}

interface OneWayFormProps {
  cities: City[];
}

const POPULAR_CITY_IDS = [
  '1', // Mumbai
  '2', // Delhi
  '3', // Bangalore
  '4', // Chennai
  '5', // Kolkata
];

export default function OneWayForm({ cities }: OneWayFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    startDate: '',
    startTime: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Start loading immediately
    
    const fromCity = cities.find(c => c.id === formData.from);
    // const toCity = cities.find(c => c.id === formData.to);

    try {
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
          toLocation: `${cities.find(c => c.id === formData.to)?.name}` || 'Unknown', // fixed to access name directly
          startDate: formData.startDate,
          startTime: formData.startTime,
        });
        router.push(`/inquiry?${params.toString()}`);
      }
    } catch (error) {
      console.error(error);
      setLoading(false); // Stop loading on error
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

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {loading && <Loader text="Searching for best cabs..." />}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* From City */}
          <div>
            <CitySearchDropdown
              cities={cities}
              popularCityIds={POPULAR_CITY_IDS}
              label="From"
              selectedCityId={formData.from}
              onChange={value => handleChange('from', value)}
            />
          </div>

          {/* To City */}
          <div>
            <CitySearchDropdown
              cities={cities}
              popularCityIds={POPULAR_CITY_IDS}
              label="To"
              selectedCityId={formData.to}
              onChange={value => handleChange('to', value)}
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Departure Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={e => handleChange('startDate', e.target.value)}
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
              onChange={e => handleChange('startTime', e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            Search Cabs
          </button>
        </div>
      </form>
    </>
  );
}