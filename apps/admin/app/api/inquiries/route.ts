import { NextResponse } from 'next/server';
import { prisma } from '@cab/db/src/client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'pending'; // Default to pending

  try {
    const inquiries = await prisma.inquiry.findMany({
      where: {
        status: status === 'archived' ? 'closed' : { not: 'closed' }
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: inquiries });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: inquiry });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}