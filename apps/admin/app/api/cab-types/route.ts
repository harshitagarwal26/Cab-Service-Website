import { NextResponse } from 'next/server';
import { prisma } from '@cab/db/src/client';

export async function GET() {
  try {
    console.log('Fetching cab types...');
    
    const cabTypes = await prisma.cabType.findMany({
      where: {
        active: true,
        name: {
          not: 'Custom'
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('Found cab types:', cabTypes.length);

    return NextResponse.json({ data: cabTypes });
  } catch (error) {
    console.error('Error fetching cab types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cab types', details: error }, 
      { status: 500 }
    );
  }
}
