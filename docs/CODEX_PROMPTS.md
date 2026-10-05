# Phoenix Desert Safari — Codex Prompt Pack

Run these prompts in order on branch `phoenix-v2-foundation`. Read `docs/PHOENIX_MASTER_SPEC.md` before every phase. Do not merge automatically.

## Prompt 01 — Audit & Architecture
Audit the existing React/TypeScript/Vite + Express app before changing public behavior. Inspect package.json, src/, server.ts/server.js, phoenix_agent/, booking code, tour data, environment variables and build scripts. Create `docs/ARCHITECTURE.md` and `docs/MIGRATION_PLAN.md` showing what to reuse, refactor, retire, deployment constraints, frontend/backend/data/auth/CMS/booking/operations/SEO/media/testing architecture, and rollback-safe phases. Run current lint/build/tests and record baseline results. Do not change production-facing behavior in this phase.

## Prompt 02 — Premium Design System
Create reusable Phoenix brand tokens and application shell: charcoal/midnight, warm sand/ivory, copper/amber accent, premium typography, spacing, buttons, inputs, cards, badges, containers, header, desktop nav, mobile menu, footer, focus states and persistent mobile WhatsApp/Call/Book actions. Make it responsive from 320px and accessible. Do not build full homepage yet. Run lint/build.

## Prompt 03 — Homepage
Build the premium homepage using the design system. Include hero, tour finder, trust strip, popular experiences, Explore Dubai, Explore Abu Dhabi, categories, offer block, Why Phoenix, testimonials, gallery, blog preview, FAQs and final CTA. Use confirmed Phoenix tour names/prices from `data/phoenix-v2-seed.json`. Phone/WhatsApp must use +971561505270. Structure sections so CMS can control them later. Run lint/build.

## Prompt 04 — Tour Catalog & Pricing Engine
Create a typed scalable catalog model for destination, category, tour, variant, pricing rule, add-on, capacity, availability, content, itinerary, FAQ and SEO. Import/normalize confirmed seed data. Implement pricing types `per_person`, `per_vehicle`, `per_unit`, `compound`. Use integer AED amounts. Critical tests: private vehicle price must not multiply by guest count within capacity; Dhow Marina private transfer total = guests * 120 + 350; add-ons multiply only by selected quantity. Add unit tests and run all checks.

## Prompt 05 — Destination & Listing Pages
Build reusable public discovery pages for Dubai, Abu Dhabi, Desert Safari, City Tours and Dhow Cruise. Add filters/search/sort where practical: destination, category, private/sharing, price and capacity. Use canonical internal routes, responsive cards, correct starting-price labels and clean empty states. Run checks.

## Prompt 06 — Tour Detail Page
Build conversion-focused tour detail architecture with gallery, optional video, name, destination, duration, pickup, languages, price, variants, add-ons, date, guest counts, dynamic total, sticky desktop booking card and mobile CTA. Add overview, highlights, inclusions, exclusions, itinerary, pickup info, important info, what to bring, cancellation, FAQs and related tours. Do not invent operational details not supplied by data; make them configurable placeholders. Run checks.

## Prompt 07 — Booking Engine
Implement pay-on-arrival booking flow: Tour → Date → Guests → Variant → Add-ons → Pickup → Contact → Confirmation. Validate capacity, required fields, dates, quantities, private limits and pricing. Generate unique booking reference and store customer, tour, variant, add-ons, pickup, total AED, payment method Pay on Arrival and booking status. Preserve compatibility with the existing booking/agent backend where sensible. Add regression tests.

## Prompt 08 — Customer Confirmation & Lookup
Create booking success page, printable voucher, and booking lookup using booking reference + email/phone. Show booking details, pickup, total, payment status, support and WhatsApp CTA. Never expose internal admin notes. Keep calendar/export hooks extensible. Run checks.

## Prompt 09 — Secure Admin Auth & RBAC
Implement protected admin routes and server-enforced permissions for Super Admin, Manager, Booking Agent, Content Manager, Accounts, Guide, Driver and B2B Agent. Use secure session/password handling appropriate to the existing stack, keep secrets server-side, and audit important auth/admin actions. Do not rely on UI hiding alone. Run security-oriented tests.

## Prompt 10 — Admin Dashboard & Bookings
Build admin dashboard with today's bookings, guests, revenue, pending, confirmed, cancelled, pay-on-arrival due, top tours and upcoming tours. Build booking table with search/filters for status, payment, destination, driver, guide, vehicle, source and agent. Actions: create, edit, confirm, cancel, reschedule, change guests, notes, assignments, resend confirmation, print voucher, export. Run checks.

## Prompt 11 — Tour CMS
Build admin tour CMS supporting create/edit/archive, slug, destination, category, descriptions, media, price/sale price, pricing mode, variants, add-ons, capacity, availability, inclusions, exclusions, itinerary, FAQs, policies, related tours, SEO/schema and publication status. Validate incompatible pricing combinations. Run checks.

## Prompt 12 — Homepage/Page CMS
Build modular CMS for homepage sections: Hero, Search, Trust, Featured Tours, Dubai, Abu Dhabi, Categories, Offers, Why Phoenix, Testimonials, Gallery, Blog, FAQs, CTA, Footer. Each section supports enable/disable, order, text, media, CTA and settings. Add draft/preview/publish plus editable navigation/footer. Public homepage must render from CMS with safe fallback data. Run checks.

## Prompt 13 — Operations
Build drivers, guides, vehicles, pickup locations, availability and assignments. Create daily operations view with tour, guest, pickup time, hotel, phone, passengers, vehicle, driver, guide, amount due and special notes. Keep operational/private data out of public APIs. Run checks.

## Prompt 14 — CRM, Partners & Commissions
Build leads with name, phone, email, tour interest, date, guests, source and status. Build partner foundation for travel agents, hotels, concierges and tour desks, including partner rate, commission, booking attribution, pending/paid commission. Keep B2B portal extension-ready. Run checks.

## Prompt 15 — SEO & Blog
Implement metadata, canonical, OG tags, sitemap, robots, breadcrumbs and structured data appropriate to Organization/LocalBusiness, tour/product/offer, FAQ and Article content. Build blog/travel guide CMS and scalable destination/category/tour URL structure. Prevent duplicate/thin indexable pages. Run checks.

## Prompt 16 — Analytics & Conversion Events
Implement configurable privacy-conscious analytics hooks for tour_view, search, date_selected, whatsapp_click, call_click, booking_started, booking_completed, coupon_applied, lead_submitted and checkout_abandoned. Keep provider IDs/config in environment or admin settings, not hard-coded. Run checks.

## Prompt 17 — Security, Performance & Accessibility
Review authentication, authorization, validation, rate limiting, CSRF strategy where relevant, headers, secret handling, upload validation, error leakage, logging, spam/bot controls and audit trails. Optimize images, code splitting, caching, critical rendering and bundle size. Verify keyboard use, focus, semantics, labels, contrast and screen reader behavior. Fix findings and run full regression suite.

## Prompt 18 — Production QA & Release
Run lint, type-check, unit tests, integration tests, booking pricing regressions, responsive QA, critical route checks, SEO validation, environment checks and production build. Create `docs/RELEASE_CHECKLIST.md`, `docs/DEPLOYMENT.md` and `docs/ROLLBACK.md`. Produce a final PR for manual review. Do not auto-merge or deploy.
