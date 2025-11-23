import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cab/db/src/client';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const booking = await prisma.booking.create({
      data: {
        tripType: data.tripType,
        fromCityId: data.routeId ? undefined : null, // Will get from route
        toCityId: data.routeId ? undefined : null,   // Will get from route
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
    Route: ${booking.fromCityId ? 'Intercity' : 'Custom'}
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
