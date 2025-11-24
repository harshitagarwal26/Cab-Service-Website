import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cab/db/src/client';
import { sendAdminNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // FIX: Fetch route details to get City IDs if routeId is provided
    let fromCityId = null;
    let toCityId = null;

    if (data.routeId) {
      const route = await prisma.cityRoute.findUnique({
        where: { id: data.routeId },
        select: { fromCityId: true, toCityId: true }
      });
      
      if (route) {
        fromCityId = route.fromCityId;
        toCityId = route.toCityId;
      }
    }

    const booking = await prisma.booking.create({
      data: {
        tripType: data.tripType,
        fromCityId: fromCityId, // Now correctly populated
        toCityId: toCityId,     // Now correctly populated
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
      },
    });

    // Here you can add email notifications, SMS, etc.
    // await sendBookingConfirmation(booking);
    await sendAdminNotification(
      'New Booking Request',
      `New booking from ${data.name} (${data.phone}).
      Route: ${fromCityId ? 'Intercity' : 'Custom'}
      Price: ₹${data.price}`
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