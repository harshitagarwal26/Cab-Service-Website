import { NextResponse } from 'next/server';
import { prisma } from '@cab/db/src/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    
    const cities = await prisma.city.findMany({
      where: {
        ...(search ? {
          OR: [
            { name: { contains: search } }, 
            { state: { contains: search } }
          ]
        } : {})
      },
      orderBy: [
        { name: 'asc' }
      ],
      take: 100
    });

    return NextResponse.json({ data: cities });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, state, isAirport, active } = body;

    if (!name || !state) {
      return NextResponse.json({ error: 'Name and State are required' }, { status: 400 });
    }

    const city = await prisma.city.create({
      data: {
        name,
        state,
        isAirport: isAirport || false,
        active: active !== false
      }
    });

    return NextResponse.json({ success: true, data: city });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create', details: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, state, isAirport, active } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const city = await prisma.city.update({
      where: { id },
      data: { name, state, isAirport, active }
    });

    return NextResponse.json({ success: true, data: city });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    // Check all dependencies
    const [routes, bookingsFrom, bookingsTo] = await Promise.all([
      prisma.cityRoute.count({ where: { OR: [{ fromCityId: id }, { toCityId: id }] } }),
      prisma.booking.count({ where: { fromCityId: id } }),
      prisma.booking.count({ where: { toCityId: id } })
    ]);

    if (routes > 0 || bookingsFrom > 0 || bookingsTo > 0) {
      return NextResponse.json({ 
        error: `Cannot delete: City is used in ${routes} routes and ${bookingsFrom + bookingsTo} bookings.` 
      }, { status: 400 });
    }

    await prisma.city.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete', details: error.message }, { status: 500 });
  }
}