import { NextResponse } from 'next/server';
import { prisma } from '@cab/db/src/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fromCityId = searchParams.get('fromCityId') || undefined;
    const toCityId = searchParams.get('toCityId') || undefined;
    const cabTypeId = searchParams.get('cabTypeId') || undefined;
    const tripType = searchParams.get('tripType') || undefined;
    const active = searchParams.get('active');
    
    const where: any = {
      ...(fromCityId ? { fromCityId } : {}),
      ...(toCityId ? { toCityId } : {}),
      ...(cabTypeId ? { cabTypeId } : {}),
      ...(tripType ? { tripType } : {}),
      ...(active != null ? { active: active === 'true' } : {})
    };

    const list = await prisma.routePricing.findMany({
      where,
      include: {
        cabType: true,
        route: { 
          include: { 
            fromCity: true, 
            toCity: true 
          } 
        }
      },
      orderBy: [{ updatedAt: 'desc' }]
    });

    return NextResponse.json({ data: list });
  } catch (error) {
    console.error('Error fetching route pricing:', error);
    return NextResponse.json({ error: 'Failed to fetch route pricing' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fromCityId, toCityId, cabTypeId, tripType, price, active, distanceKm, durationMin } = body;

    if (!fromCityId || !toCityId || !cabTypeId || !tripType || typeof price !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure CityRoute exists
    const route = await prisma.cityRoute.upsert({
      where: { 
        fromCityId_toCityId: { 
          fromCityId, 
          toCityId 
        } 
      },
      update: {
        ...(typeof distanceKm === 'number' ? { distanceKm } : {}),
        ...(typeof durationMin === 'number' ? { durationMin } : {}),
      },
      create: {
        fromCityId,
        toCityId,
        distanceKm: distanceKm || 0,
        durationMin: durationMin || 0,
        tripTypes: JSON.stringify(['ONE_WAY', 'ROUND_TRIP']),
        active: true
      }
    });

    // Upsert RoutePricing
    const routePricing = await prisma.routePricing.upsert({
      where: {
        fromCityId_toCityId_cabTypeId_tripType: {
          fromCityId, 
          toCityId, 
          cabTypeId, 
          tripType
        }
      },
      update: { 
        price, 
        active: active ?? true, 
        routeId: route.id 
      },
      create: {
        routeId: route.id,
        fromCityId, 
        toCityId, 
        cabTypeId, 
        tripType,
        price, 
        active: active ?? true
      }
    });

    return NextResponse.json({ success: true, data: routePricing });
  } catch (error) {
    console.error('Error creating route pricing:', error);
    return NextResponse.json({ error: 'Failed to create route pricing' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, price, active, distanceKm, durationMin } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // We perform a nested update to ensure the underlying route details are updated as well
    const routePricing = await prisma.routePricing.update({
      where: { id },
      data: {
        ...(typeof price === 'number' ? { price } : {}),
        ...(typeof active === 'boolean' ? { active } : {}),
        route: {
          update: {
            ...(typeof distanceKm === 'number' ? { distanceKm } : {}),
            ...(typeof durationMin === 'number' ? { durationMin } : {}),
          }
        }
      },
      include: {
        route: true // Include route to confirm updates in response if needed
      }
    });

    return NextResponse.json({ success: true, data: routePricing });
  } catch (error) {
    console.error('Error updating route pricing:', error);
    return NextResponse.json({ error: 'Failed to update route pricing' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await prisma.routePricing.delete({ 
      where: { id } 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting route pricing:', error);
    return NextResponse.json({ error: 'Failed to delete route pricing' }, { status: 500 });
  }
}