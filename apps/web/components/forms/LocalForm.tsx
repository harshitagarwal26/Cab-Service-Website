'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LocalForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    city: '',
    startDate: '',
    startTime: '',
    duration: '4', // 4 hours, 8 hours, 12 hours
    pickupAddress: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For local rides, always redirect to inquiry page for now
    const params = new URLSearchParams({
      tripType: 'LOCAL',
      fromLocation: formData.city,
      toLocation: formData.city,
      startDate: formData.startDate,
      startTime: formData.startTime,
      duration: formData.duration,
      pickupAddress: formData.pickupAddress,
    });
    router.push(`/inquiry?${params.toString()}`);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const durationOptions = [
    { value: '4', label: '4 Hours' },
    { value: '8', label: '8 Hours' },
    { value: '12', label: '12 Hours' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* City */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Enter city name"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Duration
          </label>
          <select
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Date
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
            Start Time
          </label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => handleInputChange('startTime', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Pickup Address */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Pickup Address
          </label>
          <textarea
            value={formData.pickupAddress}
            onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
            placeholder="Enter pickup address or landmark"
            rows={3}
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
              Local rides are currently available on request. We'll contact you shortly with pricing and availability.
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
