# Deployment status and handoff

The Node agent is integrated into the existing website, so no second Python app or VPS is needed. See `agent/README.md` for configuration and operating limits.

Deployment target: `desertsafaridxbpro.com`, Hostinger Business Node.js web application.
- Repository: `awalkhan80/DSP-Website`
- Root: repository root
- Package manager: npm (use package-lock.json)
- Runtime: Node 22.12+ or supported Node 24
- Build: npm run build
- Entry: server.js
- Start: npm start
- Database migration: npm run agent:init-db (after MySQL credentials exist)

Still required before guest bookings can be enabled:
1. An authenticated Hostinger deployment connection (not available in the current assistant session; cloud-browser sign-in is blocked by Hostinger).
2. OpenAI project API key and chosen available model set in server environment.
3. Hostinger MySQL database credentials, schema initialization and an operator token.
4. Approved package rates, child age bands, pickup-zone charges, VAT, complete package policies and actual dated inventory.

No fake stock, schedules, surcharges, child discounts or VAT settings were seeded. Missing settings return a team handoff or contact option.

After deployment, verify `/api/agent/status` returns JSON, the chat button appears, an approved package produces the correct AED quote, explicit acceptance creates one unpaid pay-on-arrival reservation, a repeated confirmation returns the same reference, and unavailable dates are blocked. Complete a test using clearly marked test inventory before opening sales, and verify the record in `/agent-operations`.
