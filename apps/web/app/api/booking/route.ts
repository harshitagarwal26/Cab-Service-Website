import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cab/db/src/client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const routeId = formData.get('routeId') as string;
    const cabTypeId = formData.get('cabTypeId') as string;
    const tripType = formData.get('tripType') as string;
    const startDate = formData.get('startDate') as string;
    const startTime = formData.get('startTime') as string;
    const returnDate = formData.get('returnDate') as string;
    const returnTime = formData.get('returnTime') as string;
    const price = parseInt(formData.get('price') as string);

    if (!routeId || !cabTypeId || !tripType || !startDate || !startTime || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get route details
    const route = await prisma.cityRoute.findUnique({
      where: { id: routeId },
      include: {
        fromCity: true,
        toCity: true
      }
    });

    if (!route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    // For now, redirect to booking form page with pre-filled data
    const params = new URLSearchParams({
      routeId,
      cabTypeId,
      tripType,
      fromCityId: route.fromCityId,
      toCityId: route.toCityId,
      fromCity: `${route.fromCity.name}, ${route.fromCity.state}`,
      toCity: `${route.toCity.name}, ${route.toCity.state}`,
      startDate,
      startTime,
      ...(returnDate ? { returnDate } : {}),
      ...(returnTime ? { returnTime } : {}),
      price: price.toString(),
      distance: route.distanceKm.toString(),
      duration: route.durationMin.toString(),
    });

    return NextResponse.redirect(new URL(`/booking?${params.toString()}`, request.url));
  } catch (error) {
    console.error('Error processing booking:', error);
    return NextResponse.json(
      { error: 'Failed to process booking' },
      { status: 500 }
    );
  }
}
