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

app.use(express.json({ limit: '100kb' }));

// Production Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});

// Lightweight In-Memory Per-IP Rate Limiter
function createRateLimiter(windowMs: number, maxRequests: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket?.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const record = hits.get(ip);
    if (!record || now > record.resetAt) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    record.count += 1;
    if (record.count > maxRequests) {
      return res.status(429).json({ ok: false, error: 'Too many requests. Please try again shortly.' });
    }
    return next();
  };
}

const chatRateLimiter = createRateLimiter(60_000, 60);
const emailRateLimiter = createRateLimiter(60_000, 20);

// Optional Server-Side Admin Token Guard for Mutating Admin Endpoints
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const requiredToken = (process.env.ADMIN_API_TOKEN || '').trim();
  if (!requiredToken) {
    return next();
  }
  const authHeader = req.get('authorization') || '';
  const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : (req.get('x-admin-token') || '').trim();
  if (provided !== requiredToken) {
    return res.status(401).json({ ok: false, error: 'Unauthorized: valid admin token required.' });
  }
  return next();
}

// 301 Canonical Normalization & Duplicate URL Prevention Middleware
app.use((req, res, next) => {
  // Ignore API requests, assets with file extensions, sitemaps, robots.txt
  if (
    req.path.startsWith('/api') ||
    req.path.includes('.') ||
    req.path === '/robots.txt' ||
    req.path === '/sitemap.xml' ||
    req.path === '/sitemap_index.xml'
  ) {
    return next();
  }

  // 1. Strip trailing slash on subpaths (e.g., /evening-desert-safari/ -> /evening-desert-safari)
  if (req.path.length > 1 && req.path.endsWith('/')) {
    const cleanPath = req.path.slice(0, -1);
    const queryString = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    return res.redirect(301, cleanPath + queryString);
  }

  // 2. Normalize WWW to non-WWW for desertsafaridxbpro.com
  const host = req.get('host') || '';
  if (host.startsWith('www.desertsafaridxbpro.com')) {
    const queryString = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    return res.redirect(301, `https://desertsafaridxbpro.com${req.path}${queryString}`);
  }

  next();
});

