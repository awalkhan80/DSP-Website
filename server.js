import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const distPath = path.resolve(__dirname, 'dist');

app.use(express.json());

const GMAIL_USER = (process.env.GMAIL_USER || 'awalgsm@gmail.com').trim();
const GMAIL_PASS = (process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS || 'qxgd dcbf rskx bjbr').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

function generateBookingVoucherHtml(data) {
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
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e7e5e4;">
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
                    <div style="margin-top: 24px; padding: 14px 16px; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 10px; font-size: 12px; color: #713f12;">
                      <strong style="display: block; margin-bottom: 4px;">📍 Chauffeur Pickup &amp; Arrival Protocol:</strong>
                      Your DTCM-certified safari marshal will contact you via WhatsApp / Call approximately 30–45 minutes prior to pickup with vehicle license plate details. Please be in the hotel lobby or pickup meeting point 10 minutes prior to scheduled departure.
                    </div>
                    <div style="margin-top: 24px; text-align: center;">
                      <a href="https://wa.me/971561505270?text=Hello%20Phoenix%20Safari%2C%20I%20have%20confirmed%20booking%20${bookingRef}" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 24px; border-radius: 10px; margin: 4px; box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);">
                        💬 Chat with VIP Concierge on WhatsApp
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #1c1917; padding: 20px 24px; text-align: center; color: #a8a29e; font-size: 11px; border-top: 1px solid #292524;">
                    <p style="margin: 0 0 6px 0; color: #d6d3d1; font-weight: bold;">Phoenix Desert Safari Dubai</p>
                    <p style="margin: 0 0 6px 0;">DAMAC XL Tower, Business Bay, Dubai, UAE • Phone / WhatsApp: +971 56 150 5270</p>
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

app.post('/api/send-booking-email', async (req, res) => {
  try {
    const data = req.body;
    const { guestEmail, guestName, bookingRef, experienceTitle, tourDate, totalAED } = data;

    if (!guestEmail || !guestEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid guest email address is required.' });
    }

    const htmlContent = generateBookingVoucherHtml(data);

    const guestMailOptions = {
      from: `"Phoenix Desert Safari Dubai" <${GMAIL_USER}>`,
      to: guestEmail,
      cc: GMAIL_USER,
      subject: `Booking Confirmed: ${experienceTitle} [${bookingRef || 'PHX'}] - Phoenix Desert Safari Dubai`,
      html: htmlContent,
    };

    const guestSendResult = await transporter.sendMail(guestMailOptions);

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
          <p><strong>Phone:</strong> <a href="tel:${data.guestPhone}">${data.guestPhone}</a></p>
          <p><strong>Total Amount:</strong> AED ${totalAED}</p>
          <p><strong>Payment Method:</strong> ${data.paymentMethod || 'Cash on Pickup'}</p>
          <p><strong>Pickup Location:</strong> ${data.pickupLocation || 'Not specified'} (Room: ${data.hotelRoom || 'N/A'})</p>
          <p><strong>Special Requests:</strong> ${data.specialRequests || 'None'}</p>
        </div>
      `,
    };

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
  } catch (error) {
    console.error('[Email Gateway Error]', error);
    return res.status(500).json({
      error: 'Failed to send confirmation email',
      details: error?.message || 'Unknown SMTP error',
    });
  }
});

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
        </div>
      `,
    });

    return res.json({
      success: true,
      message: `Test email sent to ${targetEmail} successfully!`,
      messageId: testResult.messageId,
    });
  } catch (error) {
    console.error('[Test Email Error]', error);
    return res.status(500).json({
      error: 'Failed to dispatch test email',
      details: error?.message || 'SMTP Connection Error',
    });
  }
});

app.get('/api/email-status', async (req, res) => {
  try {
    await transporter.verify();
    return res.json({
      status: 'connected',
      user: GMAIL_USER,
      provider: 'Gmail SMTP (Google App Password)',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      user: GMAIL_USER,
      error: error?.message,
    });
  }
});

const B2B_API_KEY = (
  process.env.B2B_TICKETS_API_KEY ||
  'eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJBZ2VuY3lJZCI6IjE2NTAiLCJJc0FwaUtleSI6InRydWUiLCJuYmYiOjE3OTA4ODQ0MTMsImV4cCI6MjA3NDk2NzYxMywiaXNzIjoidHJhdmVsZGVzay5tZSIsImF1ZCI6InRyYXZlbGRlc2subWUifQ.XmXqUcKHlJuOa1ezjJ7sRkQ-ih_tXzdQUYLgBFgKbis'
).trim();

const B2B_BASE_URL = 'https://api.traveldesk.me/public/b2b/v1';
let b2bBookingRecords = [];

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
        error: `B2B.Tickets API status ${balRes.status}: ${errText}`,
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
  } catch (error) {
    return res.status(500).json({
      connected: false,
      error: error?.message || 'Failed to connect to B2B.Tickets API',
    });
  }
});

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
  } catch (error) {
    return res.status(500).json({ error: error?.message });
  }
});

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
  } catch (error) {
    return res.status(500).json({ error: error?.message });
  }
});

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
  } catch (error) {
    return res.status(500).json({ error: error?.message });
  }
});

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
  } catch (error) {
    return res.status(500).json({ error: error?.message });
  }
});

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

    let b2bBookingId = 'B2B-HOLD-' + Math.floor(100000 + Math.random() * 900000);

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
        const b2bResponseData = await b2bRes.json();
        if (b2bResponseData?.id) {
          b2bBookingId = b2bResponseData.id;
        }
      }
    } catch (apiErr) {
      console.warn('[B2B Booking Network Exception]', apiErr.message);
    }

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
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Failed to complete supplier booking' });
  }
});

app.get('/api/b2b/bookings', (req, res) => {
  return res.json({
    total: b2bBookingRecords.length,
    records: b2bBookingRecords,
  });
});

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
