# Phoenix agent — Node.js / Hostinger Business

This is the Node.js replacement for the standalone Python starter in `phoenix_agent/`. It mounts in the existing Express server (`server.js` for production, `server.ts` for development), uses the OpenAI Agents SDK, and is displayed by `src/components/TourAssistant.tsx`. Python is not needed by the website deployment.

## Implemented

- Seven registered tools: the six requested names plus `search_knowledge_base`.
- Build-time export of the existing 12-tour website catalogue. Browser-local CMS values and client-submitted totals are never authoritative final prices.
- Approved rates/policies in MySQL, date-specific inventory, child age bands, pickup zones and surcharges, explicit VAT treatment and pay-on-arrival bookings.
- Final price review card and explicit guest acceptance. Only the `/confirm` server route creates a reservation; the model's `create_booking` tool prepares the card.
- Atomic inventory reservation using InnoDB row locks; unique quote ID prevents duplicate bookings on a retried confirmation. Rechecks stock, quote expiry and product revision at confirmation.
- Protected operator page `/agent-operations` for products, departures, confirmed bookings, lead capture and handoffs. Operator token is separate from the old browser-only admin login, and is never saved in browser storage.
- In-chat booking voucher with reference, amount due, pickup window, licence and driver contact. No advance payment or payment verification.
- Existing booking form forwards its enquiry to the assistant for verification. The old endpoint that accepted browser totals and emailed a "confirmed" voucher now returns 410. No legacy browser-generated reference is a confirmed reservation.

## Configure on Hostinger

Use a **Node.js web application**, not a static `dist`-only upload. Choose the repository root, Node 22.12+ (or supported Node 24), npm package manager, build command `npm run build`, and start command `npm start` / entry file `server.js`. The server uses Hostinger's `PORT` environment variable. Install development dependencies during the build; Vite and tsx are required by the build step. A package-lock is included for npm. Do not use the old bun lock for this deployment.

Server environment variables:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `OPENAI_API_KEY` | Your server-side OpenAI project API key |
| `OPENAI_MODEL` | Exact supported model ID enabled in your OpenAI project |
| `APP_ORIGIN` | Exact website origin, e.g. `https://desertsafaridxbpro.com` (no trailing slash) |
| `AGENT_ADMIN_TOKEN` | Random secret at least 32 characters; used only by staff |
| `AGENT_DB_HOST` | Hostinger MySQL hostname |
| `AGENT_DB_PORT` | MySQL port, normally 3306 |
| `AGENT_DB_NAME` / `AGENT_DB_USER` / `AGENT_DB_PASSWORD` | Dedicated agent database credentials |
| `AGENT_DB_SSL` | `true` if the database connection requires TLS; certificate validation stays enabled |
| `TRUST_PROXY_HOPS` | Verified trusted proxy count for the deployment; leave blank until verified |

Never prefix server secrets with `VITE_`, paste them into chat, or commit a populated `.env`. Run `npm run agent:init-db` once with the database variables set, or import `agent/schema.sql` into the dedicated database. This creates only new `agent_*` tables and does not populate inventory or prices.

## Operator setup before automatic reservations

Open `/agent-operations` and authenticate with `AGENT_ADMIN_TOKEN`. Review the exported website catalogue and enter approved package JSON in the form. Use a distinct package ID for each rate/transfer/activity variant. The product fields and error messages are described in `agent/core.mjs` and the form. Amounts are integer **fils**, not AED. No child discount or VAT inclusion is inferred. All policy fields are mandatory; use explicit `None` only when that is the approved policy.

Then enter actual dated departures, capacity, open/closed state and booking cutoff with timezone. A missing, closed, past-cutoff or sold-out departure is unavailable. Capacity represents passengers for per-person rates and vehicles for per-vehicle rates. Allocate shared vehicle capacity carefully across variants and enter bookings from other channels in your operating process; this module does not automatically sync WhatsApp reservations or supplier systems. Approved price/policy changes invalidate outstanding quotes.

Monitor the inbox during 09:00–18:00 UAE time. Leads and handoffs are stored here; the module does not yet send WhatsApp/email notifications. If the database is offline it does not claim a handoff succeeded. Guest help number: +971561505270.

## Validation performed

`npm run build`, `npm run lint`, and `npm run test:agent`. Tests use synthetic prices and a mock database/HTTP service, never live guest data. Coverage includes unknown zones/ages, required policies, VAT, sold-out departures, changed/expired quotes, duplicate confirmations, session ownership, origin checks, operator authentication, and registration of all tools. No live OpenAI, real MySQL, or Hostinger deployment verification was possible without credentials and a supported Hostinger connection.

## Operational limits

- The in-memory, random-cookie chat sessions expire after 30 minutes and reset after a process restart. Use one Node process for this version. Bookings, quotes, products and enquiries are durable in MySQL. Multi-instance deployment needs a shared session/rate-limit store.
- Chat and booking endpoints have request limits, max 30 turns/session and a 60-second model timeout. Set spending limits in your OpenAI project. Tracing is disabled to avoid copying guest details to traces.
- This is text chat. Voice notes, attachments and automatic WhatsApp delivery are not implemented.
- Customer voucher is displayed in the chat. Downloadable PDF/email delivery is not configured.
- Apply your retention, access and deletion policy to the database and backups; the code alone does not establish PDPL compliance.
- The existing source contained an SMTP password fallback. It has been removed from `server.js` and `server.ts`, but must be revoked/replaced at the mail provider because the old value remains in Git history. The old SMTP diagnostic endpoints and browser-only CMS are outside this module's authentication and need a separate access review before public production use.