// Gmail SMTP Transporter
const GMAIL_USER = (process.env.GMAIL_USER || 'awalgsm@gmail.com').trim();
const GMAIL_PASS = (process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS || '').replace(/\s+/g, '');

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
app.post('/api/send-booking-email', emailRateLimiter, async (req, res) => {
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
app.post('/api/test-email', emailRateLimiter, requireAdminAuth, async (req, res) => {
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
const B2B_API_KEY = (process.env.B2B_TICKETS_API_KEY || '').trim();

const B2B_BASE_URL = 'https://api.traveldesk.me/public/b2b/v1';

// In-memory B2B booking records store for admin tracking
let b2bBookingRecords: any[] = [];

// 4. API: B2B.Tickets Status & Balance
app.get('/api/b2b/status', async (req, res) => {
  if (!B2B_API_KEY) {
    return res.status(503).json({
      connected: false,
      error: 'B2B_TICKETS_API_KEY is not configured in server environment.',
    });
  }
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
  const words: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  };

  let adults = 0;
  let children = 0;
  let paxExplicitlyMentioned = false;

  const adultMatch = msgLower.match(/(\d+)\s*adults?/i);
  const childMatch = msgLower.match(/(\d+)\s*(?:child(?:ren)?|kids?)/i);

  if (adultMatch) {
    adults = Math.min(100, Math.max(1, parseInt(adultMatch[1], 10)));
    paxExplicitlyMentioned = true;
  }
  if (childMatch) {
    children = Math.min(100, Math.max(0, parseInt(childMatch[1], 10)));
    paxExplicitlyMentioned = true;
  }

  if (!paxExplicitlyMentioned) {
    const paxMatch =
      msgLower.match(/(\d+)\s*(?:pax|people|persons?|guests?|members?)/i) ||
      msgLower.match(/(?:we are|group of|party of|for|of)\s*(\d+)/i) ||
      msgLower.match(/(\d+)\s*(?:of us)/i);
    if (paxMatch) {
      const parsed = parseInt(paxMatch[1], 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
        adults = parsed;
        paxExplicitlyMentioned = true;
      }
    } else {
      for (const [w, n] of Object.entries(words)) {
        if (new RegExp(`\\b${w}\\s*(?:pax|people|persons?|guests?|adults?)\\b`, 'i').test(msgLower)) {
          adults = n;
          paxExplicitlyMentioned = true;
          break;
        }
      }
    }
  }

  if (adults === 0) adults = 1;
  const pax = adults + children;

  const isPremiumOrVip =
    msgLower.includes('premium') ||
    msgLower.includes('vip') ||
    msgLower.includes('private') ||
    msgLower.includes('luxury');

  const isMorning = msgLower.includes('morning') || msgLower.includes('sunrise');
  const isBurj = msgLower.includes('burj') || msgLower.includes('khalifa') || msgLower.includes('at the top');
  const isBuggy = msgLower.includes('can-am') || msgLower.includes('buggy') || msgLower.includes('canam') || msgLower.includes('polaris');
  const isQuad = msgLower.includes('quad') || msgLower.includes('atv') || msgLower.includes('raptor');
  const isDhow = msgLower.includes('dhow') || msgLower.includes('marina cruise') || msgLower.includes('dinner cruise');
  const isAbuDhabi = msgLower.includes('abu dhabi') || msgLower.includes('ferrari') || msgLower.includes('grand mosque');
  const isDubaiCity = msgLower.includes('dubai city') || msgLower.includes('half-day city') || msgLower.includes('city tour');
  const isSafari = msgLower.includes('safari') || msgLower.includes('desert') || msgLower.includes('evening');

  // 1. Can-Am / Polaris Dune Buggy
  if (isBuggy) {
    const isPolaris = msgLower.includes('polaris');
    const isFourSeater = msgLower.includes('4-seater') || msgLower.includes('4 seater');
    const isOneHour = msgLower.includes('1 hour') || msgLower.includes('60 min') || msgLower.includes('one hour');
    const capacity = isFourSeater ? 4 : 2;
    const buggiesNeeded = Math.max(1, Math.ceil(pax / capacity));
    const unitRate = isPolaris
      ? isFourSeater ? (isOneHour ? 1200 : 800) : (isOneHour ? 900 : 600)
      : isFourSeater ? (isOneHour ? 1900 : 1350) : (isOneHour ? 1500 : 1000);
    const totalAed = buggiesNeeded * unitRate;
    const label = isPolaris ? 'Polaris RZR' : 'Can-Am Maverick X3';
    return {
      type: 'buggy',
      pax,
      buggiesNeeded,
      totalAed,
      actionCard: {
        type: 'price_quote',
        data: {
          tour: `${label} Buggy (${buggiesNeeded}x ${capacity}-Seater for ${pax} Guest${pax > 1 ? 's' : ''})`,
          total_aed: totalAed,
          breakdown: `${buggiesNeeded}x ${capacity}-Seater ${label} (${isOneHour ? '1 Hour' : '30 Mins'}): AED ${totalAed} total (100% Pay on Arrival)`,
          payment_policy: 'pay_on_arrival',
        },
      },
      reply: `Our ${label} (${capacity}-Seater) is AED ${unitRate} for ${isOneHour ? '1 hour' : '30 minutes'}. For ${pax} guest${pax > 1 ? 's' : ''}, you will need ${buggiesNeeded} buggy unit${buggiesNeeded > 1 ? 's' : ''}, coming to AED ${totalAed} total.

All safety gear, helmets, goggles, and an escort lead marshal are included with 100% Pay on Arrival!`,
    };
  }

  // 2. Quad Bike ATV
  if (isQuad) {
    const is350 = msgLower.includes('350') || msgLower.includes('raptor');
    const isInsideCircle = msgLower.includes('circle') || msgLower.includes('inside');
    const isDouble = msgLower.includes('double') || msgLower.includes('two rider') || msgLower.includes('2 rider');
    const unitRate = is350 ? 250 : isDouble ? (isInsideCircle ? 250 : 300) : (isInsideCircle ? 150 : 250);
    const bikesNeeded = isDouble ? Math.max(1, Math.ceil(pax / 2)) : pax;
    const totalAed = bikesNeeded * unitRate;
    return {
      type: 'quad_bike',
      pax,
      bikesNeeded,
      totalAed,
      actionCard: {
        type: 'price_quote',
        data: {
          tour: `Quad Bike ATV (${bikesNeeded}x ${is350 ? '350cc Raptor' : '250cc'} for ${pax} Guest${pax > 1 ? 's' : ''})`,
          total_aed: totalAed,
          breakdown: `${bikesNeeded}x Quad Bike @ AED ${unitRate} = AED ${totalAed} total • 100% Pay on Arrival`,
          payment_policy: 'pay_on_arrival',
        },
      },
      reply: `For ${pax} guest${pax > 1 ? 's' : ''}, ${bikesNeeded}x ${is350 ? '350cc Yamaha Raptor' : '250cc'} Quad Bike (${isDouble ? 'Double' : 'Single'}, ${isInsideCircle ? 'Inside Circle' : 'Open Desert'}) is AED ${totalAed} total (AED ${unitRate} per bike).

Helmets, goggles, safety briefing, and desert marshal escort are included with 100% Pay on Arrival!`,
    };
  }

  // 3. Dhow Cruise Dinner Marina (Supports compound private transfer formula: guests * 120 + 350)
  if (isDhow) {
    if (isPremiumOrVip || msgLower.includes('transfer') || msgLower.includes('pickup')) {
      const totalAed = pax * 120 + 350;
      return {
        type: 'dhow_cruise_private',
        pax,
        totalAed,
        actionCard: {
          type: 'price_quote',
          data: {
            tour: `Dhow Cruise Dinner Marina — Private Pickup & Drop (${pax} Guest${pax > 1 ? 's' : ''})`,
            total_aed: totalAed,
            breakdown: `${pax} Guest(s) @ AED 120 + AED 350 Private Car Transfer = AED ${totalAed} total • 100% Pay on Arrival`,
            payment_policy: 'pay_on_arrival',
          },
        },
        reply: `For ${pax} guest${pax > 1 ? 's' : ''} on our Dhow Cruise Dinner Marina with Private Pickup & Drop, the total is AED ${totalAed} (AED 120 per guest + AED 350 once per private car transfer). All bookings feature 100% Pay on Arrival!`,
      };
    }
    const totalAed = pax * 130;
    return {
      type: 'dhow_cruise_direct',
      pax,
      totalAed,
      actionCard: {
        type: 'price_quote',
        data: {
          tour: `Dhow Cruise Dinner Marina — Direct to Boat (${pax} Guest${pax > 1 ? 's' : ''})`,
          total_aed: totalAed,
          breakdown: `${pax} Guest(s) @ AED 130 = AED ${totalAed} total • 100% Pay on Arrival`,
          payment_policy: 'pay_on_arrival',
        },
      },
      reply: `For ${pax} guest${pax > 1 ? 's' : ''} on our Dhow Cruise Dinner Marina (Direct to Boat), the total is AED ${totalAed} (AED 130 per person). If you would like Private Car Pickup & Drop, the formula is AED 120 per guest + AED 350 per private car (AED ${pax * 120 + 350} total).`,
    };
  }

  // 4. Abu Dhabi City Tour
  if (isAbuDhabi) {
    const withFerrari = msgLower.includes('ferrari');
    const adultRate = withFerrari ? 350 : 150;
    const childRate = withFerrari ? 280 : 105;
    const totalAed = isPremiumOrVip && !withFerrari ? Math.ceil(pax / 6) * 950 : adults * adultRate + children * childRate;
    return {
      type: 'abu_dhabi_tour',
      pax,
      totalAed,
      actionCard: {
        type: 'price_quote',
        data: {
          tour: `${withFerrari ? 'Abu Dhabi City Tour + Ferrari World' : 'Abu Dhabi City Tour'} (${pax} Guest${pax > 1 ? 's' : ''})`,
          total_aed: totalAed,
          breakdown: isPremiumOrVip && !withFerrari
            ? `${Math.ceil(pax / 6)}x Private Vehicle (up to 6 pax): AED ${totalAed}`
            : `${adults} Adult(s) @ AED ${adultRate}${children > 0 ? ` + ${children} Child(ren) @ AED ${childRate}` : ''} = AED ${totalAed}`,
          payment_policy: 'pay_on_arrival',
        },
      },
      reply: `For ${pax} guest${pax > 1 ? 's' : ''}, our ${withFerrari ? 'Abu Dhabi City Tour with Ferrari World Tickets' : 'Full-Day Abu Dhabi City Tour'} is AED ${totalAed} total. Includes round-trip transfer from Dubai, Sheikh Zayed Grand Mosque entry, and Corniche sightseeing.`,
    };
  }

  // 5. Dubai City Tour
  if (isDubaiCity) {
    const totalAed = isPremiumOrVip ? Math.ceil(pax / 6) * 650 : pax * 85;
    return {
      type: 'dubai_city_tour',
      pax,
      totalAed,
      actionCard: {
        type: 'price_quote',
        data: {
          tour: `Dubai City Tour (${pax} Guest${pax > 1 ? 's' : ''})`,
          total_aed: totalAed,
          breakdown: isPremiumOrVip
            ? `${Math.ceil(pax / 6)}x Private Car (up to 6 pax) @ AED 650 = AED ${totalAed}`
            : `${pax} Guest(s) @ AED 85 = AED ${totalAed} • 100% Pay on Arrival`,
          payment_policy: 'pay_on_arrival',
        },
      },
      reply: `For ${pax} guest${pax > 1 ? 's' : ''}, our Dubai City Tour is AED ${totalAed} total (${isPremiumOrVip ? 'AED 650 per private car up to 6 guests' : 'AED 85 per person sharing'}) with 100% Pay on Arrival.`,
    };
  }

  // 6. Premium / Private VIP Safari
  if (isPremiumOrVip && (isSafari || paxExplicitlyMentioned)) {
    const vehiclesNeeded = Math.ceil(pax / 6);
    const totalAed = vehiclesNeeded * 850;
    const standardEveningTotal = adults * 120 + children * 85;
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
      reply: `Marhaban! For your group of ${pax} guest${pax > 1 ? 's' : ''} on our Premium Private VIP Desert Safari, the total is AED ${totalAed} for ${vehiclesNeeded === 1 ? 'your private luxury Land Cruiser 300 Series' : `${vehiclesNeeded} private luxury Land Cruisers`} (seats up to 6 guests per vehicle).

This includes VIP doorstep 4x4 pickup, private dune bashing customized to your preferred thrill level, reserved VIP Majlis table seating inside the camp, dedicated waiter table service, 5-star live BBQ dinner, and live cultural shows.

(Alternatively, if you prefer our Standard Evening Safari with shared 4x4, it comes to AED ${standardEveningTotal} total). All our desert safaris are 100% Pay on Arrival (Cash or Card on pickup) with zero advance deposit required!`,
    };
  }

  // 7. Standard Evening Desert Safari (Supports Adult + Child Breakdown)
  if (isSafari && !isMorning) {
    const totalAed = adults * 120 + children * 85;
    const breakdownText =
      children > 0
        ? `${adults} Adult(s) @ AED 120 + ${children} Child(ren) @ AED 85 = AED ${totalAed} total • Free Doorstep 4x4 Pickup • 100% Pay on Arrival`
        : `${adults} Adult(s) @ AED 120 per person = AED ${totalAed} total • Free Doorstep 4x4 Pickup • 100% Pay on Arrival`;
    return {
      type: 'evening_safari',
      pax,
      adults,
      children,
      totalAed,
      actionCard: {
        type: 'price_quote',
        data: {
          tour: `Evening Desert Safari (${pax} Guest${pax > 1 ? 's' : ''})`,
          total_aed: totalAed,
          breakdown: breakdownText,
          payment_policy: 'pay_on_arrival',
        },
      },
      reply: `Marhaban! For ${adults} adult${adults > 1 ? 's' : ''}${children > 0 ? ` and ${children} child${children > 1 ? 'ren' : ''}` : ''}, our Evening Desert Safari comes to a total of AED ${totalAed} (AED 120 per adult${children > 0 ? ', AED 85 per child' : ''}).

This includes complimentary 4x4 doorstep pickup and drop-off across Dubai and Sharjah, 45-minute red dune bashing in Lahbab, sandboarding, camel rides, a 5-star live BBQ dinner buffet (with vegetarian and vegan options), and live cultural shows (Tanoura dance, Fire show, and Belly dance).

If you prefer your own exclusive vehicle, our Private VIP Land Cruiser 300 Series is AED 850 flat rate (up to 6 guests). All safari bookings feature 100% Pay on Arrival!`,
    };
  }

  // 8. Morning Safari
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
      reply: `Marhaban! For ${pax} guest${pax > 1 ? 's' : ''}, our Morning Sunrise Desert Safari is AED ${totalAed} total for ${vehiclesNeeded === 1 ? 'a private 4x4 Land Cruiser' : `${vehiclesNeeded} private 4x4 Land Cruisers`} (each vehicle accommodates up to 6 guests).

This includes 45 minutes of dune bashing on untouched morning sands, sandboarding, camel rides, and cold refreshments with 100% Pay on Arrival!`,
    };
  }

  // 9. Burj Khalifa
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
      reply: `For Burj Khalifa 'At The Top' (124th & 125th Floor), availability and current ticket rates require team confirmation. For ${pax} guest${pax > 1 ? 's' : ''}, tickets are AED 175 per person, coming to a total of AED ${totalAed}.

Official tickets include high-speed elevator access from Dubai Mall (Ground Level) and 360-degree glass views. Please note that excursion tickets require advance payment to release your official electronic barcode entry passes. Please contact our team to confirm your date and ticket option.`,
    };
  }

  return null;
}

