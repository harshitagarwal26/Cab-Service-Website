import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cab/db/src/client';
import { sendAdminNotification } from '@/lib/email';

// Helper to capitalize words (e.g., "new delhi" -> "New Delhi")
const toTitleCase = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export async function POST(request: NextRequest) {
  console.log("--- STARTING INQUIRY REQUEST ---");

  try {
    const data = await request.json();
    
    // 1. Format Data for display
    const customerName = toTitleCase(data.customerName);
    const fromLocation = toTitleCase(data.fromLocation);
    const toLocation = toTitleCase(data.toLocation);
    const tripType = data.tripType.replace('_', ' ');
    const dateStr = new Date(`${data.startDate}T${data.startTime}`).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    // 2. Save to Database
    const inquiry = await prisma.inquiry.create({
      data: {
        tripType: data.tripType,
        fromLocation: data.fromLocation, // Keep original in DB if preferred, or use formatted
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

    // 3. Prepare Readable Email Content
    const plainText = `New Inquiry from ${customerName}\nPhone: ${data.customerPhone}\nTrip: ${tripType}\nFrom: ${fromLocation} To: ${toLocation}\nDate: ${dateStr}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333;">
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #2563eb; margin-top: 0;">🚖 New Inquiry Received</h2>
          <p style="font-size: 16px; margin-bottom: 20px;">You have received a new trip inquiry from the website.</p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 140px; font-weight: bold; color: #64748b;">Customer:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #64748b;">Phone:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="tel:${data.customerPhone}" style="color: #2563eb; text-decoration: none;">${data.customerPhone}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #64748b;">Trip Type:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${tripType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #64748b;">Route:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${fromLocation} ➝ ${toLocation}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #64748b;">Pickup Date:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${dateStr}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/inquiries" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View in Admin Dashboard</a>
          </div>
        </div>
      </div>
    `;

    // 4. Send Email
    await sendAdminNotification(
      `New Inquiry - ${fromLocation} to ${toLocation}`, // Better Subject Line
      plainText,
      htmlContent
    );

    return NextResponse.json({ success: true, inquiryId: inquiry.id });

  } catch (error: any) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json(
      { error: 'Failed to create inquiry', details: error.message },
      { status: 500 }
    );
  }
}