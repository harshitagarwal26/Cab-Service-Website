import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    
    const cities = await prisma.city.findMany({
      where: {
        active: true,
        ...(search ? {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            },
            {
              state: {
                contains: search,
                mode: 'insensitive'
              }
            }
          ]
        } : {})
      },
      orderBy: [
        { name: 'asc' }
      ],
      take: 50
    });

    return NextResponse.json({ data: cities });
  } catch (error) {
    console.error('Cities API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch cities', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}
