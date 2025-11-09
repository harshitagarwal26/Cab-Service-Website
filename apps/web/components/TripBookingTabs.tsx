'use client';

import { useState } from 'react';
import OneWayForm from './forms/OneWayForm';
import RoundTripForm from './forms/RoundTripForm';
import LocalForm from './forms/LocalForm';
import AirportForm from './forms/AirportForm';

interface City {
  id: string;
  name: string;
  state: string;
  active: boolean;
  isAirport: boolean;
}

interface TripBookingTabsProps {
  cities: City[];
}

type TripType = 'ONE_WAY' | 'ROUND_TRIP' | 'LOCAL' | 'AIRPORT';

const tripTypes: { key: TripType; label: string; icon: React.ReactNode }[] = [
  {
    key: 'ONE_WAY',
    label: 'One Way',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    ),
  },
  {
    key: 'ROUND_TRIP',
    label: 'Round Trip',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    key: 'LOCAL',
    label: 'Local',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: 'AIRPORT',
    label: 'Airport',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
  },
];

export default function TripBookingTabs({ cities }: TripBookingTabsProps) {
  const [activeTab, setActiveTab] = useState<TripType>('ONE_WAY');

  const renderForm = () => {
    switch (activeTab) {
      case 'ONE_WAY':
        return <OneWayForm cities={cities} />;
      case 'ROUND_TRIP':
        return <RoundTripForm cities={cities} />;
      case 'LOCAL':
        return <LocalForm />;
      case 'AIRPORT':
        return <AirportForm cities={cities} />;
      default:
        return <OneWayForm cities={cities} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
        {tripTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => setActiveTab(type.key)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === type.key
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            {type.icon}
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="min-h-[400px]">
        {renderForm()}
      </div>
    </div>
  );
}
