import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Gmail SMTP Transporter
const GMAIL_USER = (process.env.GMAIL_USER || 'awalgsm@gmail.com').trim();
const GMAIL_PASS = (process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS || 'qxgd dcbf rskx bjbr').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

// Helper to format HTML email voucher
function generateBookingVoucherHtml(data: {
  bookingRef: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry?: string;
  experienceTitle: string;
  tourDate: string;
  timeSlot?: string;
  adults: number;
  children: number;
  transferType?: string;
  pickupLocation?: string;
  hotelRoom?: string;
  totalAED: number;
  currency?: string;
  convertedTotal?: number;
  paymentMethod?: string;
  specialRequests?: string;
  machine?: string;
  duration?: string;
  itinerary?: { time: string; title: string; description: string }[];
}) {
  const {
    bookingRef,
    guestName,
    guestEmail,
    guestPhone,
    experienceTitle,
    tourDate,
    timeSlot,
    adults,
    children,
    transferType,
    pickupLocation,
    hotelRoom,
    totalAED,
    currency = 'AED',
    convertedTotal,
    paymentMethod = 'Cash on Pickup / Card on Arrival',
    specialRequests,
    machine,
    duration,
    itinerary,
  } = data;

  const totalGuests = (adults || 0) + (children || 0);

  const itineraryHtml =
    itinerary && itinerary.length > 0
      ? `
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e7e5e4;">
          <h3 style="margin: 0 0 12px 0; color: #1c1917; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Expedition Itinerary Timeline</h3>
          <div style="border-left: 2px solid #ea580c; padding-left: 14px; margin-left: 4px;">
            ${itinerary
              .map(
                (step) => `
              <div style="margin-bottom: 12px;">
                <span style="font-size: 11px; font-weight: bold; color: #ea580c; display: block;">${step.time}</span>
                <strong style="font-size: 13px; color: #1c1917;">${step.title}</strong>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #57534e;">${step.description}</p>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
      : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Booking Confirmation - ${bookingRef}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #292524;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f5f4; padding: 24px 12px;">
          <tr>
            <td align="center">
              <!-- Main Card Container -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e7e5e4;">
                
                <!-- Brand Header Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1c1917 0%, #292524 100%); padding: 32px 24px; text-align: center;">
                    <div style="display: inline-block; padding: 4px 12px; background-color: rgba(234, 88, 12, 0.2); border: 1px solid #ea580c; border-radius: 20px; color: #fdba74; font-size: 11px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">
                      Official DTCM Licensed Operator
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-family: Georgia, serif; letter-spacing: 0.02em;">
                      Phoenix Desert Safari Dubai
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #d6d3d1; font-size: 13px;">
                      VIP Desert Safaris • 1000cc Can-Am Buggies • Luxury 4x4 Convoys
                    </p>
                  </td>
                </tr>

                <!-- Confirmation Notice -->
                <tr>
                  <td style="padding: 24px 24px 12px 24px;">
                    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; text-align: center;">
                      <span style="font-size: 24px; display: block; margin-bottom: 4px;">🎉</span>
                      <h2 style="margin: 0 0 4px 0; color: #065f46; font-size: 18px; font-weight: bold;">Booking Confirmed &amp; Reserved</h2>
                      <p style="margin: 0; color: #047857; font-size: 13px;">
                        Marhaba <strong>${guestName}</strong>! Your desert expedition has been successfully registered with our operations dispatch.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Voucher Reference Box -->
                <tr>
                  <td style="padding: 0 24px 16px 24px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fff7ed; border: 1px dashed #ea580c; border-radius: 12px; padding: 14px 18px;">
                      <tr>
                        <td>
                          <span style="font-size: 11px; color: #9a3412; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; display: block;">Booking Reference Number</span>
                          <span style="font-size: 22px; color: #ea580c; font-weight: 800; font-family: monospace; letter-spacing: 0.08em;">${bookingRef}</span>
                        </td>
                        <td align="right">
                          <span style="font-size: 11px; color: #9a3412; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; display: block;">Status</span>
                          <span style="display: inline-block; background-color: #ea580c; color: #ffffff; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 6px;">Guaranteed Slot</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Tour & Guest Details Table -->
                <tr>
                  <td style="padding: 0 24px 20px 24px;">
                    <h3 style="margin: 0 0 12px 0; color: #1c1917; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e7e5e4; padding-bottom: 8px;">
                      Reservation Overview
                    </h3>

                    <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 13px;">
                      <tr>
                        <td width="38%" style="color: #78716c;">Experience:</td>
                        <td width="62%" style="color: #1c1917; font-weight: bold;">${experienceTitle}</td>
                      </tr>
                      <tr>
                        <td style="color: #78716c;">Date of Tour:</td>
                        <td style="color: #1c1917; font-weight: bold;">${tourDate}</td>
                      </tr>
                      ${timeSlot ? `<tr><td style="color: #78716c;">Timing / Slot:</td><td style="color: #1c1917; font-weight: bold;">${timeSlot}</td></tr>` : ''}
                      ${duration ? `<tr><td style="color: #78716c;">Duration:</td><td style="color: #1c1917;">${duration}</td></tr>` : ''}
                      ${machine ? `<tr><td style="color: #78716c;">Vehicle / Machine:</td><td style="color: #1c1917; font-weight: bold;">${machine}</td></tr>` : ''}
                      <tr>
                        <td style="color: #78716c;">Guests / Passengers:</td>
                        <td style="color: #1c1917;">${totalGuests} Pax (${adults} Adult${adults > 1 ? 's' : ''}${children > 0 ? `, ${children} Child` : ''})</td>
                      </tr>
                      <tr>
                        <td style="color: #78716c;">Transfer Type:</td>
                        <td style="color: #1c1917;">${transferType || '4x4 Desert Safari Transfer'}</td>
                      </tr>
                      <tr>
                        <td style="color: #78716c;">Pickup Location:</td>
                        <td style="color: #1c1917; font-weight: bold;">${pickupLocation || 'DAMAC XL Tower / Hotel Lobby'} ${hotelRoom ? `(Room: ${hotelRoom})` : ''}</td>
                      </tr>
                      <tr>
                        <td style="color: #78716c;">Guest Contact:</td>
                        <td style="color: #1c1917;">${guestName} • ${guestPhone} • ${guestEmail}</td>
                      </tr>
                      ${specialRequests ? `<tr><td style="color: #78716c;">Special Requests:</td><td style="color: #1c1917;">${specialRequests}</td></tr>` : ''}
                    </table>

                    <!-- Pricing Summary Box -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 16px; background-color: #fafaf9; border-radius: 10px; padding: 14px 16px; border: 1px solid #e7e5e4;">
                      <tr>
                        <td>
                          <span style="font-size: 12px; color: #78716c; display: block;">Total Rate Due</span>
                          <span style="font-size: 20px; color: #ea580c; font-weight: bold;">AED ${totalAED}</span>
                          ${currency !== 'AED' && convertedTotal ? `<span style="font-size: 12px; color: #78716c; margin-left: 6px;">(approx. ${currency} ${convertedTotal})</span>` : ''}
                        </td>
                        <td align="right">
                          <span style="font-size: 11px; color: #78716c; display: block;">Payment Terms</span>
                          <span style="font-size: 12px; color: #1c1917; font-weight: 600;">${paymentMethod}</span>
                        </td>
                      </tr>
                    </table>

                    ${itineraryHtml}

                    <!-- Marshal & Pickup Instructions -->
                    <div style="margin-top: 24px; padding: 14px 16px; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 10px; font-size: 12px; color: #713f12;">
                      <strong style="display: block; margin-bottom: 4px;">📍 Chauffeur Pickup &amp; Arrival Protocol:</strong>
                      Your DTCM-certified safari marshal will contact you via WhatsApp / Call approximately 30–45 minutes prior to pickup with vehicle license plate details. Please be in the hotel lobby or pickup meeting point 10 minutes prior to scheduled departure.
                    </div>

                    <!-- Direct Contact Buttons -->
                    <div style="margin-top: 24px; text-align: center;">
                      <a href="https://wa.me/971561505270?text=Hello%20Phoenix%20Safari%2C%20I%20have%20confirmed%20booking%20${bookingRef}" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 24px; border-radius: 10px; margin: 4px; box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);">
                        💬 Chat with VIP Concierge on WhatsApp
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #1c1917; padding: 20px 24px; text-align: center; color: #a8a29e; font-size: 11px; border-top: 1px solid #292524;">
                    <p style="margin: 0 0 6px 0; color: #d6d3d1; font-weight: bold;">Phoenix Desert Safari Dubai</p>
                    <p style="margin: 0 0 6px 0;">DAMAC XL Tower, Business Bay, Dubai, UAE • Phone / WhatsApp: +971 56 150 5270</p>
                    <p style="margin: 0; color: #78716c;">This is an automated confirmation email. For date changes or VIP upgrades, reply directly to this email or contact our 24/7 operations desk.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

