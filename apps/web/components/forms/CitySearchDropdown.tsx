'use client';

import React, { useState, useEffect, useRef } from 'react';

interface City {
  id: string;
  name: string;
  state: string;
  isAirport: boolean;
}

interface CitySearchDropdownProps {
  cities: City[];
  popularCityIds: string[];
  label: string;
  selectedCityId: string;
  onChange: (cityId: string) => void;
}

export default function CitySearchDropdown({
  cities,
  popularCityIds,
  label,
  selectedCityId,
  onChange,
}: CitySearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter only cities (exclude airports)
  const cityOptions = cities.filter(city => !city.isAirport);

  // Popular city objects in order
  const popularCities = popularCityIds
    .map(id => cityOptions.find(city => city.id === id))
    .filter((c): c is City => c !== undefined);

  // Filtered city list based on search term
  const filteredCities = cityOptions.filter(city => {
    const lower = searchTerm.toLowerCase();
    return city.name.toLowerCase().includes(lower) || city.state.toLowerCase().includes(lower);
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Selected city object
  const selectedCity = cities.find(c => c.id === selectedCityId);

  // Display string for selected city
  const displayValue = selectedCity ? `${selectedCity.name}, ${selectedCity.state}` : '';

  function handleSelectCity(cityId: string) {
    onChange(cityId);
    setIsOpen(false);
    setSearchTerm('');
  }

  function renderCity(city: City) {
    return (
      <li
        key={city.id}
        onClick={() => handleSelectCity(city.id)}
        className="cursor-pointer px-4 py-2 hover:bg-blue-600 hover:text-white rounded"
      >
        {city.name}, {city.state}
      </li>
    );
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        tabIndex={0}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(o => !o)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 cursor-pointer flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
          {displayValue || `Select ${label.toLowerCase()}`}
        </span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-72 rounded-md overflow-auto ring-1 ring-black ring-opacity-5 focus:outline-none">
          <input
            type="text"
            autoFocus
            placeholder={`Search ${label.toLowerCase()}...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none"
          />

          {searchTerm === '' && popularCities.length > 0 && (
            <div className="p-2 border-b border-gray-200">
              <div className="text-sm font-semibold text-gray-600 mb-1">Popular Cities</div>
              <ul className="space-y-1">
                {popularCities.map(renderCity)}
              </ul>
            </div>
          )}

          <ul role="listbox" className="py-2 text-gray-900">
            {filteredCities.length > 0 ? (
              filteredCities.map(renderCity)
            ) : (
              <li className="text-center py-2 text-gray-500 select-none">No matching cities.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
