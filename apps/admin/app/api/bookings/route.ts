import { NextResponse } from 'next/server';
import { prisma } from '@cab/db/src/client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'active'; // Default to active

  // Define status filters
  const activeStatuses = ['pending', 'confirmed', 'in_progress'];
  const archivedStatuses = ['completed', 'cancelled', 'rejected'];

  const statusFilter = status === 'active' 
    ? { in: activeStatuses } 
    : { in: archivedStatuses };

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: statusFilter
      },
      include: {
        fromCity: { select: { name: true, state: true } },
        toCity: { select: { name: true, state: true } },
        cabType: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Update failed:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}