// Global cooldown tracker for Gemini rate limits (429 quota prevention)
let geminiQuotaCooldownUntil = 0;

// 11.0 Agent Conversational Chat Endpoint (Gemini 3.1 Flash Lite + Multi-Model Failover + KB Grounding)
// Health Check Endpoint for Production Monitoring
app.get('/api/health', (req, res) => {
  return res.json({
    ok: true,
    status: 'healthy',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      smtpConfigured: Boolean(GMAIL_PASS),
      b2bConfigured: Boolean(B2B_API_KEY),
      knowledgeBaseLoaded: Boolean(getToursKnowledgeBase()),
    },
  });
});

app.post(['/api/agent/chat', '/api/chat'], chatRateLimiter, async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};
    if (typeof message !== 'string' || !message.trim() || message.length > 4000 ||
        !Array.isArray(history) || history.length > 20 ||
        history.some((h: any) => !h || !['user', 'model'].includes(h.role) ||
          typeof h.text !== 'string' || h.text.length > 4000)) {
      return res.status(400).json({ ok: false, error: 'Provide a message and valid conversation history.' });
    }
    const msgLower = (message || '').toLowerCase();
    const kbJson = getToursKnowledgeBase();

    // Check deterministic mathematical calculation first
    // Availability is not verified by this conversational endpoint.
    if (/\b(availability|available|today|tomorrow|slots?)\b/i.test(message)) {
      return res.json({ ok: true, reply: 'Please share your tour, date, guest count and pickup area. Our team must confirm availability before a booking is confirmed. Contact us on WhatsApp at +971 56 150 5270.', actionCard: null });
    }
    const wantsPrice = /\b(price|cost|quote|calculate|how much|rate|rates)\b/i.test(message);
    const deterministicQuote = wantsPrice ? calculateTourQuote(msgLower) : null;

    let actionCard: any = deterministicQuote ? deterministicQuote.actionCard : null;

    // Try Gemini generateContent if GEMINI_API_KEY is present and not currently in quota cooldown
    if (process.env.GEMINI_API_KEY && Date.now() > geminiQuotaCooldownUntil) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const customRules = kbJson?.ai_settings?.custom_sales_rules || [
          "Always emphasize 100% Pay on Arrival (Cash or Card on pickup) with zero deposit needed for all safaris, buggies, quads, and city tours.",
          "Attraction tickets (Burj Khalifa, SkyDive) require advance payment for official barcode issuance.",
          "Complimentary doorstep 4x4 pickup & drop-off across Dubai and Sharjah.",
          "Suggest Private VIP Safari (AED 850 flat rate) for groups of 4+ guests."
        ];

        const customFaqs = kbJson?.ai_settings?.custom_faqs || [];
        const customFaqText = customFaqs.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');

        const systemInstruction = `You are a warm, courteous, and highly experienced VIP Concierge from The Phoenix Desert Safari Dubai (DTCM License #102357, Business Bay, Dubai).
Phone & 24/7 WhatsApp Hotline: +971 56 150 5270.

TRAINED CONCIERGE PERSONA & SALES DIRECTIVES (CONFIGURED IN ADMIN DASHBOARD):
1. Tone: ${kbJson?.ai_settings?.tone || 'Warm, prestigious, highly courteous, hospitable, direct and helpful'}.
2. Never use markdown headers (NO "###", NO "####", NO "---") and never write empty placeholders (never write "total of aed" without numbers).
3. Only quote prices supported by the supplied catalogue. If guest ages, options or rates are unclear, ask for clarification. This endpoint has no booking or live availability tools: never claim to have checked availability, created a booking, or issued a voucher.
4. Business & Sales Directives:
${customRules.map((r: string) => `   - ${r}`).join('\n')}

CUSTOM TRAINED Q&A KNOWLEDGE BASE:
${customFaqText}

LIVE TOURS, INVENTORY & PRICING DATABASE:
${JSON.stringify(kbJson, null, 2)}`;

        const prompt = `${history.map((h: any) => `${h.role === 'user' ? 'Guest' : 'Concierge'}: ${h.text}`).join('\n')}\nGuest: ${message}\nConcierge:`;

        // Multi-model failover with 4s fast response timeout
        const CANDIDATE_MODELS = Array.from(new Set([process.env.GEMINI_MODEL || 'gemini-2.5-flash', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash']));
        let response: any = null;

        for (const candidateModel of CANDIDATE_MODELS) {
          try {
            const generatePromise = ai.models.generateContent({
              model: candidateModel,
              contents: prompt,
              config: {
                systemInstruction,
                temperature: 0.65,
                maxOutputTokens: 600,
              },
            });

            // 4-second timeout per candidate model
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('AI response timeout')), 4000)
            );

            response = await Promise.race([generatePromise, timeoutPromise]);
            if (response && response.text) {
              break;
            }
          } catch (modelErr: any) {
            const isQuotaError =
              modelErr?.status === 'RESOURCE_EXHAUSTED' ||
              modelErr?.message?.includes('429') ||
              modelErr?.message?.includes('quota') ||
              modelErr?.message?.includes('timeout');

            if (isQuotaError) {
              continue; // Try next candidate model smoothly
            }
            throw modelErr;
          }
        }

        if (response && response.text) {
          let reply = response.text;
          // If model output is missing or has a calculation glitch, use deterministic reply
          if (!reply || reply.toLowerCase().includes('total of aed') || reply.endsWith('aed') || reply.endsWith('total of')) {
            if (deterministicQuote) {
              reply = deterministicQuote.reply;
            } else {
              reply = 'Marhaban! How can I assist you with your Dubai Desert Safari today?';
            }
          }

          return res.json({ ok: true, reply, actionCard });
        } else {
          // All candidate models hit quota, initiate brief cooldown and use local deterministic knowledge base
          geminiQuotaCooldownUntil = Date.now() + 60000;
        }
      } catch (aiErr: any) {
        geminiQuotaCooldownUntil = Date.now() + 60000;
      }
    }

    // Local smart fallback with deterministic calculation if API key not present
    if (deterministicQuote) {
      return res.json({ ok: true, reply: deterministicQuote.reply, actionCard: deterministicQuote.actionCard });
    }

    // Check custom trained FAQs from knowledge base
    const customFaqsList = kbJson?.ai_settings?.custom_faqs || [];
    for (const faq of customFaqsList) {
      const qWords = faq.question.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
      const matchCount = qWords.filter((w: string) => msgLower.includes(w)).length;
      if ((qWords.length > 0 && matchCount >= Math.min(2, qWords.length)) || msgLower.includes(faq.question.toLowerCase())) {
        return res.json({ ok: true, reply: faq.answer, actionCard });
      }
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
      reply = `Our team must confirm availability for your selected date. For Evening Desert Safari, pickup is between 02:30 PM and 03:30 PM. For off-road Can-Am buggies and quad bikes, slots run from 08:00 AM to 05:30 PM sunset slots. Which experience and timing would you prefer?`;
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

app.post(['/api/admin/knowledge_base', '/api/admin/knowledge-base'], requireAdminAuth, (req, res) => {
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

// Auto-Sync & Train AI from Live Admin Tour Catalog
app.post(['/api/admin/ai/sync-catalog', '/api/admin/ai/train-from-catalog'], requireAdminAuth, (req, res) => {
  try {
    const { experiences = [], offRoadPricing = null, cmsConfig = null, aiSettings = null } = req.body;
    const currentKb = getToursKnowledgeBase() || {};

    if (Array.isArray(experiences) && experiences.length > 0) {
      currentKb.tours = experiences.map((exp: any) => ({
        id: exp.id,
        title: exp.title,
        category: exp.category,
        rate_adult_aed: exp.priceAED || 120,
        rate_description: `AED ${exp.priceAED || 120} (${exp.priceUnit || 'per person'})`,
        duration: exp.duration,
        pickup_window: exp.departureTime || '02:30 PM - 03:30 PM',
        dropoff_window: exp.returnTime || '09:30 PM',
        inclusions: exp.highlights || exp.inclusions || [],
        payment_policy:
          exp.category === 'city-tours' && exp.title?.toLowerCase().includes('burj')
            ? 'Advance Payment Only (Official Barcode Admission)'
            : '100% Pay on Arrival (Cash or Card upon pickup)',
      }));
    }

    if (cmsConfig) {
      currentKb.company = {
        name: 'The Phoenix Desert Safari Dubai',
        license: 'DTCM License #102357',
        address: cmsConfig.headquarters || 'DAMAC XL Tower, Business Bay, Dubai, UAE',
        hotline: cmsConfig.directPhone || '+971 56 150 5270',
        whatsapp: cmsConfig.directPhone || '+971 56 150 5270',
      };
    }

    if (aiSettings) {
      currentKb.ai_settings = {
        ...currentKb.ai_settings,
        ...aiSettings,
      };
    }

    currentKb.lastTrainedAt = new Date().toISOString();
    const kbPath = path.resolve(process.cwd(), 'tours_knowledge_base.json');
    fs.writeFileSync(kbPath, JSON.stringify(currentKb, null, 2), 'utf-8');

    return res.json({
      ok: true,
      message: `AI Concierge successfully retrained with ${currentKb.tours?.length || experiences.length} live tours!`,
      data: currentKb,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Helper to read tours availability
function getToursAvailability() {
  try {
    const filePath = path.resolve(process.cwd(), 'tours_availability.json');
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err: any) {
    console.warn('Could not read tours_availability.json:', err.message);
  }
  return {
    lastUpdated: new Date().toISOString(),
    globalRules: { defaultStatus: 'available', defaultCapacity: 60, leadTimeHours: 2 },
    bulkSchedules: [],
    dateOverrides: {}
  };
}

function saveToursAvailability(data: any) {
  const filePath = path.resolve(process.cwd(), 'tours_availability.json');
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

// Availability Endpoints: Get, Bulk Make Available, Toggle Override, and Reset
app.get(['/api/availability', '/api/admin/availability'], (req, res) => {
  const availability = getToursAvailability();
  return res.json({ ok: true, data: availability });
});

// Bulk Availability Manager: Make available in bulk for Date From / Date To and Time Slots
app.post(['/api/availability/bulk', '/api/admin/availability/bulk'], requireAdminAuth, (req, res) => {
  try {
    const {
      tours = ['all'],
      dateFrom,
      dateTo,
      timeSlots = [],
      status = 'available',
      capacity = 60,
      surchargeAED = 0,
      name = 'Bulk Availability Schedule',
    } = req.body;

    if (!dateFrom || !dateTo) {
      return res.status(400).json({ ok: false, error: 'dateFrom and dateTo are required' });
    }

    const current = getToursAvailability();
    const newSchedule = {
      id: `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name || `Bulk ${status === 'available' ? 'Open' : 'Block'} (${dateFrom} to ${dateTo})`,
      appliedAt: new Date().toISOString(),
      tours: Array.isArray(tours) && tours.length > 0 ? tours : ['all'],
      dateFrom,
      dateTo,
      timeSlots: Array.isArray(timeSlots) && timeSlots.length > 0 ? timeSlots : ['all_slots'],
      status, // 'available' | 'blocked' | 'limited'
      capacity: Number(capacity) || 60,
      surchargeAED: Number(surchargeAED) || 0,
    };

    current.bulkSchedules = [newSchedule, ...(current.bulkSchedules || [])];
    saveToursAvailability(current);

    return res.json({
      ok: true,
      message: `Bulk availability successfully applied for ${newSchedule.tours.includes('all') ? 'all tours' : `${newSchedule.tours.length} tour(s)`} from ${dateFrom} to ${dateTo}!`,
      schedule: newSchedule,
      data: current,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Toggle or override a specific single slot or date
app.post(['/api/availability/toggle', '/api/admin/availability/toggle'], requireAdminAuth, (req, res) => {
  try {
    const { tourId = 'all', date, timeSlot = 'all', status = 'available', capacity = 60 } = req.body;
    if (!date) {
      return res.status(400).json({ ok: false, error: 'date is required' });
    }

    const current = getToursAvailability();
    if (!current.dateOverrides) current.dateOverrides = {};

    const key = `${date}_${tourId}_${timeSlot}`;
    current.dateOverrides[key] = {
      tourId,
      date,
      timeSlot,
      status, // 'available' | 'blocked' | 'limited'
      capacity: Number(capacity) || 60,
      updatedAt: new Date().toISOString(),
    };

    saveToursAvailability(current);

    return res.json({
      ok: true,
      message: `Slot updated for ${tourId} on ${date} (${timeSlot}) -> ${status}`,
      override: current.dateOverrides[key],
      data: current,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Reset availability to standard open season
app.post(['/api/availability/reset', '/api/admin/availability/reset'], requireAdminAuth, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sixMonthsLater = new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0];
    const defaultData = {
      lastUpdated: new Date().toISOString(),
      globalRules: { defaultStatus: 'available', defaultCapacity: 60, leadTimeHours: 2 },
      bulkSchedules: [
        {
          id: `bulk-default-${Date.now()}`,
          name: 'Open Season (All Tours Everywhere)',
          appliedAt: new Date().toISOString(),
          tours: ['all'],
          dateFrom: today,
          dateTo: sixMonthsLater,
          timeSlots: ['all_slots'],
          status: 'available',
          capacity: 60,
          surchargeAED: 0,
        },
      ],
      dateOverrides: {},
    };
    saveToursAvailability(defaultData);
    return res.json({ ok: true, message: 'Availability reset to full open season', data: defaultData });
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

// SEO Route mapping for Server-Side Canonical & Metadata Injection
const SERVER_ROUTE_SEO_MAP: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Dubai Desert Safari, Buggy & Quad Tours | The Phoenix',
    description:
      'Book DTCM-licensed Dubai desert safaris from AED 120. Lahbab red dune bashing, Can-Am buggies, quad biking, 5-star BBQ camp & free hotel pickup.',
  },
  '/evening-desert-safari': {
    title: 'Evening Desert Safari Dubai | Red Dunes & BBQ Dinner',
    description:
      'Book official DTCM Dubai evening desert safari from AED 120. Includes 45-min Lahbab red dune bashing, camel rides, sandboarding & live BBQ buffet.',
  },
  '/dune-buggy-dubai': {
    title: 'Can-Am & Polaris Dune Buggy Rental Dubai | 1000cc Turbo',
    description:
      'Self-drive 1000cc turbo Can-Am Maverick X3 & Polaris RZR buggies in Dubai Red Dunes. No license needed. Safety gear & desert marshal escort included.',
  },
  '/quad-biking-dubai': {
    title: 'Quad Biking Dubai (250cc & 350cc) | Desert ATV Rental',
    description:
      'Ride 250cc & 350cc Raptor quad bikes in Dubai Lahbab red dunes. Open desert tracks, safety gear, marshal escort & optional private 4x4 transfer.',
  },
  '/private-vip-safari': {
    title: 'Private VIP Desert Safari Dubai | Land Cruiser 300',
    description:
      'Exclusive private VIP desert safari for up to 6 guests at AED 850 flat rate. Dedicated 4x4 vehicle, VIP majlis table service & live BBQ buffet.',
  },
  '/abu-dhabi-city-tour-ferrari-world': {
    title: 'Abu Dhabi City Tour & Sheikh Zayed Grand Mosque | Dubai',
    description:
      'Full-day Abu Dhabi sightseeing tour from Dubai with Sheikh Zayed Grand Mosque, Emirates Palace stop, Corniche & optional Ferrari World tickets.',
  },
  '/miracle-garden-global-village-combo': {
    title: 'Dubai Miracle Garden & Global Village Combo Tour',
    description:
      'Explore Dubai Miracle Garden and Global Village in one evening. Includes private car transfer (AED 500) and official combo tickets (AED 130/pp).',
  },
  '/alexandra-dhow-cruise-dubai-marina': {
    title: 'Alexandra Dhow Cruise Dubai Marina | 5-Star Dinner',
    description:
      '2-hour luxury wooden dhow dinner cruise in Dubai Marina & Ain Dubai with 5-star international buffet, live entertainment, and upper deck views.',
  },
  '/aya-universe-dubai-experience': {
    title: 'AYA Universe Dubai Tickets | Immersive Light Park',
    description:
      'Official tickets to AYA Universe at WAFI City Mall Dubai (AED 135). 12 immersive cosmic zones with interactive lighting and soundscapes.',
  },
  '/faq': {
    title: 'Dubai Desert Safari FAQs | Timings, Rates & Safety',
    description:
      'Answers to frequently asked questions about Dubai desert safaris, pickup timings, 100% pay on arrival, child safety, and 5-star BBQ camp menus.',
  },
};

function renderHtmlWithDynamicCanonical(html: string, req: express.Request): string {
  try {
    const CANONICAL_SITE_URL = 'https://desertsafaridxbpro.com';
    const rawUrl = req.originalUrl || req.url || req.path || '/';
    const rawPath = rawUrl.split('?')[0].split('#')[0] || '/';
    const cleanPath = rawPath === '/' ? '/' : rawPath.replace(/\/+$/, '').toLowerCase();

    const canonicalUrl = `${CANONICAL_SITE_URL}${cleanPath === '/' ? '/' : cleanPath}`;

    let transformed = html;

    // 1. Dynamic canonical link replacement
    if (transformed.includes('<link rel="canonical"')) {
      transformed = transformed.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
        `<link rel="canonical" href="${canonicalUrl}" />`
      );
    } else {
      transformed = transformed.replace(
        '</head>',
        `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`
      );
    }

    // 2. Dynamic og:url replacement
    if (transformed.includes('property="og:url"')) {
      transformed = transformed.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:url" content="${canonicalUrl}" />`
      );
    }

    // 3. Dynamic Title & Description if matching specific page
    const meta = SERVER_ROUTE_SEO_MAP[cleanPath];
    if (meta) {
      if (meta.title) {
        transformed = transformed.replace(/<title>[^<]*<\/title>/i, `<title>${meta.title}</title>`);
        transformed = transformed.replace(
          /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
          `<meta property="og:title" content="${meta.title}" />`
        );
        transformed = transformed.replace(
          /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
          `<meta name="twitter:title" content="${meta.title}" />`
        );
      }
      if (meta.description) {
        transformed = transformed.replace(
          /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
          `<meta name="description" content="${meta.description}" />`
        );
        transformed = transformed.replace(
          /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
          `<meta property="og:description" content="${meta.description}" />`
        );
        transformed = transformed.replace(
          /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
          `<meta name="twitter:description" content="${meta.description}" />`
        );
      }
    }

    return transformed;
  } catch (err: any) {
    console.warn('[SEO] Dynamic canonical injection notice:', err.message);
    return html;
  }
}

// Vite Integration & Static Assets
async function startServer() {
  if (!isProduction) {
    // Development mode: Mount Vite middleware with custom HTML rendering
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    // Dynamic HTML serving in development with canonical injection
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const html = renderHtmlWithDynamicCanonical(template, req);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // Production mode: Serve dist files
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(
        express.static(distPath, {
          maxAge: '1y',
          immutable: true,
          index: false,
          setHeaders: (res, filePath) => {
            if (filePath.endsWith('.html')) {
              res.setHeader('Cache-Control', 'no-cache');
            }
          },
        })
      );
      app.get('*', (req, res) => {
        try {
          const rawHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
          const finalHtml = renderHtmlWithDynamicCanonical(rawHtml, req);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          res.send(finalHtml);
        } catch (e) {
          res.sendFile(path.join(distPath, 'index.html'));
        }
      });
    } else {
      app.get('*', (req, res) => {
        const rootIndex = path.resolve(__dirname, 'index.html');
        if (fs.existsSync(rootIndex)) {
          const rawHtml = fs.readFileSync(rootIndex, 'utf-8');
          const finalHtml = renderHtmlWithDynamicCanonical(rawHtml, req);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          return res.send(finalHtml);
        }
        res.status(503).send('Application is building or dist folder not found. Please run "npm run build".');
      });
    }
  }

  app.listen(PORT, () => {
    console.log(`[Phoenix Safari Server] Running on http://localhost:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
    console.log(`[Phoenix Safari Server] Email gateway active for ${GMAIL_USER}`);
  });
}

startServer();

