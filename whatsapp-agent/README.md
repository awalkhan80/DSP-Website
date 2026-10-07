# Phoenix WhatsApp booking agent

Prepared for **+971 52 631 0560**, with reservation notifications to **awalgsm@gmail.com**.

## Status

Implementation prepared; **not connected or live**. This is a standalone Node service for this repository. It adds a guided WhatsApp booking conversation, durable reservations and inventory, and email notifications. It does not change the storefront or its existing admin dashboard. The existing website confirmation screen only generates a browser reference; it is not connected to this database.

## Conversation

Customers choose a tour, enter a date, adult/child counts, name and pickup request, review an AED total, and type `CONFIRM`. The service reserves inventory and writes the booking and notification jobs in one transaction. Payment is on arrival and remains unpaid in the record. Pickup is a request; the reservations team still arranges and verifies pickup.

`HUMAN` pauses the assistant and emails the team with the draft. `RESUME` returns to a new booking flow. `NEW`, `MENU` and `RESTART` clear the draft but never cancel an existing reservation. Cancellation/refund requests need staff handling. Voice and image messages ask for text or human help. Guided prompts are English. Optional Gemini selects approved FAQ answers for natural-language questions; it does not freely generate answers, alter prices, or operate the booking system.

Children, same-day bookings, ambiguous buggy/session rates and groups beyond vehicle capacity need staff handling in this first version. No online payments, outbound campaigns, reminders or WhatsApp templates are implemented.

## Before activation

1. Register/connect **+971526310560** to Meta WhatsApp Cloud API. Confirm whether it currently uses the Business app and choose the appropriate supported onboarding route. The visible phone number is not the `META_PHONE_NUMBER_ID`.
2. Supply the Meta Phone Number ID, access token, app secret, webhook verification token and supported Graph API version as **server environment variables**. Do not paste secrets into chat, commit them, or use `VITE_` variables.
3. Set up a Resend account and verified sender, and set `RESEND_API_KEY` and `EMAIL_FROM`. Destination defaults to `awalgsm@gmail.com`. Gmail is the recipient, not the sending provider.
4. Review `catalog.json` against actual operating prices and terms. It is a snapshot of `src/data/safaris.ts`, not a live connection to browser CMS edits. All tours start `enabled: false`. For packages approved for automation, explicitly set `unit` to `adult` or `car`, confirm the exact `priceAED`, and set `enabled: true`. Leave ambiguous vehicle/session packages disabled until their variants and eligibility are implemented. Restart after catalog changes.
5. Allocate daily capacity exclusively to this agent, or integrate a shared reservation system before enabling automatic confirmation. Slots are not imported from suppliers. The website and other sales channels must not sell the same reserved capacity independently.
6. Deploy one persistent Node.js 24 service behind HTTPS, with a durable private volume for SQLite and backups. This implementation is **not suitable for a static hosting plan, ephemeral/serverless disk, or multiple worker replicas**. Restrict filesystem access to booking data. Review retention requirements and operational access before production.

## Run

No additional npm packages are needed by this service. From the repository root:

```sh
cp whatsapp-agent/.env.example whatsapp-agent/.env
# Fill server secrets in the local .env or hosting secret manager.
node --env-file=whatsapp-agent/.env whatsapp-agent/server.mjs
```

`DB_PATH` is resolved against your working directory; use an absolute persistent path in production. Use the same path for the server and admin commands. `.env.example` suggests `./whatsapp-agent/data/bookings.sqlite`; do not commit that data directory. Prefer `/var/lib/phoenix-agent/bookings.sqlite` on a dedicated server.

Configure Meta callback as `https://YOUR_AGENT_HOST/webhooks/whatsapp`, set the verification token, and subscribe the app to the WhatsApp Business Account's `messages` events. `/health` returns liveness only. No admin endpoints are exposed publicly.

After approving an enabled adult-priced package, add **remaining seats**, for example:

```sh
node --env-file=whatsapp-agent/.env whatsapp-agent/admin.mjs slot evening-desert-safari 2026-10-16 12
```

For car-priced packages the count means remaining cars. The command sets remaining capacity; it is not a total-capacity figure and not an increment. Never reset it to the original capacity after bookings have consumed seats. Set 0 to close a slot. Dates must be tomorrow or later in Dubai time.

Inspect from the server:

```sh
node --env-file=whatsapp-agent/.env whatsapp-agent/admin.mjs bookings
node --env-file=whatsapp-agent/.env whatsapp-agent/admin.mjs status
node --env-file=whatsapp-agent/.env whatsapp-agent/admin.mjs failed
```

`bookings` includes personal details; use only an authorized private terminal. Existing website admin login is not used for this service. A future dashboard integration requires server-side authentication.

## Delivery and recovery

- Raw-byte Meta HMAC signature verification and business Phone Number ID checks precede inbox writes.
- Webhook events are persisted before acknowledgment, deduplicated by incoming message ID, then processed in order by one worker.
- Reservation, remaining capacity, session and notification writes commit together. Replayed confirmations cannot create a second reservation.
- Quotes expire after 15 minutes. Inventory is rechecked at confirmation; quotes do not hold seats.
- Notification retries persist across restarts. Permanent failures and exhausted retries are visible with `failed` and in service logs. Monitor them; `/health` alone does not confirm message/email delivery.
- Resend uses an idempotency key per email. Retries stop within 23 hours. WhatsApp sends may duplicate if Meta accepts a send but the process loses the response; the booking itself remains single. Sent means provider accepted, not read/delivered.
- Free-form WhatsApp replies are suppressed once the inbound message is older than 23 hours. Expired/failed WhatsApp responses are escalated to email. No automatic template sends are attempted outside the service window.
- There is no staff inbox UI, cancellation inventory release command, or automated retention purge yet. Staff must handle operational changes in an approved shared system before those features are enabled. Do not modify the SQLite database concurrently with unreviewed scripts.

## Verification

```sh
node --test whatsapp-agent/core.test.mjs
node --check whatsapp-agent/server.mjs
```

Tests cover explicit confirmation, pricing by car/person, duplicate events, competing reservations, quote expiry, date validation, signature tampering, wrong phone IDs, handoff and transaction rollback. Live Meta and Resend delivery still require an authorized test customer and configured accounts. Before production, test a complete booking, verify the reservation and email, test human takeover and failed delivery monitoring, then reopen only real allocated capacity.

## Official integration references

- https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started
- https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint/
- https://developers.facebook.com/documentation/business-messaging/whatsapp/reference/whatsapp-business-phone-number/message-api
- https://ai.google.dev/api/generate-content
- https://resend.com/changelog/idempotency-keys
