'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PhoneInput from '../../components/ui/PhoneInput';

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Get booking details from URL params
  const tripType = searchParams.get('tripType');
  const fromCity = searchParams.get('fromCity');
  const toCity = searchParams.get('toCity');
  const startDate = searchParams.get('startDate');
  const startTime = searchParams.get('startTime');
  const returnDate = searchParams.get('returnDate');
  const returnTime = searchParams.get('returnTime');
  const price = searchParams.get('price');
  const distance = searchParams.get('distance');
  const duration = searchParams.get('duration');
  const cabTypeId = searchParams.get('cabTypeId');
  const routeId = searchParams.get('routeId');

  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    countryCode: '+91',
    email: '',
    pickupAddress: '',
    dropAddress: '',
    specialRequests: '',
    termsAccepted: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData.termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }
    
    setLoading(true);

    try {
      const bookingData = {
        routeId,
        cabTypeId,
        tripType,
        startDate,
        startTime,
        returnDate,
        returnTime,
        price: parseInt(price || '0'),
        distance: parseInt(distance || '0'),
        duration: parseInt(duration || '0'),
        name: customerData.name,
        phone: `${customerData.countryCode} ${customerData.phone}`,
        email: customerData.email,
        pickupAddress: customerData.pickupAddress,
        dropAddress: customerData.dropAddress,
        specialRequests: customerData.specialRequests,
      };

      const response = await fetch('/api/create-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/booking-confirmation?bookingId=${result.bookingId}`);
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!tripType || !fromCity || !toCity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Booking</h1>
          <p className="text-gray-600 mb-4">Missing booking information.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Complete Your Booking</h1>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">₹{parseInt(price || '0').toLocaleString()}</p>
              <p className="text-sm text-gray-600">All inclusive</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className={`flex items-center ${currentStep >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 font-medium">Trip Details</span>
                </div>
                <div className={`flex items-center ${currentStep >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 font-medium">Customer Info</span>
                </div>
                <div className={`flex items-center ${currentStep >= 3 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= 3 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    3
                  </div>
                  <span className="ml-2 font-medium">Confirmation</span>
                </div>
              </div>
            </div>

            {/* Customer Details Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Passenger Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerData.name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Mobile Number *
                    </label>
                    <PhoneInput
                      value={customerData.phone}
                      countryCode={customerData.countryCode}
                      onValueChange={(val) => setCustomerData(prev => ({ ...prev, phone: val }))}
                      onCountryCodeChange={(code) => setCustomerData(prev => ({ ...prev, countryCode: code }))}
                      required={true}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Enter email for booking updates"
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Address Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Pickup Address *
                      </label>
                      <textarea
                        required
                        value={customerData.pickupAddress}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, pickupAddress: e.target.value }))}
                        rows={3}
                        placeholder={`Enter detailed pickup address in ${fromCity?.split(',')[0]}`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Drop Address *
                      </label>
                      <textarea
                        required
                        value={customerData.dropAddress}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, dropAddress: e.target.value }))}
                        rows={3}
                        placeholder={`Enter detailed drop address in ${toCity?.split(',')[0]}`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="border-t pt-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Special Requirements (Optional)
                    </label>
                    <textarea
                      value={customerData.specialRequests}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, specialRequests: e.target.value }))}
                      rows={3}
                      placeholder="Any special requirements like child seat, wheelchair accessibility, etc."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="border-t pt-6">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={customerData.termsAccepted}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                      className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I agree to the <a href="#" className="text-orange-600 hover:text-orange-700 underline">Terms & Conditions</a> and <a href="#" className="text-orange-600 hover:text-orange-700 underline">Privacy Policy</a>. I understand that payment will be collected in cash at the time of pickup.
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Booking</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Summary</h3>
              
              {/* Route Information */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{fromCity}</p>
                    <p className="text-sm text-gray-600">{startDate} • {startTime}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 ml-4">
                  <div className="w-px h-6 bg-gray-300"></div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{toCity}</p>
                    {returnDate && (
                      <p className="text-sm text-gray-600">{returnDate} • {returnTime}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trip Type</span>
                  <span className="font-medium text-gray-900">{tripType?.replace('_', ' ')}</span>
                </div>
                
                {distance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Distance</span>
                    <span className="font-medium text-gray-900">{distance} km</span>
                  </div>
                )}
                
                {duration && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium text-gray-900">{formatDuration(parseInt(duration))}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment</span>
                  <span className="font-medium text-gray-900">Cash on Pickup</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t border-gray-200 pt-4 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-orange-600">₹{parseInt(price || '0').toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">All taxes and fees included</p>
              </div>

              {/* Features */}
              <div className="border-t border-gray-200 pt-4 mt-6">
                <h4 className="font-medium text-gray-900 mb-3">What's Included</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Professional chauffeur</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Fuel & toll charges</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>GPS tracking</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>24/7 customer support</span>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="border-t border-gray-200 pt-4 mt-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Need help? Call us at</span>
                  <a href="tel:9045450000" className="font-medium text-orange-600">9045450000</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}