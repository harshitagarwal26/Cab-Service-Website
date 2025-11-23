import { NextResponse } from 'next/server';
import { prisma } from '@cab/db/src/client';

export async function GET() {
  try {
    const cabTypes = await prisma.cabType.findMany({
      where: { name: { not: 'Custom' } },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ data: cabTypes });
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
    const { name, seats, luggage, active } = body;

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const cabType = await prisma.cabType.create({
      data: {
        name,
        seats: Number(seats) || 0,
        luggage: Number(luggage) || 0,
        active: active !== false
      }
    });

    return NextResponse.json({ success: true, data: cabType });
  } catch (error: any) {
    // Handle unique constraint violation specifically
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A cab type with this name already exists.' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create cab type', details: error.message || String(error) }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, seats, luggage, active } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const cabType = await prisma.cabType.update({
      where: { id },
      data: {
        name,
        seats: Number(seats) || 0,
        luggage: Number(luggage) || 0,
        active: Boolean(active)
      }
    });

    return NextResponse.json({ success: true, data: cabType });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A cab type with this name already exists.' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update cab type', details: error.message || String(error) }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    // Check ALL dependencies
    const [pricingRules, routePricings, bookings] = await Promise.all([
      prisma.pricingRule.count({ where: { cabTypeId: id } }),
      prisma.routePricing.count({ where: { cabTypeId: id } }),
      prisma.booking.count({ where: { cabTypeId: id } })
    ]);

    if (pricingRules > 0 || routePricings > 0 || bookings > 0) {
      return NextResponse.json({ 
        error: `Cannot delete: Used in ${pricingRules} pricing rules, ${routePricings} route prices, and ${bookings} bookings.` 
      }, { status: 400 });
    }

    await prisma.cabType.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete', details: error.message || String(error) }, 
      { status: 500 }
    );
  }
}