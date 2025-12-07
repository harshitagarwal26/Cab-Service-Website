'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

interface Booking {
  id: string;
  tripType: string;
  status: string;
  startAt: string;
  priceQuote: number;
  fromCity?: { name: string };
  toCity?: { name: string };
  cabType: { name: string };
  createdAt: string;
}

interface Inquiry {
  id: string;
  tripType: string;
  fromLocation: string;
  toLocation: string;
  startDate: string;
  status: string;
  createdAt: string;
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'inquiries'>('bookings');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/users/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setUser(data.user);
        setBookings(data.user.bookings || []);
        setInquiries(data.inquiries || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [params.id]);

  const handleBookingClick = (booking: Booking) => {
    const isArchived = ['completed', 'cancelled', 'rejected'].includes(booking.status);
    const tab = isArchived ? 'archived' : 'active';
    router.push(`/bookings?id=${booking.id}&tab=${tab}`);
  };

  const handleInquiryClick = (inquiry: Inquiry) => {
    const isArchived = inquiry.status === 'closed';
    const tab = isArchived ? 'archived' : 'active';
    router.push(`/inquiries?id=${inquiry.id}&tab=${tab}`);
  };

  if (loading) return <div className="text-slate-400">Loading user profile...</div>;
  if (!user) return <div className="text-red-400">User not found</div>;

  return (
    <div className="space-y-8">
      {/* Header / Profile Card */}
      <div className="flex items-start justify-between">
        <div>
          <button 
            onClick={() => router.back()} 
            className="text-sm text-slate-400 hover:text-white mb-2 flex items-center gap-1"
          >
            ← Back to Users
          </button>
          <h1 className="text-3xl font-bold text-slate-100">{user.name || 'Unnamed User'}</h1>
          <p className="text-slate-400">{user.email}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500 uppercase tracking-wider">Role</div>
          <div className="font-medium text-slate-200 capitalize">{user.role}</div>
          <div className="text-sm text-slate-500 uppercase tracking-wider mt-2">Joined</div>
          <div className="font-medium text-slate-200">{new Date(user.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-fit">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 border-b border-white/10 pb-2">Contact Info</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 block">Email Address</label>
              <a href={`mailto:${user.email}`} className="text-indigo-400 hover:underline">{user.email}</a>
            </div>
            <div>
              <label className="text-xs text-slate-500 block">Phone Number</label>
              <div className="text-slate-200">{user.phone || 'Not provided'}</div>
            </div>
            <div>
              <label className="text-xs text-slate-500 block">Total Spend</label>
              <div className="text-emerald-400 font-medium">
                ₹{bookings.reduce((acc, b) => acc + (b.status === 'completed' ? b.priceQuote : 0), 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed (Bookings/Inquiries) */}
        <div className="md:col-span-2">
          <div className="flex gap-4 border-b border-white/10 mb-4">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`pb-2 text-sm font-medium transition-colors ${
                activeTab === 'bookings' 
                  ? 'text-indigo-400 border-b-2 border-indigo-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`pb-2 text-sm font-medium transition-colors ${
                activeTab === 'inquiries' 
                  ? 'text-indigo-400 border-b-2 border-indigo-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Inquiries ({inquiries.length})
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden min-h-[300px]">
            {activeTab === 'bookings' ? (
              <div className="overflow-x-auto">
                <table className="table w-full text-left">
                  <thead>
                    <tr>
                      <th className="p-4 bg-white/5 font-medium text-slate-400 text-sm">Date</th>
                      <th className="p-4 bg-white/5 font-medium text-slate-400 text-sm">Route</th>
                      <th className="p-4 bg-white/5 font-medium text-slate-400 text-sm">Cab</th>
                      <th className="p-4 bg-white/5 font-medium text-slate-400 text-sm">Amount</th>
                      <th className="p-4 bg-white/5 font-medium text-slate-400 text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {bookings.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500">No bookings history</td></tr>
                    ) : (
                      bookings.map((b) => (
                        <tr 
                          key={b.id} 
                          onClick={() => handleBookingClick(b)}
                          className="hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <td className="p-4 text-slate-300 text-sm">
                            {new Date(b.startAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-slate-200 text-sm font-medium">
                            {b.fromCity?.name || 'Local'} → {b.toCity?.name || 'Local'}
                            <div className="text-xs text-slate-500 font-normal mt-0.5">{b.tripType.replace('_', ' ')}</div>
                          </td>
                          <td className="p-4 text-slate-300 text-sm">{b.cabType.name}</td>
                          <td className="p-4 text-slate-200 text-sm">₹{b.priceQuote.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded capitalize ${
                              b.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                              b.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                              'bg-amber-500/20 text-amber-300'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full text-left">
                  <thead>
                    <tr>
                      <th className="p-4 bg-white/5 font-medium text-slate-400 text-sm">Date</th>
                      <th className="p-4 bg-white/5 font-medium text-slate-400 text-sm">Details</th>
                      <th className="p-4 bg-white/5 font-medium text-slate-400 text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {inquiries.length === 0 ? (
                      <tr><td colSpan={3} className="p-8 text-center text-slate-500">No inquiry history</td></tr>
                    ) : (
                      inquiries.map((inq) => (
                        <tr 
                          key={inq.id} 
                          onClick={() => handleInquiryClick(inq)}
                          className="hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <td className="p-4 text-slate-300 text-sm">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-slate-200 text-sm">
                            <div className="font-medium">{inq.fromLocation} → {inq.toLocation}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {inq.tripType.replace('_', ' ')} • Travel on {new Date(inq.startDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded capitalize ${
                              inq.status === 'closed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'
                            }`}>
                              {inq.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}