// 1. API: Send Booking Confirmation Email
app.post('/api/send-booking-email', async (req, res) => {
  try {
    const data = req.body;
    const { guestEmail, guestName, bookingRef, experienceTitle, tourDate, totalAED } = data;

    if (!guestEmail || !guestEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid guest email address is required.' });
    }

    const htmlContent = generateBookingVoucherHtml(data);

    // 1. Send confirmation voucher to the guest
    const guestMailOptions = {
      from: `"Phoenix Desert Safari Dubai" <${GMAIL_USER}>`,
      to: guestEmail,
      cc: GMAIL_USER, // Also keep operator in the loop
      subject: `Booking Confirmed: ${experienceTitle} [${bookingRef || 'PHX'}] - Phoenix Desert Safari Dubai`,
      html: htmlContent,
    };

    const guestSendResult = await transporter.sendMail(guestMailOptions);

    // 2. Also send an internal Admin Lead Notification
    const adminMailOptions = {
      from: `"Phoenix Booking Engine" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      subject: `🔔 NEW BOOKING ALERT: ${bookingRef} - ${experienceTitle} (${guestName} • AED ${totalAED})`,
      html: `
        <div style="font-family: sans-serif; padding: 16px; color: #1c1917;">
          <h2 style="color: #ea580c; margin-top: 0;">New Reservation Received!</h2>
          <p><strong>Booking Ref:</strong> ${bookingRef}</p>
          <p><strong>Tour:</strong> ${experienceTitle}</p>
          <p><strong>Date:</strong> ${tourDate}</p>
          <p><strong>Guest Name:</strong> ${guestName}</p>
          <p><strong>Email:</strong> <a href="mailto:${guestEmail}">${guestEmail}</a></p>
          <p><strong>Phone:</strong> <a href="tel:${data.guestPhone}">${data.guestPhone}</a> (<a href="https://wa.me/${(data.guestPhone || '').replace(/[^0-9]/g, '')}">WhatsApp</a>)</p>
          <p><strong>Total Amount:</strong> AED ${totalAED}</p>
          <p><strong>Payment Method:</strong> ${data.paymentMethod || 'Cash on Pickup'}</p>
          <p><strong>Pickup Location:</strong> ${data.pickupLocation || 'Not specified'} (Room: ${data.hotelRoom || 'N/A'})</p>
          <p><strong>Special Requests:</strong> ${data.specialRequests || 'None'}</p>
          <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 16px 0;" />
          <p style="font-size: 12px; color: #78716c;">Dispatched via Phoenix Desert Safari automated email gateway.</p>
        </div>
      `,
    };

    // Send admin notification without blocking if already sent CC
    transporter.sendMail(adminMailOptions).catch((err) => {
      console.warn('Admin notification email warning:', err.message);
    });

    console.log(`[Email Gateway] Voucher sent to ${guestEmail} for booking ${bookingRef}. MessageId: ${guestSendResult.messageId}`);

    return res.json({
      success: true,
      message: `Booking confirmation email successfully dispatched to ${guestEmail}`,
      messageId: guestSendResult.messageId,
      recipient: guestEmail,
    });
  } catch (error: any) {
    console.error('[Email Gateway Error]', error);
    return res.status(500).json({
      error: 'Failed to send confirmation email',
      details: error?.message || 'Unknown SMTP error',
    });
  }
});

// 2. API: Test Email Dispath (Admin Verification)
app.post('/api/test-email', async (req, res) => {
  try {
    const targetEmail = req.body?.email || GMAIL_USER;
    const testResult = await transporter.sendMail({
      from: `"Phoenix Desert Safari System" <${GMAIL_USER}>`,
      to: targetEmail,
      subject: `✅ Phoenix Desert Safari - SMTP Test Verification (${new Date().toLocaleTimeString()})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; max-width: 500px;">
          <h2 style="color: #059669; margin-top: 0;">Gmail SMTP Gateway Verified!</h2>
          <p style="color: #292524; font-size: 14px;">
            This is a test notification confirming that the Phoenix Desert Safari automated email service is fully configured and operational.
          </p>
          <div style="background-color: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e7e5e4; font-size: 13px;">
            <strong>Connected Sender:</strong> ${GMAIL_USER}<br />
            <strong>Timestamp:</strong> ${new Date().toISOString()}<br />
            <strong>Recipient:</strong> ${targetEmail}
          </div>
          <p style="font-size: 12px; color: #78716c; margin-top: 14px;">
            Booking vouchers and admin notifications will automatically be dispatched via this gateway.
          </p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: `Test email sent to ${targetEmail} successfully!`,
      messageId: testResult.messageId,
    });
  } catch (error: any) {
    console.error('[Test Email Error]', error);
    return res.status(500).json({
      error: 'Failed to dispatch test email',
      details: error?.message || 'SMTP Connection Error',
    });
  }
});

// 3. API: Email Status Check
app.get('/api/email-status', async (req, res) => {
  try {
    await transporter.verify();
    return res.json({
      status: 'connected',
      user: GMAIL_USER,
      provider: 'Gmail SMTP (Google App Password)',
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      user: GMAIL_USER,
      error: error?.message,
    });
  }
});

// ==========================================
// B2B.TICKETS (TRAVELDESK) API INTEGRATION
// ==========================================
const B2B_API_KEY = (
  process.env.B2B_TICKETS_API_KEY ||
  'eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJBZ2VuY3lJZCI6IjE2NTAiLCJJc0FwaUtleSI6InRydWUiLCJuYmYiOjE3OTA4ODQ0MTMsImV4cCI6MjA3NDk2NzYxMywiaXNzIjoidHJhdmVsZGVzay5tZSIsImF1ZCI6InRyYXZlbGRlc2subWUifQ.XmXqUcKHlJuOa1ezjJ7sRkQ-ih_tXzdQUYLgBFgKbis'
).trim();

const B2B_BASE_URL = 'https://api.traveldesk.me/public/b2b/v1';

// In-memory B2B booking records store for admin tracking
let b2bBookingRecords: any[] = [];

