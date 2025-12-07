import { NextResponse } from 'next/server';
import { prisma } from '@cab/db/src/client';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          include: {
            fromCity: true,
            toCity: true,
            cabType: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Inquiries are not directly linked by ID but by email
    const inquiries = await prisma.inquiry.findMany({
      where: { customerEmail: user.email },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ user, inquiries });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
  }
}