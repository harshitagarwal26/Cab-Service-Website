import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cab/db/src/client';
import { sendAdminNotification } from '@/lib/email';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper to capitalize words (e.g., "new delhi" -> "New Delhi")
const toTitleCase = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const data = await request.json();

    // Fetch route details to get City IDs if routeId is provided
    let fromCityId: string | null = null;
    let toCityId: string | null = null;
    let routeDescription = 'Custom';

    if (data.routeId) {
      const route = await prisma.cityRoute.findUnique({
        where: { id: data.routeId },
        select: { 
          fromCityId: true, 
          toCityId: true,
          fromCity: { select: { name: true, state: true } },
          toCity: { select: { name: true, state: true } }
        }
      });
      
      if (route) {
        fromCityId = route.fromCityId;
        toCityId = route.toCityId;
        routeDescription = `${route.fromCity.name} ➝ ${route.toCity.name}`;
      }
    } else if (data.tripType === 'LOCAL') {
       routeDescription = "Local Trip";
    }

    // Get User ID if logged in
    // FIX: Explicitly type userId as string | null
    let userId: string | null = null;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ 
        where: { email: session.user.email },
        select: { id: true }
      });
      if (user) userId = user.id;
    }

    const booking = await prisma.booking.create({
      data: {
        tripType: data.tripType,
        fromCityId: fromCityId,
        toCityId: toCityId,
        startAt: new Date(`${data.startDate}T${data.startTime}`),
        endAt: data.returnDate ? new Date(`${data.returnDate}T${data.returnTime}`) : null,
        returnAt: data.returnDate ? new Date(`${data.returnDate}T${data.returnTime}`) : null,
        cabTypeId: data.cabTypeId,
        distanceKm: data.distance,
        durationMin: data.duration,
        priceQuote: data.price,
        customerName: data.name,
        customerPhone: data.phone,
        customerEmail: data.email || '',
        pickupAddress: data.pickupAddress || '',
        dropAddress: data.dropAddress || '',
        status: 'pending',
        userId: userId, // Link to user
      },
    });

    // --- Email Formatting ---
    const customerName = toTitleCase(data.name);
    const tripType = data.tripType.replace('_', ' ');
    const dateStr = new Date(`${data.startDate}T${data.startTime}`).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    const priceFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(data.price);

    const plainText = `New Booking from ${customerName} (+${data.phone})\nTrip: ${tripType}\nRoute: ${routeDescription}\nPickup: ${dateStr}\nPrice: ${priceFormatted}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333;">
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #2563eb; margin-top: 0;">🚖 New Booking Received</h2>
          <p style="font-size: 16px; margin-bottom: 20px;">You have received a new booking request from the website.</p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 140px; font-weight: bold; color: #64748b;">Customer:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #64748b;">Phone:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="tel:${data.phone}" style="color: #2563eb; text-decoration: none;">${data.phone}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #64748b;">Trip Type:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${tripType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #64748b;">Route:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${routeDescription}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #64748b;">Pickup Date:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${dateStr}</td>
            </tr>
             <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #64748b;">Price Quote:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">${priceFormatted}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/bookings" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View in Admin Dashboard</a>
          </div>
        </div>
      </div>
    `;

    await sendAdminNotification(
      `New Booking - ${routeDescription}`,
      plainText,
      htmlContent
    );

    return NextResponse.json({ 
      success: true, 
      bookingId: booking.id,
      message: 'Booking created successfully' 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}