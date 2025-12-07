'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Booking {
  id: string;
  tripType: string;
  startAt: string;
  returnAt?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupAddress?: string;
  dropAddress?: string;
  priceQuote: number;
  status: string;
  createdAt: string;
  distanceKm: number;
  durationMin: number;
  // Relations
  fromCity?: { name: string };
  toCity?: { name: string };
  cabType: { name: string };
}

function BookingsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'active' | 'archived') || 'active';
  const paramId = searchParams.get('id');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?status=${activeTab}`);
      const json = await res.json();
      const list = json.data || [];
      setBookings(list);
      
      // Auto-select booking from URL if available in list
      if (paramId) {
        const found = list.find((b: Booking) => b.id === paramId);
        if (found) {
          setSelectedBooking(found);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  // Effect to select booking when list updates (if paramId exists)
  useEffect(() => {
    if (paramId && bookings.length > 0 && !selectedBooking) {
      const found = bookings.find((b) => b.id === paramId);
      if (found) setSelectedBooking(found);
    }
  }, [bookings, paramId]);

  const updateStatus = async (id: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) return;
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        fetchBookings();
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking({ ...selectedBooking, status: newStatus });
        }
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'pending': return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'completed': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/50';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-100">Bookings</h1>
        
        <div className="bg-white/5 p-1 rounded-lg flex gap-1">
          <button
            onClick={() => { setActiveTab('active'); setSelectedBooking(null); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'active' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => { setActiveTab('archived'); setSelectedBooking(null); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'archived' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Archive
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Booking List */}
        <div className="md:col-span-1 space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="text-slate-500 text-sm">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="text-slate-500 text-sm bg-white/5 p-4 rounded-lg">No bookings found.</div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                id={`booking-${booking.id}`}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedBooking?.id === booking.id
                    ? 'bg-indigo-600/20 border-indigo-500/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded border ${getStatusColor(booking.status)}`}>
                    {booking.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(booking.startAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                
                <h3 className="font-medium text-slate-200">
                  {booking.fromCity ? booking.fromCity.name : 'Local/Custom'}
                  {booking.toCity && ` → ${booking.toCity.name}`}
                </h3>
                
                <div className="flex justify-between items-end mt-2">
                  <div className="text-sm text-slate-400">{booking.customerName}</div>
                  <div className="text-sm font-semibold text-indigo-300">
                    #{booking.id.slice(0, 8).toUpperCase()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail View */}
        <div className="md:col-span-2">
          {selectedBooking ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">
                    Booking #{selectedBooking.id.slice(0, 8).toUpperCase()}
                  </h2>
                  <div className="flex gap-4 text-sm text-slate-400 mt-2">
                    <span className="bg-white/10 px-2 py-1 rounded text-slate-200">
                      {selectedBooking.tripType.replace('_', ' ')}
                    </span>
                    <span className="bg-white/10 px-2 py-1 rounded text-slate-200">
                      {selectedBooking.cabType.name}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {selectedBooking.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(selectedBooking.id, 'confirmed')}
                      className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-600/50 px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      Accept
                    </button>
                  )}
                  {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                    <>
                      <button
                        onClick={() => updateStatus(selectedBooking.id, 'completed')}
                        className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/50 px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => updateStatus(selectedBooking.id, 'cancelled')}
                        className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/50 px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid gap-6">
                {/* Customer Info */}
                <div className="bg-black/20 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-slate-300 mb-3 uppercase tracking-wide">Customer Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-500 block">Name</label>
                      <div className="text-slate-200">{selectedBooking.customerName}</div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block">Phone</label>
                      <a href={`tel:${selectedBooking.customerPhone}`} className="text-indigo-400 hover:underline">
                        {selectedBooking.customerPhone}
                      </a>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-slate-500 block">Email</label>
                      <a href={`mailto:${selectedBooking.customerEmail}`} className="text-indigo-400 hover:underline">
                        {selectedBooking.customerEmail || 'N/A'}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="bg-black/20 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-slate-300 mb-3 uppercase tracking-wide">Trip Details</h3>
                  <div className="grid grid-cols-2 gap-6 relative">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">From</label>
                      <div className="text-white font-medium text-lg">
                        {selectedBooking.fromCity ? selectedBooking.fromCity.name : 'Local/Custom'}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        {selectedBooking.pickupAddress || 'No specific address'}
                      </div>
                      <div className="text-indigo-400 text-sm mt-2 font-medium">
                        {formatDateTime(selectedBooking.startAt)}
                      </div>
                    </div>
                    
                    <div className="border-l border-white/10 pl-6">
                      <label className="text-xs text-slate-500 block mb-1">To</label>
                      <div className="text-white font-medium text-lg">
                        {selectedBooking.toCity ? selectedBooking.toCity.name : 'Local/Custom'}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        {selectedBooking.dropAddress || 'No specific address'}
                      </div>
                      {selectedBooking.returnAt && (
                        <div className="text-indigo-400 text-sm mt-2 font-medium">
                          Return: {formatDateTime(selectedBooking.returnAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing & Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 p-3 rounded-lg text-center">
                    <label className="text-xs text-slate-500 block">Distance</label>
                    <div className="text-slate-200 font-medium">{selectedBooking.distanceKm || 0} km</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg text-center">
                    <label className="text-xs text-slate-500 block">Est. Time</label>
                    <div className="text-slate-200 font-medium">
                      {Math.floor(selectedBooking.durationMin / 60)}h {selectedBooking.durationMin % 60}m
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg text-center border border-indigo-500/30">
                    <label className="text-xs text-slate-500 block">Total Price</label>
                    <div className="text-indigo-300 font-bold text-lg">₹{selectedBooking.priceQuote.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 border border-white/5 rounded-xl border-dashed p-12 min-h-[400px]">
              Select a booking to view full details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <BookingsContent />
    </Suspense>
  );
}