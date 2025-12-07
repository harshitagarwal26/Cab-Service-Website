import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@cab/db/src/client";
import Link from "next/link";

export default async function MyInquiriesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/signin");
  }

  // Fetch inquiries where customerEmail matches the logged-in user's email
  const inquiries = await prisma.inquiry.findMany({
    where: {
      customerEmail: session.user.email
    },
    orderBy: { createdAt: 'desc' },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'closed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Inquiries</h1>
        <Link href="/" className="text-blue-600 hover:underline">New Inquiry</Link>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No inquiries yet</h3>
          <p className="text-gray-500 mt-1">You haven't made any custom trip inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status === 'closed' ? 'Responded' : inquiry.status}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">#{inquiry.id.slice(0, 8).toUpperCase()}</span>
                    <span className="text-xs text-gray-400">
                      Requested on {new Date(inquiry.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                    <span>{inquiry.fromLocation}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <span>{inquiry.toLocation}</span>
                  </h3>
                  
                  <div className="mt-2 text-sm text-gray-600 grid gap-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        Travel Date: {new Date(inquiry.startDate).toLocaleDateString('en-IN', {
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="capitalize">{inquiry.tripType.replace('_', ' ').toLowerCase()} Trip</span>
                    </div>
                  </div>

                  {inquiry.requirements && (
                    <div className="mt-3 text-sm bg-gray-50 p-3 rounded-lg text-gray-600 border border-gray-100">
                      <span className="font-medium text-gray-700">Note:</span> {inquiry.requirements}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}