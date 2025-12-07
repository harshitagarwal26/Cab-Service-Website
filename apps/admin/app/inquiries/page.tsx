'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Inquiry {
  id: string;
  tripType: string;
  fromLocation: string;
  toLocation: string;
  startDate: string;
  endDate?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupAddress?: string;
  dropAddress?: string;
  requirements?: string;
  status: string;
  createdAt: string;
}

function InquiriesContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'active' | 'archived') || 'active';
  const paramId = searchParams.get('id');

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inquiries?status=${activeTab}`);
      const json = await res.json();
      const list = json.data || [];
      setInquiries(list);

      if (paramId) {
        const found = list.find((i: Inquiry) => i.id === paramId);
        if (found) setSelectedInquiry(found);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [activeTab]);

  // Effect to select inquiry when list updates (if paramId exists)
  useEffect(() => {
    if (paramId && inquiries.length > 0 && !selectedInquiry) {
      const found = inquiries.find((i) => i.id === paramId);
      if (found) setSelectedInquiry(found);
    }
  }, [inquiries, paramId]);

  const markAsDone = async (id: string) => {
    if (!confirm('Mark this inquiry as done and move to archive?')) return;
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'closed' })
      });
      if (res.ok) {
        fetchInquiries();
        if (selectedInquiry?.id === id) setSelectedInquiry(null);
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  // Helper to format date and time
  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-100">Inquiries</h1>
        
        {/* Tabs */}
        <div className="bg-white/5 p-1 rounded-lg flex gap-1">
          <button
            onClick={() => { setActiveTab('active'); setSelectedInquiry(null); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'active' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => { setActiveTab('archived'); setSelectedInquiry(null); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'archived' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Archive
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Inquiries List */}
        <div className="md:col-span-1 space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="text-slate-500 text-sm">Loading...</div>
          ) : inquiries.length === 0 ? (
            <div className="text-slate-500 text-sm bg-white/5 p-4 rounded-lg">No inquiries found.</div>
          ) : (
            inquiries.map((inq) => (
              <div
                key={inq.id}
                onClick={() => setSelectedInquiry(inq)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedInquiry?.id === inq.id
                    ? 'bg-indigo-600/20 border-indigo-500/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {inq.tripType.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDateTime(inq.createdAt)}
                  </span>
                </div>
                <h3 className="font-medium text-slate-200">{inq.fromLocation} → {inq.toLocation}</h3>
                <div className="text-sm text-slate-400 mt-1">{inq.customerName}</div>
              </div>
            ))
          )}
        </div>

        {/* Detail View */}
        <div className="md:col-span-2">
          {selectedInquiry ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">
                    {selectedInquiry.customerName}
                  </h2>
                  <div className="flex gap-4 text-sm text-slate-400">
                    <a href={`tel:${selectedInquiry.customerPhone}`} className="hover:text-indigo-400 transition">
                      📞 {selectedInquiry.customerPhone}
                    </a>
                    <a href={`mailto:${selectedInquiry.customerEmail}`} className="hover:text-indigo-400 transition">
                      ✉️ {selectedInquiry.customerEmail}
                    </a>
                  </div>
                </div>
                {activeTab === 'active' && (
                  <button
                    onClick={() => markAsDone(selectedInquiry.id)}
                    className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-600/50 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                  >
                    <span>✓</span> Mark as Done
                  </button>
                )}
              </div>

              <div className="grid gap-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-slate-500 mb-1 block">Received At</label>
                    <div className="text-slate-200">{formatDateTime(selectedInquiry.createdAt)}</div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wide text-slate-500 mb-1 block">Trip Type</label>
                    <div className="text-slate-200">{selectedInquiry.tripType.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wide text-slate-500 mb-1 block">Pickup Date</label>
                    <div className="text-slate-200">
                      {formatDateTime(selectedInquiry.startDate)}
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4 relative">
                    <div>
                      <label className="text-xs uppercase tracking-wide text-slate-500 mb-1 block">From</label>
                      <div className="text-white font-medium">{selectedInquiry.fromLocation}</div>
                      <div className="text-xs text-slate-400 mt-1">{selectedInquiry.pickupAddress || 'No specific address'}</div>
                    </div>
                    <div className="border-l border-white/10 pl-4">
                      <label className="text-xs uppercase tracking-wide text-slate-500 mb-1 block">To</label>
                      <div className="text-white font-medium">{selectedInquiry.toLocation}</div>
                      <div className="text-xs text-slate-400 mt-1">{selectedInquiry.dropAddress || 'No specific address'}</div>
                    </div>
                  </div>
                </div>

                {selectedInquiry.requirements && (
                  <div>
                    <label className="text-xs uppercase tracking-wide text-slate-500 mb-1 block">Special Requirements</label>
                    <div className="bg-white/5 p-3 rounded-lg text-slate-300 text-sm">
                      "{selectedInquiry.requirements}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 border border-white/5 rounded-xl border-dashed p-12">
              Select an inquiry to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InquiriesPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <InquiriesContent />
    </Suspense>
  );
}