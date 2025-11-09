import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cab/db/src/client';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const inquiry = await prisma.inquiry.create({
      data: {
        tripType: data.tripType,
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        startDate: new Date(`${data.startDate}T${data.startTime}`),
        endDate: data.returnDate ? new Date(`${data.returnDate}T${data.returnTime}`) : null,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || '',
        pickupAddress: data.pickupAddress || '',
        dropAddress: data.dropAddress || '',
        requirements: data.requirements || '',
      },
    });

    // Here you can add email notification logic
    // await sendInquiryNotification(inquiry);

    return NextResponse.json({ success: true, inquiryId: inquiry.id });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to create inquiry' },
      { status: 500 }
    );
  }
}
