# UAE Inbound Tours Booking Agent (v2)

OpenAI Agents SDK starter app for Phoenix Travel & Tours. It includes a small responsive website chat, the supplied booking instructions, and tools for the knowledge base, live price/availability, pay-on-arrival booking, payment-link (disabled), lead logging, and human escalation.

## Policy applied

Bookings use **pay on arrival**. The assistant checks current price and availability, presents the pre-booking summary, obtains guest acceptance and required contact details, then creates the booking as `pay_on_arrival`. It does not request payment or wait for payment verification. The required `create_payment_link` tool is registered but always returns disabled. Never enable it without changing the business policy and reviewing the flow.

## Run locally

Requires Python 3.10+. Create `.env` from `.env.example`, set `OPENAI_API_KEY`, then:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

Open http://127.0.0.1:8000. The chat UI is a starter, not a public production deployment.

## Booking backend contract

Set `BOOKING_API_BASE_URL` to a private HTTPS backend and `BOOKING_API_TOKEN` to a server-side secret. Implement authenticated JSON `POST` endpoints:

| Route | Input / required result |
|---|---|
| `/search_knowledge_base` | `{question}` → `{ok:true, facts:[...]}` grounded in approved KB |
| `/get_price` | tour, date, adult count, child ages, pickup area, private/shared → `{ok:true,total_aed,vat_included,transfer_aed,...}` |
| `/check_availability` | same trip details → `{ok:true,available:true,...}` |
| `/create_booking` | confirmed summary acceptance, customer contact, quote, availability and `payment_method:"pay_on_arrival"` → `{status:"confirmed",voucher,pickup_details,...}` |
| `/escalate_to_human` | issue summary + urgency → `{ok:true,ticket_reference,...}` |
| `/log_lead` | lead details with `marketing_consent:false` → `{ok:true,...}` |

The booking service must verify the quote and inventory itself at creation time, reject unavailable/expired quotes, enforce group-size/vehicle restrictions, and generate the voucher. Do not trust the model's arguments or client conversation as authorization. Tool calls carry a server-generated session identifier and an `Idempotency-Key`; honor it, particularly for booking creation, so a retried timeout cannot create duplicate bookings.

## Before real guest use

- Load and review the current product KB, price sheet, cancellation terms, seasonal rules, age/health requirements, and exact transfer zones in the connected service.
- Connect the actual inventory, quote, booking, lead, and human escalation systems; define backend auth, logging, retries, idempotency, and payment-on-arrival collection/receipt procedures.
- Replace in-memory conversation history with encrypted, access-controlled durable storage, add rate limits and abuse protection, and configure retention/deletion under applicable UAE data-protection requirements.
- Put the app behind HTTPS and your approved identity/security setup. Never expose `BOOKING_API_TOKEN` or the OpenAI API key to the browser.
- Test guest languages, no-inventory cases, tool outages, duplicates, safety escalation, data deletion, and concurrent bookings before deployment.

No live prices, knowledge base, inventory, or payment integration are included in this starter, so it must not be used to confirm real bookings until connected and reviewed.
