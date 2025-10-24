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
        orderBy: {
          price: 'asc',
        },
      },
    },
  });

  if (!route || route.routePricing.length === 0) {
    // Redirect to inquiry page if no pricing available
    const params = new URLSearchParams(searchParams as Record<string, string>);
    redirect(`/inquiry?${params.toString()}`);
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Choose Your Ride
              </h1>
              <div className="flex items-center text-lg text-gray-700">
                <span className="font-semibold">{route.fromCity.name}</span>
                <svg className="w-5 h-5 mx-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="font-semibold">{route.toCity.name}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                {tripType === 'ROUND_TRIP' ? 'Round Trip' : 'One Way'}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {formatDate(startDate)} at {startTime}
                {returnDate && ` • Return: ${formatDate(returnDate)} at ${returnTime}`}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{route.distanceKm} km</span>
            </div>
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{Math.floor(route.durationMin / 60)}h {route.durationMin % 60}m</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Trust Indicators */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-gray-900">All Inclusive Pricing</div>
              <div className="text-xs text-gray-500">No Hidden Charges</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-gray-900">Safe & Secure</div>
              <div className="text-xs text-gray-500">Verified Drivers</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-gray-900">24/7 Support</div>
              <div className="text-xs text-gray-500">Always Available</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-gray-900">Instant Booking</div>
              <div className="text-xs text-gray-500">Quick Confirmation</div>
            </div>
          </div>
        </div>

        {/* Cab Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Cabs ({route.routePricing.length} options)</h2>
          
          {route.routePricing.map((pricing, index) => {
            const features = pricing.cabType.features ? JSON.parse(pricing.cabType.features) : [];
            const isRecommended = index === 1; // Mark second option as recommended
            
            return (
              <div key={pricing.id} className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-lg hover:border-orange-200 ${isRecommended ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-100'}`}>
                {isRecommended && (
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-t-xl">
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium">Most Popular Choice</span>
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Car Info */}
                    <div className="flex items-start space-x-4 flex-grow">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        {pricing.cabType.image ? (
                          <img 
                            src={pricing.cabType.image} 
                            alt={pricing.cabType.name} 
                            className="w-16 h-16 object-contain" 
                          />
                        ) : (
                          <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a2 2 0 012-2h2a2 2 0 012 2v6a3 3 0 01-3 3z" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{pricing.cabType.name}</h3>
                          {isRecommended && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Recommended
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          {pricing.cabType.seats > 0 && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {pricing.cabType.seats} seats
                            </div>
                          )}
                          {pricing.cabType.luggage > 0 && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {pricing.cabType.luggage} bags
                            </div>
                          )}
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            AC
                          </div>
                        </div>
                        
                        {features.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {features.slice(0, 4).map((feature: string, featureIndex: number) => (
                              <span key={featureIndex} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {feature}
                              </span>
                            ))}
                            {features.length > 4 && (
                              <span className="text-xs text-gray-500">+{features.length - 4} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Pricing & Booking */}
                    <div className="text-center lg:text-right flex-shrink-0">
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-gray-900">₹{pricing.price.toLocaleString()}</div>
                        <div className="text-sm text-green-600 font-medium">All inclusive</div>
                        <div className="text-xs text-gray-500">Fuel • Tolls • Driver allowance</div>
                      </div>
                      
                      <form action="/api/booking" method="POST" className="space-y-2">
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
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Custom Requirements Card */}
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-purple-300 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start space-x-4 flex-grow">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Need Something Special?</h3>
                  <p className="text-gray-600 mb-3">
                    Looking for luxury cars, special equipment, or have specific requirements? 
                    Let us customize the perfect ride for your journey.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Luxury vehicles
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Custom timing
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Special equipment
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-center lg:text-right flex-shrink-0">
                <div className="mb-4">
                  <div className="text-2xl font-bold text-purple-600">Custom Quote</div>
                  <div className="text-sm text-purple-500 font-medium">Tailored pricing</div>
                  <div className="text-xs text-gray-500">Based on your requirements</div>
                </div>
                
                <form action="/custom-inquiry" method="GET">
                  <input type="hidden" name="from" value={from} />
                  <input type="hidden" name="to" value={to} />
                  <input type="hidden" name="tripType" value={tripType} />
                  <input type="hidden" name="startDate" value={startDate} />
                  <input type="hidden" name="startTime" value={startTime} />
                  <input type="hidden" name="returnDate" value={returnDate} />
                  <input type="hidden" name="returnTime" value={returnTime} />
                  
                  <button 
                    type="submit"
                    className="w-full px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Get Custom Quote
                  </button>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Expert consultation • Free quote
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Choose Our Cab Service?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Transparent Pricing</h4>
                <p className="text-sm text-gray-600">All taxes, tolls, and driver charges included. No surprise fees.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Verified Drivers</h4>
                <p className="text-sm text-gray-600">Professional, licensed drivers with excellent track records.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">24/7 Support</h4>
                <p className="text-sm text-gray-600">Round-the-clock customer support for your peace of mind.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}