'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Booking {
  id: string;
  tripType: string;
  startAt: string;
  returnAt?: string;
  priceQuote: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupAddress: string;
  dropAddress: string;
  status: string;
  fromCity?: { name: string; state: string };
  toCity?: { name: string; state: string };
  cabType: { name: string; seats: number; luggage: number };
}

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    if (bookingId) {
      fetchBooking(bookingId);
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/booking/${id}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-4">The booking could not be found.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">Your cab has been successfully booked.</p>
          </div>

          {/* Booking Details */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Booking ID:</span>
                  <span className="ml-2 text-gray-900 font-mono">{booking.id.slice(0, 8)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2 text-green-600 capitalize">{booking.status}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Trip Type:</span>
                  <span className="ml-2 text-gray-900">{booking.tripType.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Vehicle:</span>
                  <span className="ml-2 text-gray-900">{booking.cabType.name}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Journey Details</h3>
              <div className="space-y-2 text-sm">
                {booking.fromCity && booking.toCity && (
                  <div>
                    <span className="font-medium text-gray-700">Route:</span>
                    <span className="ml-2 text-gray-900">
                      {booking.fromCity.name}, {booking.fromCity.state} → {booking.toCity.name}, {booking.toCity.state}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">Departure:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(booking.startAt).toLocaleDateString()} at {new Date(booking.startAt).toLocaleTimeString()}
                  </span>
                </div>
                {booking.returnAt && (
                  <div>
                    <span className="font-medium text-gray-700">Return:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(booking.returnAt).toLocaleDateString()} at {new Date(booking.returnAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">{booking.customerName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-900">{booking.customerPhone}</span>
                </div>
                {booking.customerEmail && (
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">{booking.customerEmail}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Amount</h3>
              <p className="text-3xl font-bold text-blue-600">₹{booking.priceQuote.toLocaleString()}</p>
              <p className="text-sm text-blue-700 mt-2">Payment: Cash on pickup</p>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                You will receive a confirmation call within 30 minutes.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Book Another Ride
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BookingConfirmationContent />
    </Suspense>
  );
}