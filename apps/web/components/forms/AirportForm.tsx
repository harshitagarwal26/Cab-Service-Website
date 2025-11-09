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

interface AirportFormProps {
  cities: City[];
}

export default function AirportForm({ cities }: AirportFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    transferType: 'TO_AIRPORT', // TO_AIRPORT or FROM_AIRPORT
    airport: '',
    city: '',
    date: '',
    time: '',
    pickupAddress: '',
    flightNumber: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For airport transfers, always redirect to inquiry page for now
    const airportCity = cities.find(c => c.id === formData.airport);
    const city = cities.find(c => c.id === formData.city);
    
    const params = new URLSearchParams({
      tripType: 'AIRPORT',
      transferType: formData.transferType,
      fromLocation: formData.transferType === 'TO_AIRPORT' ? 
        (`${city?.name}, ${city?.state}` || formData.city) : 
        (`${airportCity?.name}, ${airportCity?.state}` || 'Airport'),
      toLocation: formData.transferType === 'TO_AIRPORT' ? 
        (`${airportCity?.name}, ${airportCity?.state}` || 'Airport') : 
        (`${city?.name}, ${city?.state}` || formData.city),
      startDate: formData.date,
      startTime: formData.time,
      pickupAddress: formData.pickupAddress,
      flightNumber: formData.flightNumber,
    });
    router.push(`/inquiry?${params.toString()}`);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const airportCities = cities.filter(city => city.isAirport);
  const regularCities = cities.filter(city => !city.isAirport);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transfer Type */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Transfer Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="relative">
            <input
              type="radio"
              value="TO_AIRPORT"
              checked={formData.transferType === 'TO_AIRPORT'}
              onChange={(e) => handleInputChange('transferType', e.target.value)}
              className="sr-only"
            />
            <div className={`p-4 border rounded-lg cursor-pointer transition-all ${
              formData.transferType === 'TO_AIRPORT'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-blue-300'
            }`}>
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <div>
                  <div className="font-medium">To Airport</div>
                  <div className="text-sm text-gray-500">City to Airport</div>
                </div>
              </div>
            </div>
          </label>

          <label className="relative">
            <input
              type="radio"
              value="FROM_AIRPORT"
              checked={formData.transferType === 'FROM_AIRPORT'}
              onChange={(e) => handleInputChange('transferType', e.target.value)}
              className="sr-only"
            />
            <div className={`p-4 border rounded-lg cursor-pointer transition-all ${
              formData.transferType === 'FROM_AIRPORT'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-blue-300'
            }`}>
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div>
                  <div className="font-medium">From Airport</div>
                  <div className="text-sm text-gray-500">Airport to City</div>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Airport */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Airport
          </label>
          <select
            value={formData.airport}
            onChange={(e) => handleInputChange('airport', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select airport</option>
            {airportCities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}, {city.state}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            City/Location
          </label>
          <select
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select city</option>
            {regularCities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}, {city.state}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Time */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {formData.transferType === 'TO_AIRPORT' ? 'Pickup Time' : 'Flight Landing Time'}
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Flight Number */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Flight Number (Optional)
          </label>
          <input
            type="text"
            value={formData.flightNumber}
            onChange={(e) => handleInputChange('flightNumber', e.target.value)}
            placeholder="e.g., AI 234"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Pickup Address */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {formData.transferType === 'TO_AIRPORT' ? 'Pickup Address' : 'Drop Address'}
          </label>
          <input
            type="text"
            value={formData.pickupAddress}
            onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
            placeholder="Enter address or landmark"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              Airport transfers are currently available on request. We'll contact you shortly with pricing and availability.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Request Quote
        </button>
      </div>
    </form>
  );
}