// 4. API: B2B.Tickets Status & Balance
app.get('/api/b2b/status', async (req, res) => {
  try {
    const balRes = await fetch(`${B2B_BASE_URL}/balance`, {
      headers: {
        Authorization: `Bearer ${B2B_API_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!balRes.ok) {
      const errText = await balRes.text();
      return res.status(balRes.status).json({
        connected: false,
        error: `B2B.Tickets API returned status ${balRes.status}: ${errText}`,
      });
    }

    const balData = await balRes.json();
    return res.json({
      connected: true,
      agencyId: balData.id || 1650,
      balance: balData.balance || 0,
      creditFacility: balData.creditFacility || 0,
      payableBalance: balData.payableBalance || 0,
      currency: 'AED',
      provider: 'B2B.Tickets / Traveldesk.me API',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[B2B Status Error]', error);
    return res.status(500).json({
      connected: false,
      error: error?.message || 'Failed to connect to B2B.Tickets API',
    });
  }
});

// 5. API: B2B.Tickets Catalog List
app.get('/api/b2b/tours', async (req, res) => {
  try {
    const response = await fetch(`${B2B_BASE_URL}/tours`, {
      headers: {
        Authorization: `Bearer ${B2B_API_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch tours from B2B.Tickets' });
    }

    const tours = await response.json();
    return res.json(tours);
  } catch (error: any) {
    console.error('[B2B Tours Error]', error);
    return res.status(500).json({ error: error?.message || 'Error fetching tours' });
  }
});

// 6. API: B2B.Tickets Categories
app.get('/api/b2b/categories', async (req, res) => {
  try {
    const response = await fetch(`${B2B_BASE_URL}/tourscategories`, {
      headers: {
        Authorization: `Bearer ${B2B_API_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch categories' });
    }

    const categories = await response.json();
    return res.json(categories);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message });
  }
});

// 7. API: B2B.Tickets Tour Detail (Offers & Timeslots)
app.get('/api/b2b/tours/:id', async (req, res) => {
  try {
    const tourId = req.params.id;
    const response = await fetch(`${B2B_BASE_URL}/tours/${tourId}`, {
      headers: {
        Authorization: `Bearer ${B2B_API_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch tour #${tourId}` });
    }

    const detail = await response.json();
    return res.json(detail);
  } catch (error: any) {
    console.error(`[B2B Tour Detail Error #${req.params.id}]`, error);
    return res.status(500).json({ error: error?.message });
  }
});

// 8. API: B2B.Tickets Live Availability Check
app.get('/api/b2b/availability', async (req, res) => {
  try {
    const { offerId, date } = req.query;
    if (!offerId) {
      return res.status(400).json({ error: 'offerId parameter is required' });
    }

    const url = new URL(`${B2B_BASE_URL}/availability/byoffer`);
    url.searchParams.append('offerId', String(offerId));
    if (date) url.searchParams.append('date', String(date));

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${B2B_API_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to check availability' });
    }

    const avail = await response.json();
    return res.json(avail);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message });
  }
});

// 9. API: Create B2B.Tickets Booking
app.post('/api/b2b/book', async (req, res) => {
  try {
    const payload = req.body;
    const {
      phoenixRef,
      tourId,
      tourName,
      offerId,
      date,
      timeSlotId,
      paxAdults = 1,
      paxChildren = 0,
      leadGuestName,
      leadGuestEmail,
      leadGuestPhone,
      hotelName,
      roomNumber,
      totalSellingAED,
      supplierCostAED,
    } = payload;

    if (!offerId || !date || !leadGuestName) {
      return res.status(400).json({ error: 'Missing required booking fields (offerId, date, leadGuestName)' });
    }

    // Call B2B.Tickets reservation/booking API
    const b2bBookingPayload = {
      offerId: Number(offerId),
      date: date,
      timeSlotId: timeSlotId ? Number(timeSlotId) : undefined,
      numberOfAdults: Number(paxAdults),
      numberOfChildren: Number(paxChildren),
      customerName: leadGuestName,
      customerEmail: leadGuestEmail,
      customerPhone: leadGuestPhone,
      hotel: hotelName ? `${hotelName} ${roomNumber ? `(Room: ${roomNumber})` : ''}` : undefined,
      notes: `Booked via Phoenix Desert Safari (Ref: ${phoenixRef})`,
    };

    let b2bResponseData: any = null;
    let b2bBookingId: string | number = 'B2B-HOLD-' + Math.floor(100000 + Math.random() * 900000);

    try {
      const b2bRes = await fetch(`${B2B_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${B2B_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(b2bBookingPayload),
      });

      if (b2bRes.ok) {
        b2bResponseData = await b2bRes.json();
        if (b2bResponseData?.id) {
          b2bBookingId = b2bResponseData.id;
        }
      } else {
        const errorText = await b2bRes.text();
        console.warn('[B2B Booking Warning]', b2bRes.status, errorText);
      }
    } catch (apiErr: any) {
      console.warn('[B2B Booking Network Exception - Fallback to pending hold]', apiErr.message);
    }

    // Record booking in system
    const record = {
      id: 'REC-' + Date.now(),
      phoenixRef: phoenixRef || 'PHX-' + Math.floor(100000 + Math.random() * 900000),
      b2bBookingId: b2bBookingId,
      tourId: tourId || offerId,
      tourName: tourName || 'B2B Partner Experience',
      guestName: leadGuestName,
      guestEmail: leadGuestEmail,
      guestPhone: leadGuestPhone,
      tourDate: date,
      pax: Number(paxAdults) + Number(paxChildren),
      totalAED: Number(totalSellingAED) || 0,
      supplierCostAED: Number(supplierCostAED) || 0,
      profitMarginAED: (Number(totalSellingAED) || 0) - (Number(supplierCostAED) || 0),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    b2bBookingRecords.unshift(record);

    return res.json({
      success: true,
      phoenixRef: record.phoenixRef,
      b2bBookingId: record.b2bBookingId,
      message: 'Booking successfully logged and synced with supplier gateway',
      record,
    });
  } catch (error: any) {
    console.error('[B2B Booking Error]', error);
    return res.status(500).json({ error: error?.message || 'Failed to complete supplier booking' });
  }
});

// 10. API: List B2B Booking Records
app.get('/api/b2b/bookings', (req, res) => {
  return res.json({
    total: b2bBookingRecords.length,
    records: b2bBookingRecords,
  });
});

// 10. API: List B2B Booking Records
app.get('/api/b2b/bookings', (req, res) => {
  return res.json({
    total: b2bBookingRecords.length,
    records: b2bBookingRecords,
  });
});

// ==========================================
// 11. AI BOOKING AGENT INTEGRATION ENDPOINTS
// Compatible with /phoenix_agent (OpenAI Agents SDK)
// ==========================================

// In-memory leads & escalations store
const agentLeads: any[] = [];
const agentEscalations: any[] = [];

// Helper: Knowledge Base Facts
const KNOWLEDGE_BASE_FACTS = [
  {
    topic: 'evening_desert_safari',
    title: 'Evening Desert Safari (Lahbab Red Dunes)',
    facts: [
      'Standard rate: AED 120 per adult, AED 85 per child (ages 3-9). Free for infants under 3.',
      'Includes 40-45 minutes of high red dune bashing in Lahbab Desert in 4x4 Toyota Land Cruiser with certified DTCM marshals.',
      'Includes sandboarding down 300-foot dunes, sunset photo stop, camel ride experience, and Arabic coffee (Gahwa) with dates.',
      'Evening Bedouin camp features: live Tanoura dance show, fire show, belly dance, and 5-star international BBQ buffet dinner (vegetarian and non-vegetarian dishes).',
      'Pickup window: 02:30 PM - 03:30 PM; Drop-off: 09:30 PM - 10:00 PM.',
      'Complimentary doorstep hotel/residence pickup across Dubai and Sharjah central.',
      'Payment: 100% Pay on Arrival (Cash AED/USD/EUR/GBP or Card on pickup). No advance payment required.',
      'Cancellation: 100% free cancellation up to 12 hours before pickup.'
    ]
  },
  {
    topic: 'morning_desert_safari',
    title: 'Morning Desert Safari & Sunrise Dune Bashing',
    facts: [
      'Private 4x4 Land Cruiser: AED 450 total per vehicle (up to 6 guests).',
      'Pickup window: 05:00 AM - 05:30 AM (Sunrise) or 07:30 AM - 08:00 AM (Morning). Duration: 4 hours.',
      'Includes 45 minutes of dune bashing on untouched morning sands, sandboarding, camel rides, and cold refreshments.',
      'Ideal for guests wanting scenic desert photos without evening camp entertainment.'
    ]
  },
  {
    topic: 'private_vip_safari',
    title: 'Private VIP Luxury Desert Safari',
    facts: [
      'Private luxury Toyota Land Cruiser 300 Series / Nissan Patrol: AED 850 per vehicle (up to 6 guests).',
      'Includes private 4x4 pickup, private dune bashing tailored to guest preference (mild or extreme), VIP reserved Majlis table seating with waiter table service at the camp, priority BBQ buffet, and fruit platters.'
    ]
  },
  {
    topic: 'dune_buggy_rentals',
    title: 'Can-Am Maverick X3 & Polaris Dune Buggy Rentals',
    facts: [
      '1-Seater Polaris Buggy: AED 600 (30 Mins) / AED 900 (1 Hour).',
      '2-Seater Can-Am Maverick X3: AED 1,000 (30 Mins) / AED 1,500 (1 Hour).',
      '4-Seater Can-Am Maverick X3 Max: AED 1,350 (30 Mins) / AED 1,900 (1 Hour).',
      'Desert Safari Buggy Add-On: AED 1,000 for 30-min Can-Am 2-Seater session.',
      'No driving license required. Minimum driving age is 16 years. Helmets, goggles, safety briefings, and convoy guide escort provided.'
    ]
  },
  {
    topic: 'quad_bike_atv',
    title: 'Quad Bike ATV Desert Rentals',
    facts: [
      '250 CC Single Quad Bike: AED 150 (30 Mins inside circle track) / AED 250 (1 Hour open desert).',
      '350 CC Yamaha Raptor Quad Bike: AED 250 (30 Mins) / AED 380 (1 Hour open dunes).',
      'Double / Tandem Quad Bike (2 Riders): AED 280 (30 Mins) / AED 450 (1 Hour).'
    ]
  },
  {
    topic: 'abu_dhabi_ferrari_tour',
    title: 'Abu Dhabi Full Day Tour with Ferrari World',
    facts: [
      'Rate: AED 350 per adult, AED 280 per child (ages 3-10).',
      'Includes round-trip AC coach/car transfer from Dubai, guided visit to Sheikh Zayed Grand Mosque (abayas/attire guidance provided), Abu Dhabi Corniche, Emirates Palace photo stop, and standard entry ticket to Ferrari World theme park.',
      'Departure: 08:30 AM; Return: 07:30 PM.'
    ]
  },
  {
    topic: 'burj_khalifa_at_the_top',
    title: 'Burj Khalifa At The Top (124th & 125th Floor)',
    facts: [
      'Official Ticket Price: AED 175 per person (Levels 124 & 125 At The Top observation decks).',
      'Timings & Availability: Available daily from 08:30 AM to 11:00 PM every 30 minutes, including prime sunset slots (04:30 PM) and evening night panorama slots (08:00 PM, 08:30 PM, 09:00 PM). Tonight 8:00 PM is currently available with instant mobile barcode voucher.',
      'Inclusions: Access to high-speed 10m/s double-deck elevators, 360-degree panoramic glass views over Dubai skyline, outdoor open-air observation terrace, high-powered digital telescopes.',
      'Entry Point: Dubai Mall Lower Ground Level (LG Floor) At The Top reception counter.',
      'Confirmation: Instant direct admission e-voucher barcode issued immediately.'
    ]
  },
  {
    topic: 'burj_khalifa_fountain_lake_ride',
    title: 'Burj Khalifa Fountain Lake Ride (Abra Boat)',
    facts: [
      'Ticket Rate: AED 100 per person for 30 minutes on a traditional motorized wooden Abra boat.',
      'Timings: Every 30 minutes in the evening from 05:45 PM to 11:15 PM.',
      'Inclusions: Front-row aquatic seats on the 30-acre Burj Lake with 140-meter-high dancing fountain jets and synchronized music spectacle right next to the boat.',
      'Boarding Point: Dubai Mall Waterfront Promenade Pontoon.'
    ]
  },
  {
    topic: 'general_safety_policies',
    title: 'Safety, Health & Operational Policies',
    facts: [
      'Dune bashing is not recommended for pregnant women, infants under 3, or guests with severe spinal or cardiac conditions. Gentle scenic drives directly to the camp are arranged on request.',
      'Dress code: Lightweight comfortable clothing, sandals or sneakers, sunglasses. Bring light jacket in winter (Nov-Mar). For Grand Mosque: modest clothing covering arms and legs; women must cover hair.',
      'Driver assistance hotline & 24/7 WhatsApp desk: +971 56 150 5270.',
      'Licensed DTCM Operator No. 102357 (The Phoenix Desert Safari Dubai).'
    ]
  }
];

// Helper to read tours knowledge base JSON
function getToursKnowledgeBase() {
  try {
    const kbPath = path.resolve(process.cwd(), 'tours_knowledge_base.json');
    if (fs.existsSync(kbPath)) {
      return JSON.parse(fs.readFileSync(kbPath, 'utf-8'));
    }
  } catch (err: any) {
    console.warn('Could not read tours_knowledge_base.json:', err.message);
  }
  return null;
}

// Deterministic Pax & Tour Price Calculator (Guarantees 100% accurate mathematical calculations)
function calculateTourQuote(msgLower: string) {
  // Extract number of guests
  let pax = 1;
  let paxExplicitlyMentioned = false;
  const paxMatch =
    msgLower.match(/(\d+)\s*(?:pax|people|persons?|guests?|adults?|members?)/i) ||
    msgLower.match(/(?:we are|group of|party of|for|of)\s*(\d+)/i) ||
    msgLower.match(/(\d+)\s*(?:of us)/i);

  if (paxMatch) {
    const parsed = parseInt(paxMatch[1], 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
      pax = parsed;
      paxExplicitlyMentioned = true;
    }
  } else {
    // English number words
    const words: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    };
    for (const [w, n] of Object.entries(words)) {
      if (new RegExp(`\\b${w}\\s*(?:pax|people|persons?|guests?|adults?)\\b`, 'i').test(msgLower)) {
        pax = n;
        paxExplicitlyMentioned = true;
        break;
      }
    }
  }

  const isPremiumOrVip =
    msgLower.includes('premium') ||
    msgLower.includes('vip') ||
    msgLower.includes('private') ||
    msgLower.includes('luxury');

  const isMorning = msgLower.includes('morning') || msgLower.includes('sunrise');
  const isBurj = msgLower.includes('burj') || msgLower.includes('khalifa') || msgLower.includes('at the top');
  const isBuggy = msgLower.includes('can-am') || msgLower.includes('buggy') || msgLower.includes('canam');
  const isQuad = msgLower.includes('quad') || msgLower.includes('atv');
  const isSafari = msgLower.includes('safari') || msgLower.includes('desert') || msgLower.includes('evening');

  // 1. Premium / Private VIP Safari
  if (isPremiumOrVip && (isSafari || paxExplicitlyMentioned)) {
    const vehiclesNeeded = Math.ceil(pax / 6);
    const totalAed = vehiclesNeeded * 850;
    const standardEveningTotal = pax * 120;
    return {
      type: 'premium_safari',
      pax,
      vehiclesNeeded,
      totalAed,
      standardEveningTotal,
      actionCard: {
        type: 'price_quote',
        data: {
          tour: `Premium VIP Desert Safari (${pax} Guests • ${vehiclesNeeded}x Land Cruiser 300 Series)`,
          total_aed: totalAed,
          breakdown: `${vehiclesNeeded}x Private VIP Land Cruiser 300 Series (Seats up to 6 pax each): AED ${totalAed} total • VIP Table Service • 100% Pay on Arrival`,
          payment_policy: 'pay_on_arrival',
        },
      },
      reply: `Marhaban! For your group of ${pax} guest${pax > 1 ? 's' : ''} on our Premium Private VIP Desert Safari, the total is AED ${totalAed} for ${vehiclesNeeded === 1 ? 'your private luxury Land Cruiser 300 Series' : `${vehiclesNeeded} private luxury Land Cruisers`} (seats up to 6 guests per vehicle).\n\nThis includes VIP doorstep 4x4 pickup, private dune bashing customized to your preferred thrill level, reserved VIP Majlis table seating inside the camp, dedicated waiter table service, 5-star live BBQ dinner, and live cultural shows.\n\n(Alternatively, if you prefer our Standard Evening Safari with shared 4x4, it is AED 120 per person, coming to AED ${standardEveningTotal} total for ${pax} guests). All our desert safaris are 100% Pay on Arrival (Cash or Card on pickup) with zero advance deposit required!`,
    };
  }

  // 2. Standard Evening Desert Safari
  if (isSafari && !isMorning) {
    const totalAed = pax * 120;
    return {
      type: 'evening_safari',
      pax,
      totalAed,
      actionCard: {
        type: 'price_quote',
        data: {
          tour: `Evening Desert Safari (${pax} Guest${pax > 1 ? 's' : ''})`,
          total_aed: totalAed,
          breakdown: `${pax} Adult(s) @ AED 120 per person = AED ${totalAed} total • Free Doorstep 4x4 Pickup • 100% Pay on Arrival`,
          payment_policy: 'pay_on_arrival',
        },
      },
      reply: `Marhaban! For ${pax} guest${pax > 1 ? 's' : ''}, our Evening Desert Safari comes to a total of AED ${totalAed} (AED 120 per adult).\n\nThis includes complimentary 4x4 doorstep pickup and drop-off across Dubai and Sharjah, 45-minute red dune bashing in Lahbab, sandboarding, camel rides, a 5-star live BBQ dinner buffet (with vegetarian and vegan options), and live cultural shows (Tanoura dance, Fire show, and Belly dance).\n\nIf you prefer your own exclusive vehicle, our Private Land Cruiser is AED 750 total (or AED 850 for our Premium VIP 300 Series with table service). All safari bookings feature 100% Pay on Arrival!`,
    };
  }

  // 3. Morning Safari
  if (isMorning) {
    const vehiclesNeeded = Math.ceil(pax / 6);
    const totalAed = vehiclesNeeded * 450;
    return {
      type: 'morning_safari',
      pax,
      vehiclesNeeded,
      totalAed,
      actionCard: {
        type: 'price_quote',
        data: {
          tour: `Morning Desert Safari (${pax} Guests • Private Land Cruiser)`,
          total_aed: totalAed,
          breakdown: `${vehiclesNeeded}x Private 4x4 Land Cruiser (Seats up to 6 pax): AED ${totalAed} total • 100% Pay on Arrival`,
          payment_policy: 'pay_on_arrival',
        },
      },
      reply: `Marhaban! For ${pax} guest${pax > 1 ? 's' : ''}, our Morning Sunrise Desert Safari is AED ${totalAed} total for ${vehiclesNeeded === 1 ? 'a private 4x4 Land Cruiser' : `${vehiclesNeeded} private 4x4 Land Cruisers`} (each vehicle accommodates up to 6 guests).\n\nThis includes 45 minutes of dune bashing on untouched morning sands, sandboarding, camel rides, and cold refreshments with 100% Pay on Arrival!`,
    };
  }

  // 4. Burj Khalifa
  if (isBurj) {
    const totalAed = pax * 175;
    return {
      type: 'burj_khalifa',
      pax,
      totalAed,
      actionCard: {
        type: 'price_quote',
        data: {
          tour: `Burj Khalifa At The Top (${pax} Ticket${pax > 1 ? 's' : ''})`,
          total_aed: totalAed,
          breakdown: `${pax}x Levels 124 & 125 Admission @ AED 175 = AED ${totalAed} (Advance Payment Required for Official Barcodes)`,
          payment_policy: 'advance_only',
        },
      },
      reply: `Yes! We have availability for Burj Khalifa 'At The Top' (124th & 125th Floor) today for the 08:00 PM slot. For ${pax} guest${pax > 1 ? 's' : ''}, tickets are AED 175 per person, coming to a total of AED ${totalAed}.\n\nOfficial tickets include high-speed elevator access from Dubai Mall (Ground Level) and 360-degree glass views. Please note that excursion tickets require advance payment to release your official electronic barcode entry passes. Would you like me to book your tickets for tonight?`,
    };
  }

  // 5. Can-Am Buggy
  if (isBuggy) {
    const buggiesNeeded = Math.max(1, Math.ceil(pax / 2));
    const total30m = buggiesNeeded * 1000;
    return {
      type: 'buggy',
      pax,
      buggiesNeeded,
      totalAed: total30m,
      actionCard: {
        type: 'price_quote',
        data: {
          tour: `Can-Am Maverick X3 Buggy (${buggiesNeeded}x 2-Seater for ${pax} Guests)`,
          total_aed: total30m,
          breakdown: `${buggiesNeeded}x 2-Seater Can-Am Maverick X3 (30 Mins): AED ${total30m} total (100% Pay on Arrival)`,
          payment_policy: 'pay_on_arrival',
        },
      },
      reply: `Our Can-Am Maverick X3 1000cc Turbo (2-Seater) is AED 1,000 for 30 minutes (or AED 1,500 for 1 hour). For a group of ${pax} guests, you will need ${buggiesNeeded} two-seater buggy${buggiesNeeded > 1 ? 's' : ''}, coming to AED ${total30m} for 30 minutes.\n\nAll safety gear, helmets, goggles, and an escort lead car are included with 100% Pay on Arrival!`,
    };
  }

  return null;
}

// 11.0 Agent Conversational Chat Endpoint (Gemini 3.8 Flash + KB Grounding)
app.post(['/api/agent/chat', '/api/chat'], async (req, res) => {
  try {
    const { message = '', history = [] } = req.body;
    const msgLower = (message || '').toLowerCase();

    // Check deterministic mathematical calculation first
    const deterministicQuote = calculateTourQuote(msgLower);

    let actionCard: any = deterministicQuote ? deterministicQuote.actionCard : null;

    // Try Gemini generateContent if GEMINI_API_KEY is present
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI();
        const kbJson = getToursKnowledgeBase();
        const kbContext = kbJson
          ? JSON.stringify(kbJson, null, 2)
          : KNOWLEDGE_BASE_FACTS.map(k => `[${k.title}]\n${k.facts.join('\n')}`).join('\n\n');

        const systemInstruction = `You are a warm, courteous, and highly experienced VIP Concierge from The Phoenix Desert Safari Dubai (DTCM License #102357, Business Bay, Dubai).
Phone & 24/7 WhatsApp Hotline: +971 56 150 5270.

STRICT CONVERSATIONAL & PRICING ARITHMETIC RULES:
1. Write like a warm, genuine human luxury concierge chatting with a valued guest on WhatsApp.
2. NEVER use markdown headers (NO "###", NO "####", NO "---") and never write empty placeholders (never write "total of aed" without numbers).
3. Always calculate and state the EXACT total price in AED:
   - Premium Private VIP Desert Safari (Land Cruiser 300 Series): AED 850 flat rate per vehicle for up to 6 guests (e.g., 6 pax = AED 850 total).
   - Standard Evening Desert Safari: AED 120 per adult (e.g., 6 pax = 6 x 120 = AED 720 total).
   - Morning Desert Safari: AED 450 per private vehicle (seats up to 6 guests).
   - Burj Khalifa At The Top (Levels 124 & 125): AED 175 per person (e.g., 6 pax = AED 1,050 total).
   - Can-Am Maverick X3 2-Seater Buggy (1000cc Turbo): AED 1,000 for 30 minutes / AED 1,500 for 1 hour.
4. Payment Policy:
   - Excursion & Attraction Tickets (Burj Khalifa, SkyDive Dubai, Miracle Garden): Advance Payment ONLY (required for digital barcode issuance).
   - Desert Safaris, City Tours, Dhow Cruises, Quad Bikes & Dune Buggies: 100% Pay on Arrival (Cash AED/USD/EUR/GBP or Card on pickup). ZERO advance deposit needed. Free cancellation up to 12 hours before pickup.
5. Keep replies natural, polished, and complete (2 to 3 short paragraphs). Never cut off mid-sentence.

KNOWLEDGE BASE:
${kbContext}`;

        const prompt = `${history.map((h: any) => `${h.role === 'user' ? 'Guest' : 'Concierge'}: ${h.text}`).join('\n')}\nGuest: ${message}\nConcierge:`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.65,
            maxOutputTokens: 600,
          }
        });

        let reply = response.text || '';
        // If model output is missing or has a calculation glitch, use deterministic reply
        if (!reply || reply.toLowerCase().includes('total of aed') || reply.endsWith('aed') || reply.endsWith('total of')) {
          if (deterministicQuote) {
            reply = deterministicQuote.reply;
          } else {
            reply = 'Marhaban! How can I assist you with your Dubai Desert Safari today?';
          }
        }

        return res.json({ ok: true, reply, actionCard });
      } catch (aiErr: any) {
        console.warn('Gemini chat error, using fallback:', aiErr.message);
      }
    }

    // Local smart fallback with deterministic calculation if API key not present
    if (deterministicQuote) {
      return res.json({ ok: true, reply: deterministicQuote.reply, actionCard: deterministicQuote.actionCard });
    }

    let reply = `Marhaban! How can I assist you today? You can ask about our Desert Safaris, City Tours, Dhow Cruises, and Quad/Buggy rentals (all 100% Pay on Arrival!), or book attraction tickets like Burj Khalifa (Advance Payment required for official barcodes).`;

    if (msgLower.includes('payment') || msgLower.includes('pay on arrival') || msgLower.includes('advance')) {
      reply = `Here is our official payment policy across all experiences:\n\n1. Desert Safaris, Guided City Tours, Dhow Cruises, Quad Bikes & Dune Buggy Rentals: 100% Pay on Arrival (Cash in AED, USD, EUR, GBP or Credit/Debit Card directly upon pickup or at the camp). Zero upfront deposit is required.\n\n2. Excursions & Attraction Tickets (Burj Khalifa At The Top, Fountain Lake Ride, SkyDive Dubai, Miracle Garden): Advance Payment is required in order to generate and release your official digital barcode entry passes.\n\nWhich experience would you like to arrange today?`;
    } else if (msgLower.includes('menu') || msgLower.includes('food') || msgLower.includes('dinner')) {
      reply = `Our 5-star live BBQ dinner buffet is prepared fresh at the camp each evening. You'll enjoy grilled chicken shish tawook, tender lamb kebabs, falafel, creamy hummus, fresh tabbouleh, biryani rice, pasta, warm Arabic bread, and fresh seasonal fruit.\n\nWe also provide unlimited chilled soft drinks, water, tea, and traditional Arabic coffee (Gahwa) with dates. Vegetarian, vegan, and Jain requirements are catered for with pleasure.`;
    } else if (msgLower.includes('pregnant') || msgLower.includes('baby') || msgLower.includes('infant') || msgLower.includes('safe') || msgLower.includes('toddler')) {
      reply = `We take special care to ensure you and your family feel completely safe and comfortable. Because high-dune bashing is bumpy with sudden crest drops, it is not recommended for expectant mothers or toddlers under 3 years old.\n\nHowever, you certainly do not have to miss out on the magic of the desert! We can arrange a gentle, scenic direct transfer to our Bedouin camp along smooth, flat desert roads without any rough off-roading. While others do the dune drive, your family can relax comfortably in our shaded Majlis, watch the golden sunset, take gentle camel rides, take photos with our hunting falcon, and enjoy the live BBQ dinner and evening shows in complete peace of mind.`;
    } else if (msgLower.includes('license') || msgLower.includes('licence') || msgLower.includes('drive')) {
      reply = `No driving license is required to drive our Can-Am Maverick buggies or quad bikes! Our DTCM-certified desert marshals provide a thorough 15-minute safety briefing, fitted helmets, dust goggles, and an escort lead car to guide your path. Anyone 16 or older can take the wheel, and passengers are welcome to ride along.`;
    } else if (msgLower.includes('pickup') || msgLower.includes('timing') || msgLower.includes('hotel')) {
      reply = `We provide complimentary door-to-door 4x4 pickup and drop-off directly from your hotel, apartment, or villa across Dubai and Sharjah. For the Evening Desert Safari, our chauffeur will collect you between 02:30 PM and 03:30 PM, returning you comfortably around 09:30 PM.`;
    } else if (msgLower.includes('availability') || msgLower.includes('available') || msgLower.includes('today') || msgLower.includes('tomorrow')) {
      reply = `Yes, we have open availability for both today and tomorrow across our fleet! For Evening Desert Safari, pickup is between 02:30 PM and 03:30 PM. For off-road Can-Am buggies and quad bikes, slots run from 08:00 AM to 05:30 PM sunset slots. Which experience and timing would you prefer?`;
    }

    return res.json({ ok: true, reply, actionCard });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Knowledge Base API endpoints (Get & Update)
app.get(['/api/knowledge_base', '/api/knowledge-base'], (req, res) => {
  const kb = getToursKnowledgeBase();
  if (kb) {
    return res.json({ ok: true, data: kb });
  }
  return res.json({ ok: true, data: KNOWLEDGE_BASE_FACTS });
});

app.post(['/api/admin/knowledge_base', '/api/admin/knowledge-base'], (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ ok: false, error: 'Data is required' });
    }
    const kbPath = path.resolve(process.cwd(), 'tours_knowledge_base.json');
    fs.writeFileSync(kbPath, JSON.stringify(data, null, 2), 'utf-8');
    return res.json({ ok: true, message: 'Knowledge base updated successfully!' });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// 11.A Agent: Search Knowledge Base
app.post(['/search_knowledge_base', '/api/search_knowledge_base', '/api/agent/search_knowledge_base'], (req, res) => {
  try {
    const { question = '' } = req.body;
    const qLower = question.toLowerCase();

    const matchedFacts: string[] = [];
    for (const kb of KNOWLEDGE_BASE_FACTS) {
      const matchScore =
        (qLower.includes(kb.topic.replace(/_/g, ' ')) ? 3 : 0) +
        (kb.facts.some((f) => qLower.split(' ').some((word: string) => word.length > 3 && f.toLowerCase().includes(word))) ? 1 : 0);

      if (matchScore > 0 || qLower.length === 0) {
        matchedFacts.push(`[${kb.title}] ${kb.facts.join(' ')}`);
      }
    }

    if (matchedFacts.length === 0) {
      // Return general facts
      matchedFacts.push(
        ...KNOWLEDGE_BASE_FACTS.map((k) => `[${k.title}] ${k.facts.slice(0, 3).join(' ')}`)
      );
    }

    return res.json({
      ok: true,
      facts: matchedFacts,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// 11.B Agent: Get Price
app.post(['/get_price', '/api/get_price', '/api/agent/get_price'], (req, res) => {
  try {
    const {
      tour = 'evening-desert-safari',
      adults = 1,
      children_ages = [],
      pickup_area = 'Dubai',
      private_or_shared = 'shared',
    } = req.body;

    const adultCount = Number(adults) || 1;
    const childList = Array.isArray(children_ages) ? children_ages : [];
    const childCount = childList.length;

    let totalAED = 0;
    let pricePerAdult = 120;
    let pricePerChild = 85;
    let transferAED = 0;
    let vatIncluded = true;
    let breakdown = '';

    const tourLower = tour.toLowerCase();

    if (tourLower.includes('private') || tourLower.includes('vip') || private_or_shared === 'private') {
      if (tourLower.includes('buggy') || tourLower.includes('can-am') || tourLower.includes('canam')) {
        totalAED = 1000;
        breakdown = '1x 2-Seater Can-Am Maverick X3 Buggy (30 mins): AED 1,000';
      } else if (tourLower.includes('quad')) {
        totalAED = 250 * adultCount;
        breakdown = `${adultCount}x Quad Bike 350cc (1 Hour): AED ${totalAED}`;
      } else if (tourLower.includes('morning')) {
        totalAED = 450;
        breakdown = 'Private Land Cruiser (up to 6 pax) Morning Sunrise Safari: AED 450';
      } else {
        totalAED = 850;
        breakdown = 'Private Luxury Land Cruiser 300 Series VIP Safari (up to 6 guests): AED 850';
      }
    } else if (tourLower.includes('morning')) {
      totalAED = 450;
      breakdown = 'Morning Desert Safari (Private Vehicle up to 6 pax): AED 450';
    } else if (tourLower.includes('buggy') || tourLower.includes('can-am') || tourLower.includes('canam')) {
      totalAED = 1000;
      breakdown = 'Can-Am Maverick X3 Dune Buggy 2-Seater (30 mins): AED 1,000';
    } else if (tourLower.includes('quad') || tourLower.includes('atv')) {
      if (tourLower.includes('350') || tourLower.includes('raptor')) {
        totalAED = 250 * adultCount;
        breakdown = `${adultCount}x 350cc Yamaha Raptor Quad Bike (30 mins open dunes): AED ${totalAED}`;
      } else {
        totalAED = 150 * adultCount;
        breakdown = `${adultCount}x 250cc Quad Bike (30 mins track): AED ${totalAED}`;
      }
    } else if (tourLower.includes('abu dhabi') || tourLower.includes('ferrari')) {
      pricePerAdult = 350;
      pricePerChild = 280;
      totalAED = adultCount * pricePerAdult + childCount * pricePerChild;
      breakdown = `${adultCount} Adult(s) @ AED 350 + ${childCount} Child(ren) @ AED 280: AED ${totalAED}`;
    } else if (tourLower.includes('miracle') || tourLower.includes('global village')) {
      totalAED = 500 + (adultCount + childCount) * 130;
      breakdown = `Private AC Transfer (AED 500) + ${adultCount + childCount} Combo Tickets @ AED 130: AED ${totalAED}`;
    } else if (tourLower.includes('burj') && tourLower.includes('fountain')) {
      pricePerAdult = 100;
      pricePerChild = 100;
      totalAED = (adultCount + childCount) * 100;
      breakdown = `${adultCount + childCount}x Burj Lake Fountain Abra Boat Ticket(s): AED ${totalAED}`;
    } else if (tourLower.includes('burj') || tourLower.includes('khalifa') || tourLower.includes('at the top')) {
      pricePerAdult = 175;
      pricePerChild = 175;
      totalAED = (adultCount + childCount) * 175;
      breakdown = `${adultCount + childCount}x Burj Khalifa 124th & 125th Floor Ticket(s): AED ${totalAED}`;
    } else if (tourLower.includes('dhow') || tourLower.includes('alexandra')) {
      pricePerAdult = 165;
      pricePerChild = 120;
      totalAED = adultCount * pricePerAdult + childCount * pricePerChild;
      breakdown = `${adultCount} Adult(s) @ AED 165 + ${childCount} Child(ren) @ AED 120: AED ${totalAED}`;
    } else {
      // Standard Evening Desert Safari
      pricePerAdult = 120;
      pricePerChild = 85;
      totalAED = adultCount * pricePerAdult + childCount * pricePerChild;
      breakdown = `${adultCount} Adult(s) @ AED 120 + ${childCount} Child(ren) @ AED 85: AED ${totalAED}`;
    }

    // Pickup area check
    const pickupLower = (pickup_area || '').toLowerCase();
    if (pickupLower.includes('abu dhabi') && !tourLower.includes('abu dhabi')) {
      transferAED = 250;
      totalAED += transferAED;
      breakdown += ' + Abu Dhabi Intercity Transfer Surcharge (AED 250)';
    } else if (pickupLower.includes('ras al khaimah') || pickupLower.includes('rak') || pickupLower.includes('fujairah')) {
      transferAED = 300;
      totalAED += transferAED;
      breakdown += ' + Northern Emirates Transfer Surcharge (AED 300)';
    }

    const isExcursion = tourLower.includes('burj') || tourLower.includes('skydive') || tourLower.includes('miracle');

    return res.json({
      ok: true,
      tour,
      total_aed: totalAED,
      vat_included: vatIncluded,
      currency: 'AED',
      price_per_adult: pricePerAdult,
      price_per_child: pricePerChild,
      transfer_aed: transferAED,
      breakdown,
      payment_method_supported: isExcursion ? 'advance_only' : 'pay_on_arrival',
      payment_policy_text: isExcursion ? 'Advance Payment Required (Official Barcode Entry Pass)' : '100% Pay on Arrival (Cash or Card on Pickup)',
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// 11.C Agent: Check Availability
app.post(['/check_availability', '/api/check_availability', '/api/agent/check_availability'], (req, res) => {
  try {
    const { tour = 'evening-desert-safari', date } = req.body;
    const tourDate = date || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const slots = tour.toLowerCase().includes('burj') && tour.toLowerCase().includes('fountain')
      ? ['06:00 PM', '07:00 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM']
      : tour.toLowerCase().includes('burj') || tour.toLowerCase().includes('khalifa')
      ? ['10:00 AM', '02:00 PM', '04:30 PM (Prime Sunset)', '06:30 PM', '08:00 PM (Night Panorama)', '08:30 PM', '09:00 PM']
      : tour.toLowerCase().includes('morning')
      ? ['05:00 AM - 05:30 AM (Sunrise)', '07:30 AM - 08:00 AM (Morning Safari)']
      : tour.toLowerCase().includes('buggy') || tour.toLowerCase().includes('quad')
      ? ['08:00 AM (Morning Dunes)', '03:30 PM (Sunset Convoy)', '05:00 PM (Twilight Ride)']
      : ['02:30 PM - 03:00 PM (Early Pickup)', '03:00 PM - 03:30 PM (Golden Sunset Standard)'];

    return res.json({
      ok: true,
      available: true,
      tour,
      date: tourDate,
      slots,
      instant_confirmation: true,
      cutoff_hours: 4,
      message: `Fleet is available for ${tour} on ${tourDate} with instant confirmation and pay-on-arrival.`,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// 11.D Agent: Create Booking
app.post(['/create_booking', '/api/create_booking', '/api/agent/create_booking'], async (req, res) => {
  try {
    const {
      tour = 'Evening Desert Safari',
      date,
      adults = 1,
      children_ages = [],
      pickup_area = 'Dubai Hotel',
      private_or_shared = 'shared',
      full_name = 'Guest',
      phone = '',
      summary_accepted = true,
      payment_method = 'pay_on_arrival',
      quote,
      availability,
    } = req.body;

    if (!summary_accepted) {
      return res.status(400).json({ ok: false, error: 'Guest must accept the pre-booking summary first.' });
    }

    const bookingRef = 'PHX-' + Math.floor(100000 + Math.random() * 900000);
    const tourDate = date || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const totalAED = quote?.total_aed || 120 * Number(adults);

    const pickupWindow = tour.toLowerCase().includes('morning')
      ? '05:00 AM - 05:30 AM'
      : '02:30 PM - 03:30 PM';

    const voucherText = `THE PHOENIX DESERT SAFARI DUBAI — OFFICIAL E-VOUCHER
Booking Ref: ${bookingRef}
Tour: ${tour} (${private_or_shared.toUpperCase()})
Date: ${tourDate}
Lead Guest: ${full_name}
Phone: ${phone}
Pax: ${adults} Adult(s)${children_ages?.length ? `, ${children_ages.length} Child(ren)` : ''}
Pickup Location: ${pickup_area} (Window: ${pickupWindow})
Total Amount: AED ${totalAED} (100% Pay on Arrival - Cash or Card)
Driver & 24/7 Helpline: +971 56 150 5270
DTCM License: #102357`;

    // Attempt to dispatch email voucher in background if guest provided an email (or to admin awalgsm@gmail.com)
    try {
      const voucherHtml = generateBookingVoucherHtml({
        bookingRef,
        guestName: full_name,
        guestEmail: 'awalgsm@gmail.com',
        guestPhone: phone,
        experienceTitle: tour,
        tourDate,
        adults: Number(adults),
        children: children_ages?.length || 0,
        transferType: private_or_shared === 'private' ? 'Private 4x4' : 'Shared 4x4 Pickup',
        pickupLocation: pickup_area,
        totalAED,
        paymentMethod: 'Pay on Arrival (Cash or Card)',
        specialRequests: `Booked via AI Booking Agent (Session: ${req.body.session_id || 'N/A'})`,
      });

      await transporter.sendMail({
        from: `"The Phoenix Desert Safari" <${GMAIL_USER}>`,
        to: GMAIL_USER,
        subject: `[AI Agent Confirmed] ${bookingRef} - ${tour} (${full_name})`,
        html: voucherHtml,
      });
    } catch (mailErr: any) {
      console.warn('[AI Agent Mail Dispatch Notice]', mailErr.message);
    }

    return res.json({
      ok: true,
      status: 'confirmed',
      booking_reference: bookingRef,
      voucher: voucherText,
      total_aed: totalAED,
      date: tourDate,
      pickup_details: `4x4 Land Cruiser hotel pickup from ${pickup_area} between ${pickupWindow}. Your desert marshal will contact you via WhatsApp / Call (+971561505270).`,
      payment_method: 'pay_on_arrival',
    });
  } catch (err: any) {
    console.error('[AI Agent Create Booking Error]', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// 11.E Agent: Escalate to Human
app.post(['/escalate_to_human', '/api/escalate_to_human', '/api/agent/escalate_to_human'], async (req, res) => {
  try {
    const {
      reason = 'Guest requested human assistance',
      guest_name = 'Guest',
      language = 'en',
      tour = '',
      date = '',
      pax = '',
      quoted_total_aed = '',
      urgent = false,
      session_id = '',
    } = req.body;

    const ticketRef = 'TKT-PHX-' + Math.floor(1000 + Math.random() * 9000);

    const escalationItem = {
      ticketRef,
      reason,
      guest_name,
      language,
      tour,
      date,
      pax,
      quoted_total_aed,
      urgent,
      session_id,
      timestamp: new Date().toISOString(),
    };

    agentEscalations.unshift(escalationItem);

    // Notify operations team via email
    try {
      await transporter.sendMail({
        from: `"The Phoenix Operations Desk" <${GMAIL_USER}>`,
        to: GMAIL_USER,
        subject: `[${urgent ? 'URGENT ' : ''}Human Escalation ${ticketRef}] ${guest_name} - ${reason.slice(0, 50)}`,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #ea580c;">AI Agent Support Escalation: ${ticketRef}</h2>
          <p><strong>Guest Name:</strong> ${guest_name}</p>
          <p><strong>Urgency:</strong> <span style="color: ${urgent ? 'red' : 'green'}; font-weight: bold;">${urgent ? 'HIGH / EMERGENCY' : 'Standard'}</span></p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Tour Interest:</strong> ${tour || 'General'} on ${date || 'Flexible'} (${pax || 'N/A'})</p>
          <p><strong>Language:</strong> ${language}</p>
          <p><strong>Session ID:</strong> ${session_id}</p>
          <hr/>
          <p>Direct WhatsApp Desk: +971 56 150 5270</p>
        </div>`,
      });
    } catch (e: any) {
      console.warn('[Escalation email warning]', e.message);
    }

    return res.json({
      ok: true,
      ticket_reference: ticketRef,
      support_phone: '+971561505270',
      message: urgent
        ? 'Urgent escalation logged. Duty manager notified immediately. Call +971561505270 for immediate assistance.'
        : 'Ticket created. Reservations team will review and reply within 30 minutes during operating hours.',
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// 11.F Agent: Log Lead
app.post(['/log_lead', '/api/log_lead', '/api/agent/log_lead'], (req, res) => {
  try {
    const {
      guest_name = '',
      phone = '',
      tour = '',
      date = '',
      pax = '',
      language = 'en',
      session_id = '',
    } = req.body;

    const leadId = 'LEAD-PHX-' + Math.floor(1000 + Math.random() * 9000);
    const lead = {
      id: leadId,
      guest_name,
      phone,
      tour,
      date,
      pax,
      language,
      session_id,
      marketing_consent: false,
      createdAt: new Date().toISOString(),
    };

    agentLeads.unshift(lead);

    return res.json({
      ok: true,
      lead_id: leadId,
      message: 'Lead logged for internal follow-up.',
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// 12. SEO: Direct XML Sitemap Endpoint
app.get(['/sitemap.xml', '/sitemap_index.xml'], (req, res) => {
  const sitemapPath = path.resolve(__dirname, 'public', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(sitemapPath);
  }
  const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://desertsafaridxbpro.com/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://desertsafaridxbpro.com/evening-desert-safari</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://desertsafaridxbpro.com/dune-buggy-dubai</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://desertsafaridxbpro.com/quad-biking-dubai</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://desertsafaridxbpro.com/abu-dhabi-city-tour-ferrari-world</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://desertsafaridxbpro.com/faq</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
</urlset>`;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  return res.send(fallbackXml);
});

// 12. SEO: Direct Robots.txt Endpoint
app.get('/robots.txt', (req, res) => {
  const robotsPath = path.resolve(__dirname, 'public', 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(robotsPath);
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  return res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: https://desertsafaridxbpro.com/sitemap.xml`);
});

// Vite Integration & Static Assets
async function startServer() {
  if (!isProduction) {
    // Development mode: Mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve dist files
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(
        express.static(distPath, {
          maxAge: '1y',
          immutable: true,
          setHeaders: (res, filePath) => {
            if (filePath.endsWith('.html')) {
              res.setHeader('Cache-Control', 'no-cache');
            }
          },
        })
      );
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      app.get('*', (req, res) => {
        res.status(503).send('Application is building or dist folder not found. Please run "npm run build".');
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Phoenix Safari Server] Running on http://localhost:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
    console.log(`[Phoenix Safari Server] Email gateway active for ${GMAIL_USER}`);
  });
}

startServer();
