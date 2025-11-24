import { prisma } from '@cab/db/src/client';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import BookingForm from '../../components/BookingForm';

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

  // Fetch Custom Cab Type if needed
  const customCab = await prisma.cabType.findUnique({
    where: { name: 'Custom' }
  });

  if (!route) {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    redirect(`/inquiry?${params.toString()}`);
  }

  // Redirect to inquiry if no active pricing found
  if (route.routePricing.length === 0 && !customCab) {
    const params = new URLSearchParams({
      tripType: tripType,
      fromLocation: `${route.fromCity.name}, ${route.fromCity.state}`,
      toLocation: `${route.toCity.name}, ${route.toCity.state}`,
      startDate: startDate,
      startTime: startTime,
      ...(returnDate ? { returnDate } : {}),
      ...(returnTime ? { returnTime } : {}),
    });
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

  const inquiryParams = new URLSearchParams({
    tripType: tripType,
    fromLocation: `${route.fromCity.name}, ${route.fromCity.state}`,
    toLocation: `${route.toCity.name}, ${route.toCity.state}`,
    startDate: startDate,
    startTime: startTime,
    ...(returnDate ? { returnDate } : {}),
    ...(returnTime ? { returnTime } : {}),
    requirements: "I am interested in a Custom/Special vehicle."
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center text-gray-900 mb-1">
                <span className="font-bold text-lg md:text-2xl">{route.fromCity.name}</span>
                <svg className="w-5 h-5 mx-3 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="font-bold text-lg md:text-2xl">{route.toCity.name}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(startDate)}
                </span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {route.distanceKm} km
                </span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ~{Math.floor(route.durationMin / 60)}h {route.durationMin % 60}m
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="bg-orange-100 text-orange-800 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap">
                {tripType === 'ROUND_TRIP' ? 'Round Trip' : 'One Way'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Trust Indicators */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8 hidden md:block">
          <div className="grid grid-cols-4 gap-6">
            {[
              { color: 'green', title: 'Verified Drivers', desc: 'Professional & Trained', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { color: 'blue', title: 'On-Time Service', desc: 'Punctuality Guaranteed', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
              { color: 'purple', title: 'Transparent Billing', desc: 'No Hidden Charges', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
              { color: 'orange', title: '24/7 Support', desc: 'Always Here to Help', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <div className={`flex-shrink-0 text-${item.color}-500`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cab Selection */}
        <div className="space-y-6 max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900">
            Available Cabs ({route.routePricing.length + (customCab ? 1 : 0)} options)
          </h2>
          
          {route.routePricing.map((pricing, index) => {
            const features = pricing.cabType.features ? JSON.parse(pricing.cabType.features) : [];
            const isRecommended = index === 1; // Assuming 2nd option is usually the best value (e.g. Sedan)

            return (
              <div key={pricing.id} className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-lg ${isRecommended ? 'border-orange-300 ring-1 ring-orange-100 relative overflow-hidden' : 'border-gray-100'}`}> 
                {isRecommended && (
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 absolute top-0 right-0 rounded-bl-xl shadow-sm z-10">
                    POPULAR
                  </div>
                )}

                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Image & Basic Info */}
                    <div className="flex-1 flex gap-4">
                      <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center p-2 flex-shrink-0">
                        {pricing.cabType.image ? (
                          <img src={pricing.cabType.image} alt={pricing.cabType.name} className="w-full h-full object-contain" />
                        ) : (
                          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a2 2 0 012-2h2a2 2 0 012 2v6a3 3 0 01-3 3z" />
                          </svg>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{pricing.cabType.name}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                          <span className="flex items-center"><i className="fas fa-chair mr-1.5 opacity-60"></i>{pricing.cabType.seats} seats</span>
                          <span className="flex items-center"><i className="fas fa-suitcase mr-1.5 opacity-60"></i>{pricing.cabType.luggage} bags</span>
                          <span className="flex items-center text-green-600"><i className="fas fa-snowflake mr-1.5"></i>AC</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {features.slice(0, 3).map((feature: string, idx: number) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                      <div className="text-right lg:text-right mb-4 flex flex-row lg:flex-col justify-between items-center lg:items-end">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Total Fare</p>
                          <div className="flex items-baseline justify-end gap-1">
                            <span className="text-2xl font-bold text-gray-900">₹{pricing.price.toLocaleString('en-IN')}</span>
                          </div>
                          <p className="text-xs text-green-600 font-medium">Inclusive of GST</p>
                        </div>
                      </div>

                      <BookingForm
                        routeId={route.id}
                        cabTypeId={pricing.cabTypeId}
                        tripType={tripType}
                        startDate={startDate}
                        startTime={startTime}
                        returnDate={returnDate}
                        returnTime={returnTime}
                        price={pricing.price}
                        isRecommended={isRecommended}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Custom Cab Option */}
          {customCab && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 opacity-90 hover:opacity-100 transition-opacity">
               <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                   <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                     <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                     </svg>
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-gray-900">Need a Special Vehicle?</h3>
                     <p className="text-sm text-gray-600">Bus, Tempo Traveller, or Luxury Cars available on request.</p>
                   </div>
                 </div>
                 <Link 
                   href={`/inquiry?${inquiryParams.toString()}`}
                   className="whitespace-nowrap px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                 >
                   Request Callback
                 </Link>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}