'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PhoneInput from '../../components/ui/PhoneInput';

function InquiryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession(); // Get session data
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const tripType = searchParams.get('tripType');
  const fromLocation = searchParams.get('fromLocation');
  const toLocation = searchParams.get('toLocation');
  const startDate = searchParams.get('startDate');
  const startTime = searchParams.get('startTime');
  const returnDate = searchParams.get('returnDate');
  const returnTime = searchParams.get('returnTime');
  const requirementsParam = searchParams.get('requirements');

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    countryCode: '+91',
    pickupAddress: '',
    dropAddress: '',
    requirements: requirementsParam || '',
  });

  // Automatically pre-fill name and email when session loads
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        customerName: prev.customerName || session.user.name || '',
        customerEmail: prev.customerEmail || session.user.email || ''
      }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripType: tripType || 'CUSTOM',
          fromLocation: fromLocation || 'Custom',
          toLocation: toLocation || 'Custom',
          startDate: startDate || new Date().toISOString().split('T')[0],
          startTime: startTime || '09:00',
          returnDate,
          returnTime,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: `${formData.countryCode} ${formData.customerPhone}`,
          pickupAddress: formData.pickupAddress,
          dropAddress: formData.dropAddress,
          requirements: formData.requirements,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        throw new Error('Failed to submit inquiry');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inquiry Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your inquiry. Our team will contact you within 2 hours with pricing and availability.
          </p>
          <button
            onClick={() => router.push('/my-inquiries')}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View My Inquiries
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Inquiry
            </h1>
            <p className="text-gray-600">
              This route is not available for instant booking. Please provide your details and we'll get back to you with pricing and availability.
            </p>
          </div>

          {/* Trip Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Trip Summary</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Trip Type:</span> {tripType?.replace('_', ' ') || 'Custom'}</p>
              <p><span className="font-medium">From:</span> {fromLocation || 'Custom'}</p>
              <p><span className="font-medium">To:</span> {toLocation || 'Custom'}</p>
              <p><span className="font-medium">Date:</span> {startDate || 'Not specified'} at {startTime || 'Not specified'}</p>
              {returnDate && (
                <p><span className="font-medium">Return:</span> {returnDate} at {returnTime}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <PhoneInput
                  value={formData.customerPhone}
                  countryCode={formData.countryCode}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, customerPhone: val }))}
                  onCountryCodeChange={(code) => setFormData(prev => ({ ...prev, countryCode: code }))}
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
                  value={formData.customerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${session?.user?.email ? 'bg-gray-50' : ''}`}
                  readOnly={!!session?.user?.email} // Make read-only if logged in to ensure match
                />
                {session?.user?.email && (
                  <p className="text-xs text-gray-500">Email linked to your account.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Pickup Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pickupAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickupAddress: e.target.value }))}
                  placeholder="Enter detailed pickup address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Drop Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.dropAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, dropAddress: e.target.value }))}
                  placeholder="Enter detailed drop address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Special Requirements
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  rows={4}
                  placeholder="Any special requirements or preferences..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function InquiryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <InquiryContent />
    </Suspense>
  );
}