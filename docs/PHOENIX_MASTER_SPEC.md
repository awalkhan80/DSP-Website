# Phoenix Desert Safari — Master Product Specification

## Brand
- Website name: Phoenix Desert Safari
- Company: Phoenix Travel & Tours
- Phone / WhatsApp: +971 56 150 5270
- Email: info@desertsafaridxbpro.com
- Office: DAMAC XL Tower, Business Bay, Dubai, UAE
- Market: UAE inbound tourism
- Initial destinations: Dubai and Abu Dhabi

## Vision
Build a premium, mobile-first inbound-tour platform combining:
- Luxury public website
- Tour discovery/comparison
- Booking engine
- Dynamic pricing, variants and add-ons
- Pay-on-arrival workflow
- Full homepage/page/tour CMS
- Customer and lead management
- Driver/guide/vehicle operations
- Partner/agent management
- SEO/content tooling
- Analytics/reporting
- Future AI trip planner and booking assistant

This must feel like a premium UAE travel-operator platform, not a generic safari template.

## Visual / UX
- Deep charcoal/midnight foundation
- Warm sand/ivory surfaces
- Phoenix copper/amber accent
- Premium editorial UAE travel imagery
- Spacious typography
- Minimal clutter
- Subtle motion
- Mobile-first from 320px
- Persistent mobile actions: WhatsApp, Call, Book
- Sticky booking CTA on tour pages
- Fast, accessible and conversion-focused

## Main Navigation
Home | Dubai Tours | Abu Dhabi Tours | Desert Safari | Attractions | Transfers | Packages | About | Blog | Contact

## Confirmed Products

### Desert Safari
- Standard Sharing — AED 120/person
- Premium Private — AED 1,050/private vehicle, max 6 passengers

### Desert Safari Add-ons
- Quad Bike 30 min — Single — Inside Circle — AED 150
- Quad Bike 30 min — Single — Open Desert — AED 250
- Quad Bike 30 min — Double — Inside Circle — AED 250
- Quad Bike 30 min — Double — Open Desert — AED 300
- Polaris Buggy 2 Seater Self Drive — AED 700
- Polaris Buggy 4 Seater Self Drive — AED 1,000

### Dubai City Tour
- Sharing — AED 85/person
- Private Car — AED 650/vehicle, max 6 passengers

### Abu Dhabi City Tour
- Full Day Sharing — AED 120/person
- Full Day Private — AED 950/vehicle, max 6 passengers

### Dhow Cruise Dinner Marina
- Direct to Boat — AED 130/person
- Private Pickup & Drop — AED 120/person + AED 350/private car
- Formula: guests * 120 + 350
- The AED 350 transfer fee is once per private car, not per passenger

## Pricing Types
Support:
- per_person
- per_vehicle
- per_unit
- compound

Private vehicle pricing must not multiply by passenger count while guest count is within capacity.

## Public Website
Build:
- Premium homepage
- Dubai destination pages
- Abu Dhabi destination pages
- Category pages
- Tour listing/search/filter
- Tour detail pages
- Compare tours
- Wishlist
- Blog/travel guide
- About
- Contact
- Legal pages
- Booking confirmation
- Booking lookup

## Homepage
Sections:
1. Hero
2. Tour finder
3. Trust strip
4. Popular experiences
5. Explore Dubai
6. Explore Abu Dhabi
7. Experience categories
8. Offers
9. Why Phoenix
10. Testimonials
11. Gallery
12. Blog/travel guide
13. FAQs
14. Final CTA

All homepage sections must become CMS-controlled.

## Tour Detail
Support:
- Gallery/video
- Tour name/location/duration
- Pickup/languages
- Price and sale price
- Date
- Guests
- Variants
- Add-ons
- Dynamic total
- Sticky booking card
- Overview
- Highlights
- Inclusions/exclusions
- Itinerary timeline
- Pickup info
- Important info
- What to bring
- Cancellation policy
- FAQs
- Map
- Reviews
- Related tours
- Recently viewed

## Booking Flow
Tour → Date → Guests → Variant → Add-ons → Pickup → Contact → Confirmation

Collect:
- First/last name
- Email
- WhatsApp
- Country
- Hotel/pickup
- Adults/children/infants
- Special requirements
- Date
- Variant
- Add-ons

Initial payment method: Pay on Arrival. Payment verification is not required.

## Admin Navigation
Dashboard
Bookings
Tours
Customers
Operations
Partners
Finance
Website
Marketing
Communication
Users
Settings
Audit Logs

## Homepage/Page CMS
Each section:
- enable/disable
- reorder
- edit title/subtitle
- media
- CTA
- settings
- draft
- preview
- publish

Editable navigation and footer required.

## Tour CMS
Admin can manage:
- name/slug
- destination/category
- descriptions
- main image/gallery/video
- base/sale price
- pricing type
- duration
- pickup
- start time
- languages
- highlights
- inclusions/exclusions
- itinerary
- policies
- FAQs
- variants
- add-ons
- capacity
- availability
- SEO/schema
- related tours
- publication status

## Operations
Manage:
- drivers
- guides
- vehicles
- pickup locations
- availability
- assignments
- daily manifests
- payment due
- internal notes

## Partners
Future-ready:
- travel agents
- hotels
- concierges
- tour desks
- partner rates
- commissions
- booking attribution

## Roles
- Super Admin
- Manager
- Booking Agent
- Content Manager
- Accounts
- Guide
- Driver
- B2B Agent

## SEO
Support:
- title/meta description
- canonical
- OpenGraph
- index/noindex
- breadcrumbs
- sitemap/robots
- schema
- destination/category/tour/blog architecture

Example paths:
- /dubai/
- /dubai/desert-safari/
- /dubai/desert-safari/[slug]/
- /dubai/city-tours/
- /abu-dhabi/
- /abu-dhabi/city-tour/
- /blog/[slug]/

## Data Domains
users, roles, permissions, customers, leads, destinations, categories, tours, variants, prices, add-ons, availability, itineraries, FAQs, images, bookings, booking items, guests, booking add-ons, payments, refunds, pickup locations, vehicles, drivers, guides, assignments, partners, agents, commissions, reviews, coupons, pages, page sections, menus, blog posts, blog categories, media, SEO metadata, templates, settings, audit logs.

## Quality Requirements
- Responsive 320px+
- Strong Core Web Vitals
- Accessible semantics/keyboard/focus/labels
- Optimized images
- Input validation
- Role authorization
- Secrets outside source
- Rate limiting where relevant
- Audit critical admin actions
- Tests for pricing and booking rules
- Keep main deployable
- Build incrementally and review before merge
