# Desert Safari DXB Pro - SEO, AEO & Search Visibility Optimization Package

This package contains the fully upgraded SEO, AEO (Answer Engine Optimization), GEO (Generative Engine Optimization), and technical search visibility implementation for **desertsafaridxbpro.com**.

## Key Improvements Applied:

1. **`index.html`**:
   - **Prerendered Semantic SEO Shell**: Injected full crawlable semantic HTML (headings, rate comparison tables, FAQ accordions, breadcrumbs, and booking CTAs) directly inside `<div id="root">`. Ensures instant indexability for Googlebot, Bingbot, YandexBot, and AI crawlers (PerplexityBot, GPTBot, ClaudeBot) without waiting for client-side JavaScript execution.
   - **Semrush Tracked Keywords**: Targeted commercial queries with proven search volume: `dubai desert safari price`, `desert safari dubai rates`, `dubai evening safari`, `desert safari dubai online booking`, `desert safari with quad bike`, `desert safari buggy dubai`, `abu dhabi tour with ferrari world`.
   - **Consolidated Static JSON-LD Schema**: Implemented Google Rich-Result-compliant schemas (`TravelAgency`, `LocalBusiness`, `Product` with `Offer` and `AggregateRating`, `FAQPage`, and `BreadcrumbList`).

2. **`public/sitemap.xml`**:
   - Fixed critical Google indexing error by removing hash fragments (`#safaris`, etc.) which Google ignores.
   - Structured valid canonical URLs with image extensions, update frequencies, and priority weights.

3. **`public/robots.txt`**:
   - Added explicit bot permissions for Googlebot, Bingbot, YandexBot, Applebot, GPTBot, PerplexityBot, ClaudeBot, and Google-Extended to maximize indexing across both traditional and AI search engines.

4. **`src/data/seoKeywords.ts`**:
   - Added high-intent clusters for Desert Safari, Dune Buggy & Quad Biking, Abu Dhabi / Ferrari World tours, and Russian Yandex queries.

5. **`src/components/JsonLdStructuredData.tsx`**:
   - Enriched dynamic schema with validated FAQPage, Product offers, and breadcrumb navigation.

6. **`server.js`**:
   - Added production security and SEO headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`), Gzip/Brotli compression, and direct static routes for `sitemap.xml` and `robots.txt`.

## How to Apply & Deploy:

1. Extract this zip archive directly into your project root directory:
   ```bash
   unzip -o desertsafaridxbpro-seo-aeo-geo-optimized.zip -d /path/to/your/project
   ```
2. Build your production bundle:
   ```bash
   npm run build
   ```
3. Commit and push changes to GitHub:
   ```bash
   git add .
   git commit -m "feat(seo): enhance page visibility, prerendered shell, Semrush keywords, and schema markup"
   git push origin main
   ```
4. Restart your production server:
   ```bash
   pm2 restart desertsafaridxbpro || npm run start
   ```

## Post-Deployment Verification Checklist:
- **Google Search Console**: Submit `https://desertsafaridxbpro.com/sitemap.xml` under Sitemaps and request indexing for the homepage.
- **Rich Results Test**: Test `https://desertsafaridxbpro.com/` on Google's Rich Results Test to verify FAQPage, Product, and LocalBusiness eligibility.
- **Semrush Position Tracking**: Track target keyword ranking shifts over the next 7–14 days.


## Chatbot server

Use `npm install`, `npm run build`, then `npm start` on Node hosting. The
`server.js` entry point starts `server.ts`, which serves both the built website
and `/api/agent/chat`. Deploying only `dist` to static hosting cannot serve the
chat API. Restart the Node application after deploying changes.

For local development, `npm run dev` starts the API with Vite middleware on the
same port. Set `GEMINI_API_KEY` in the server environment for generated replies;
without a key, the server uses its local responses. Never put the key in browser
code. Availability requires team confirmation; chat alone does not issue a
booking or voucher. Run `npm run test:chat` for production-entry-point API tests.
