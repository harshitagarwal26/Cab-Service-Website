import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@cab/db/src/client";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { _count: { select: { bookings: true } } }
  });

  if (!user) return <div>User not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Sidebar / Stats */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600 mx-auto mb-4 overflow-hidden">
              {user.image ? (
                <img 
                  src={user.image} 
                  alt={user.name || "User"} 
                  referrerPolicy="no-referrer" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span>{user.name?.[0]?.toUpperCase() || "U"}</span>
              )}
            </div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center gap-8">
              <div>
                <span className="block text-2xl font-bold text-gray-900">{user._count.bookings}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Bookings</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-gray-900">{new Date(user.createdAt).getFullYear()}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Member Since</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-6">Personal Details</h3>
            <ProfileForm user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}