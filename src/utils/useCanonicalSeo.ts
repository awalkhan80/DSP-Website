import { useEffect } from 'react';

const CANONICAL_ORIGIN = 'https://desertsafaridxbpro.com';

export interface RouteMetadata {
  title: string;
  description: string;
  canonicalPath: string;
}

// Canonical route mapping with titles <= 60 chars and descriptions <= 155 chars
export const SEO_CANONICAL_MAP: Record<string, RouteMetadata> = {
  home: {
    canonicalPath: '/',
    title: 'Dubai Desert Safari, Buggy & Quad Tours | The Phoenix',
    description:
      'Book DTCM-licensed Dubai desert safaris from AED 120. Lahbab red dune bashing, Can-Am buggies, quad biking, 5-star BBQ camp & free hotel pickup.',
  },
  '/': {
    canonicalPath: '/',
    title: 'Dubai Desert Safari, Buggy & Quad Tours | The Phoenix',
    description:
      'Book DTCM-licensed Dubai desert safaris from AED 120. Lahbab red dune bashing, Can-Am buggies, quad biking, 5-star BBQ camp & free hotel pickup.',
  },
  'desert-safaris': {
    canonicalPath: '/evening-desert-safari',
    title: 'Evening Desert Safari Dubai | Red Dunes & BBQ Dinner',
    description:
      'Book official DTCM Dubai evening desert safari from AED 120. Includes 45-min Lahbab red dune bashing, camel rides, sandboarding & live BBQ buffet.',
  },
  'adrenaline-buggies': {
    canonicalPath: '/dune-buggy-dubai',
    title: 'Can-Am & Polaris Dune Buggy Rental Dubai | 1000cc Turbo',
    description:
      'Self-drive 1000cc turbo Can-Am Maverick X3 & Polaris RZR buggies in Dubai Red Dunes. No license needed. Safety gear & desert marshal escort included.',
  },
  buggy: {
    canonicalPath: '/dune-buggy-dubai',
    title: 'Can-Am & Polaris Dune Buggy Rental Dubai | 1000cc Turbo',
    description:
      'Self-drive 1000cc turbo Can-Am Maverick X3 & Polaris RZR buggies in Dubai Red Dunes. No license needed. Safety gear & desert marshal escort included.',
  },
  quad: {
    canonicalPath: '/quad-biking-dubai',
    title: 'Quad Biking Dubai (250cc & 350cc) | Desert ATV Rental',
    description:
      'Ride 250cc & 350cc Raptor quad bikes in Dubai Lahbab red dunes. Open desert tracks, safety gear, marshal escort & optional private 4x4 transfer.',
  },
  'quad-and-buggy-rentals': {
    canonicalPath: '/dune-buggy-dubai',
    title: 'Dune Buggy Dubai & Quad Bike Tours | Can-Am & Polaris',
    description:
      'Self-drive 1000cc Can-Am Maverick X3 and Polaris RZR dune buggies and quad bikes in open Lahbab red dunes. No license required. From AED 150.',
  },
  'city-tours': {
    canonicalPath: '/abu-dhabi-city-tour-ferrari-world',
    title: 'Abu Dhabi City Tour & Sheikh Zayed Grand Mosque | Dubai',
    description:
      'Full-day Abu Dhabi sightseeing tour from Dubai with Sheikh Zayed Grand Mosque, Emirates Palace stop, Corniche & optional Ferrari World tickets.',
  },
  'travel-guides': {
    canonicalPath: '/faq',
    title: 'Dubai Desert Safari Guide | Dress Code & Safety Tips',
    description:
      'Complete guide to Dubai desert safaris: what to wear, best time for photos, dune buggy rules, child safety guidelines, and Lahbab dunes tips.',
  },
  faqs: {
    canonicalPath: '/faq',
    title: 'Dubai Desert Safari FAQs | Timings, Rates & Safety',
    description:
      'Answers to frequently asked questions about Dubai desert safaris, pickup timings, 100% pay on arrival, child safety, and 5-star BBQ camp menus.',
  },
  reviews: {
    canonicalPath: '/',
    title: 'Desert Safari Dubai Reviews | 4.9 Star Guest Ratings',
    description:
      'Read verified traveler reviews for Phoenix Desert Safari Dubai. Rated 4.9/5 across 2,400+ guests for Lahbab dune bashing, BBQ dinner & buggy tours.',
  },
  'direct-operator': {
    canonicalPath: '/',
    title: 'DTCM Licensed Desert Safari Operator Dubai | The Phoenix',
    description:
      'Book directly with DTCM-licensed Dubai desert safari operator at DAMAC XL Tower, Business Bay. Zero middleman markup & 100% pay on arrival.',
  },
  'price-match': {
    canonicalPath: '/',
    title: 'Best Price Guarantee | Dubai Desert Safari & Buggy Tours',
    description:
      'Direct operator wholesale rates with zero middleman markup. 100% pay on arrival, free cancellation, and price match guarantee in Dubai.',
  },
  'evening-desert-safari': {
    canonicalPath: '/evening-desert-safari',
    title: 'Evening Desert Safari Dubai | Red Dunes & BBQ Dinner',
    description:
      'Book official DTCM Dubai evening desert safari from AED 120. Includes 45-min Lahbab red dune bashing, camel rides, sandboarding & live BBQ buffet.',
  },
  'morning-desert-safari': {
    canonicalPath: '/evening-desert-safari',
    title: 'Morning Desert Safari Dubai | Sunrise Dunes & Camel Ride',
    description:
      'Experience Dubai Red Dunes at dawn. Private 4x4 morning dune bashing, sandboarding, camel rides, and Arabic coffee & dates from AED 450.',
  },
  'private-vip-safari': {
    canonicalPath: '/private-vip-safari',
    title: 'Private VIP Desert Safari Dubai | Land Cruiser 300',
    description:
      'Exclusive private VIP desert safari for up to 6 guests at AED 850 flat rate. Dedicated 4x4 vehicle, VIP majlis table service & live BBQ buffet.',
  },
  'can-am-buggy-safari': {
    canonicalPath: '/dune-buggy-dubai',
    title: 'Can-Am Maverick X3 Dune Buggy Dubai | 1000cc Self Drive',
    description:
      'Drive 1000cc turbo Can-Am Maverick X3 buggies in Dubai red dunes. Includes safety briefing, helmet, goggles, convoy marshal & 100% pay on arrival.',
  },
  'can-am-dune-buggy': {
    canonicalPath: '/dune-buggy-dubai',
    title: 'Can-Am & Polaris Dune Buggy Rental Dubai | 1000cc Turbo',
    description:
      'Self-drive 1000cc turbo Can-Am Maverick X3 & Polaris RZR buggies in Dubai Red Dunes. No license needed. Safety gear & desert marshal escort included.',
  },
  'polaris-rzr-safari': {
    canonicalPath: '/dune-buggy-dubai',
    title: 'Polaris RZR 1000cc Dune Buggy Rental Dubai | Red Dunes',
    description:
      'Rent 2-seater and 4-seater Polaris RZR 1000cc off-road buggies with expert guides in Dubai Lahbab red dunes. 100% pay on arrival from AED 600.',
  },
  'quad-bike-atv': {
    canonicalPath: '/quad-biking-dubai',
    title: 'Quad Biking Dubai (250cc & 350cc) | Desert ATV Rental',
    description:
      'Ride 250cc & 350cc Raptor quad bikes in Dubai Lahbab red dunes. Open desert tracks, safety gear, marshal escort & optional private 4x4 transfer.',
  },
  'quad-bike-atv-rental': {
    canonicalPath: '/quad-biking-dubai',
    title: 'Dubai Desert Quad Bike Rental | 250cc & 350cc ATV',
    description:
      'High-power quad bikes for single and double riders in Dubai red dunes. Open desert and circle track sessions from AED 120 with safety gear.',
  },
  'abu-dhabi-city-tour-ferrari-world': {
    canonicalPath: '/abu-dhabi-city-tour-ferrari-world',
    title: 'Abu Dhabi City Tour & Sheikh Zayed Grand Mosque | Dubai',
    description:
      'Full-day Abu Dhabi sightseeing tour from Dubai with Sheikh Zayed Grand Mosque, Emirates Palace stop, Corniche & optional Ferrari World tickets.',
  },
  'miracle-garden-global-village-combo': {
    canonicalPath: '/miracle-garden-global-village-combo',
    title: 'Dubai Miracle Garden & Global Village Combo Tour',
    description:
      'Explore Dubai Miracle Garden and Global Village in one evening. Includes private car transfer (AED 500) and official combo tickets (AED 130/pp).',
  },
  'alexandra-dhow-cruise-dubai-marina': {
    canonicalPath: '/alexandra-dhow-cruise-dubai-marina',
    title: 'Alexandra Dhow Cruise Dubai Marina | 5-Star Dinner',
    description:
      '2-hour luxury wooden dhow dinner cruise in Dubai Marina & Ain Dubai with 5-star international buffet, live entertainment, and upper deck views.',
  },
  'burj-khalifa-124-125': {
    canonicalPath: '/burj-khalifa-tickets',
    title: 'Burj Khalifa At The Top (124 & 125) Official Tickets',
    description:
      'Official entry tickets to Burj Khalifa observation decks on levels 124 and 125 (AED 175). 360-degree skyline views and outdoor terrace access.',
  },
  'burj-khalifa-fountain-lake-ride': {
    canonicalPath: '/burj-khalifa-tickets',
    title: 'Dubai Fountain Lake Ride by Abra | Burj Khalifa Lake',
    description:
      'Front-row traditional wooden abra cruise on Burj Lake during Dubai Fountain water and light shows (AED 100). Instant official barcode tickets.',
  },
  'skydive-dubai-tandem-palm': {
    canonicalPath: '/skydive-dubai-palm',
    title: 'Skydive Dubai Tandem Jump Palm Jumeirah | Booking',
    description:
      '13,000-ft tandem skydiving freefall over Palm Jumeirah (AED 2,700). Includes USPA instructor, flight gear, photos, and full HD video package.',
  },
  'aya-universe-dubai': {
    canonicalPath: '/aya-universe-dubai-experience',
    title: 'AYA Universe Dubai Tickets | Immersive Light Park',
    description:
      'Official tickets to AYA Universe at WAFI City Mall Dubai (AED 135). 12 immersive cosmic zones with interactive lighting and soundscapes.',
  },
  'aya-universe-dubai-experience': {
    canonicalPath: '/aya-universe-dubai-experience',
    title: 'AYA Universe Dubai Tickets | Immersive Light Park',
    description:
      'Official tickets to AYA Universe at WAFI City Mall Dubai (AED 135). 12 immersive cosmic zones with interactive lighting and soundscapes.',
  },
  faq: {
    canonicalPath: '/faq',
    title: 'Dubai Desert Safari FAQs | Timings, Rates & Safety',
    description:
      'Answers to frequently asked questions about Dubai desert safaris, pickup timings, 100% pay on arrival, child safety, and 5-star BBQ camp menus.',
  },
};

