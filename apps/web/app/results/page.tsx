import { Suspense } from 'react';
import { prisma } from '@cab/db/src/client';
import { notFound, redirect } from 'next/navigation';

interface SearchParams {
  tripType?: string;
  from?: string;
  to?: string;
  startDate?: string;
  startTime?: string;
  returnDate?: string;
  returnTime?: string;
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { tripType, from, to, startDate, startTime, returnDate, returnTime } = searchParams;

  if (!tripType || !from || !to || !startDate || !startTime) {
    notFound();
  }

  // Get route with pricing
  const route = await prisma.cityRoute.findUnique({
    where: {
      fromCityId_toCityId: {
        fromCityId: from,
        toCityId: to,
      },
    },
    include: {
      fromCity: true,
      toCity: true,
      routePricing: {
        where: {
          tripType,
          active: true,
        },
        include: {
          cabType: true,
        },
      },
    },
  });

  if (!route || route.routePricing.length === 0) {
    // Redirect to inquiry page if no pricing available
    const params = new URLSearchParams(searchParams as Record<string, string>);
    redirect(`/inquiry?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Available Cabs
          </h1>
          <p className="text-gray-600">
            {route.fromCity.name}, {route.fromCity.state} → {route.toCity.name}, {route.toCity.state}
          </p>
          <p className="text-sm text-gray-500">
            {tripType === 'ROUND_TRIP' ? 'Round Trip' : 'One Way'} • {startDate} at {startTime}
            {returnDate && ` • Return: ${returnDate} at ${returnTime}`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Distance: {route.distanceKm} km • Duration: {Math.round(route.durationMin / 60)}h {route.durationMin % 60}m
          </p>
        </div>

        <div className="grid gap-6">
          {route.routePricing.map((pricing) => (
            <div key={pricing.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    {pricing.cabType.image ? (
                      <img 
                        src={pricing.cabType.image} 
                        alt={pricing.cabType.name} 
                        className="w-12 h-12 object-contain" 
                      />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a2 2 0 012-2h2a2 2 0 012 2v6a3 3 0 01-3 3z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{pricing.cabType.name}</h3>
                    <p className="text-sm text-gray-600">
                      {pricing.cabType.seats > 0 && `${pricing.cabType.seats} seats`}
                      {pricing.cabType.seats > 0 && pricing.cabType.luggage > 0 && ' • '}
                      {pricing.cabType.luggage > 0 && `${pricing.cabType.luggage} luggage`}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {pricing.cabType.features && JSON.parse(pricing.cabType.features).map((feature: string, index: number) => (
                        <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">₹{pricing.price.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">All inclusive</p>
                  <form action="/api/booking" method="POST" className="mt-3">
                    <input type="hidden" name="routeId" value={route.id} />
                    <input type="hidden" name="cabTypeId" value={pricing.cabTypeId} />
                    <input type="hidden" name="tripType" value={tripType} />
                    <input type="hidden" name="startDate" value={startDate} />
                    <input type="hidden" name="startTime" value={startTime} />
                    <input type="hidden" name="returnDate" value={returnDate} />
                    <input type="hidden" name="returnTime" value={returnTime} />
                    <input type="hidden" name="price" value={pricing.price} />
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Book Now
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}

          {/* Custom Option */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-dashed border-purple-300 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Custom Requirements</h3>
                  <p className="text-sm text-gray-600">
                    Need something specific? Let us customize your ride.
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Flexible</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Customizable</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-medium text-gray-600">Price on Request</div>
                <p className="text-sm text-gray-500">Based on requirements</p>
                <form action="/custom-inquiry" method="GET" className="mt-3">
                  <input type="hidden" name="from" value={from} />
                  <input type="hidden" name="to" value={to} />
                  <input type="hidden" name="tripType" value={tripType} />
                  <input type="hidden" name="startDate" value={startDate} />
                  <input type="hidden" name="startTime" value={startTime} />
                  <input type="hidden" name="returnDate" value={returnDate} />
                  <input type="hidden" name="returnTime" value={returnTime} />
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Get Custom Quote
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
