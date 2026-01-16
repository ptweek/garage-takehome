import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateInvoicePDF, type ListingData } from '../../utilities/invoiceGenerator';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInvoiceRequest {
    listingData: ListingData;
    recipientEmail: string;
    recipientName?: string;
    message?: string;
}

export async function POST(req: NextRequest) {
    try {
        const { listingData, recipientEmail, recipientName, message }: SendInvoiceRequest = await req.json();

        if (!listingData || !recipientEmail) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const pdfBlob = await generateInvoicePDF(listingData);
        const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());
        const filename = `invoice-${listingData.secondaryId || listingData.id}.pdf`;

        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: recipientEmail,
            subject: `Invoice for ${listingData.listingTitle}`,
            html: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #CC0000;">Invoice - ${listingData.listingTitle}</h2>
          <p>Dear ${recipientName || 'Valued Customer'},</p>
          <p>Please find attached the invoice for:</p>
          <ul>
            <li><strong>Listing ID:</strong> ${listingData.secondaryId || listingData.id}</li>
            <li><strong>Vehicle:</strong> ${listingData.listingTitle}</li>
            <li><strong>Price:</strong> $${listingData.sellingPrice.toLocaleString()}</li>
          </ul>
           <p>We hope that you have a nice day!</p>
        <p>Sincerely,</p>
          <p>Garage Team</p>
          ${message ? `<p>${message}</p>` : ''}
        </div>
      `,
            attachments: [{
                filename: filename,
                content: pdfBuffer,
            }],
        });

        return NextResponse.json({
            success: true,
            message: `Invoice sent successfully to ${recipientEmail}`
        });

    } catch (error) {
        console.error('Error sending invoice:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send invoice' },
            { status: 500 }
        );
    }
}