export function useCanonicalSeo(activeSection?: string, modalTourId?: string) {
  useEffect(() => {
    try {
      const targetKey = (modalTourId || activeSection || 'home').toLowerCase().replace(/^#/, '');
      const seoData = SEO_CANONICAL_MAP[targetKey] || SEO_CANONICAL_MAP['home'];
      const canonicalPath = seoData ? seoData.canonicalPath : window.location.pathname || '/';

      const isCustomDomain =
        window.location.hostname.includes('desertsafaridxbpro.com') ||
        (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('run.app'));

      const origin = isCustomDomain ? CANONICAL_ORIGIN : window.location.origin;
      const canonicalUrl = `${origin}${canonicalPath === '/' ? '/' : canonicalPath}`;

      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);

      let ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', canonicalUrl);

      if (seoData) {
        document.title = seoData.title;

        const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
        if (metaDesc) metaDesc.setAttribute('content', seoData.description);

        const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
        if (ogTitle) ogTitle.setAttribute('content', seoData.title);

        const ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
        if (ogDesc) ogDesc.setAttribute('content', seoData.description);

        const twitterTitle = document.querySelector('meta[name="twitter:title"]') as HTMLMetaElement | null;
        if (twitterTitle) twitterTitle.setAttribute('content', seoData.title);

        const twitterDesc = document.querySelector('meta[name="twitter:description"]') as HTMLMetaElement | null;
        if (twitterDesc) twitterDesc.setAttribute('content', seoData.description);
      }
    } catch (e) {
      console.warn('[SEO] Dynamic canonical update notice', e);
    }
  }, [activeSection, modalTourId]);
}
