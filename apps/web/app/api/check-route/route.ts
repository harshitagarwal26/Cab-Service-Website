import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cab/db/src/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fromCityId = searchParams.get('from');
  const toCityId = searchParams.get('to');
  const tripType = searchParams.get('tripType') || 'ONE_WAY';

  if (!fromCityId || !toCityId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    // Find route with admin-set pricing
    const route = await prisma.cityRoute.findUnique({
      where: {
        fromCityId_toCityId: {
          fromCityId,
          toCityId,
        },
      },
      include: {
        routePricing: {
          where: {
            tripType,
            active: true,
          },
          include: {
            cabType: true,
          },
        },
        fromCity: true,
        toCity: true,
      },
    });

    // If no route or no active pricing, not available
    if (!route || route.routePricing.length === 0) {
      return NextResponse.json({ available: false });
    }

    return NextResponse.json({
      available: true,
      route: {
        id: route.id,
        distanceKm: route.distanceKm,
        durationMin: route.durationMin,
        fromCity: {
          id: route.fromCity.id,
          name: route.fromCity.name,
          state: route.fromCity.state,
        },
        toCity: {
          id: route.toCity.id,
          name: route.toCity.name,
          state: route.toCity.state,
        },
      },
      pricing: route.routePricing
        .filter(p => p.cabType.name !== 'Custom')
        .map(p => ({
          id: p.id,
          cabTypeId: p.cabTypeId,
          cabTypeName: p.cabType.name,
          seats: p.cabType.seats,
          luggage: p.cabType.luggage,
          features: p.cabType.features,
          price: p.price,
        })),
    });
  } catch (error) {
    console.error('Error checking route availability:', error);
    return NextResponse.json({ available: false });
  }
}
