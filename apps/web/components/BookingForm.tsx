'use client';

import { useState } from 'react';
import Loader from './ui/Loader';
import InclusionsExclusions from "./InclusionsExclusions";

interface BookingFormProps {
  routeId: string;
  cabTypeId: string;
  tripType: string;
  startDate: string;
  startTime: string;
  returnDate?: string;
  returnTime?: string;
  price: number;
  isRecommended?: boolean;
}

export default function BookingForm({
  routeId,
  cabTypeId,
  tripType,
  startDate,
  startTime,
  returnDate,
  returnTime,
  price,
  isRecommended
}: BookingFormProps) {
  const [loading, setLoading] = useState(false);

  return (
    <>
      {loading && <Loader text="Initiating booking..." />}
      
      <form 
        action="/api/booking" 
        method="POST" 
        className="space-y-2"
        onSubmit={() => setLoading(true)} // Trigger loader on submit
      >
        <input type="hidden" name="routeId" value={routeId} />
        <input type="hidden" name="cabTypeId" value={cabTypeId} />
        <input type="hidden" name="tripType" value={tripType} />
        <input type="hidden" name="startDate" value={startDate} />
        <input type="hidden" name="startTime" value={startTime} />
        {returnDate && <input type="hidden" name="returnDate" value={returnDate} />}
        {returnTime && <input type="hidden" name="returnTime" value={returnTime} />}
        <input type="hidden" name="price" value={price} />
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-8 py-3 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 ${
            isRecommended
              ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
          }`}
        >
          {isRecommended ? 'Book Popular Choice' : 'Book Now'}
        </button>
        <div className="text-xs text-gray-500">
          Free cancellation • Instant confirmation
        </div>
      </form>

      <InclusionsExclusions />
    </>
  );
}