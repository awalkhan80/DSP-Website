import { useEffect } from 'react';

const CANONICAL_ORIGIN = 'https://desertsafaridxbpro.com';

export interface RouteMetadata {
  title: string;
  description: string;
  canonicalPath: string;
}

// Canonical route mapping for specific tour experiences, categories, and landing sections
export const SEO_CANONICAL_MAP: Record<string, RouteMetadata> = {
  // Top Homepage Hub
  'home': {
    canonicalPath: '/',
    title: 'Dubai Desert Safari, Dune Buggy & Quad Biking | Rates & Online Booking',
    description:
      'Direct tour operator in Dubai offering evening desert safaris, 4x4 dune bashing, VIP desert camps, dune buggy rentals & quad biking. Best price guarantee from AED 75. Hotel pickup included. Book directly via WhatsApp at +971 56 150 5270.',
  },
  '/': {
    canonicalPath: '/',
    title: 'Dubai Desert Safari, Dune Buggy & Quad Biking | Rates & Online Booking',
    description:
      'Direct tour operator in Dubai offering evening desert safaris, 4x4 dune bashing, VIP desert camps, dune buggy rentals & quad biking. Best price guarantee from AED 75. Hotel pickup included. Book directly via WhatsApp at +971 56 150 5270.',
  },

  // Category & Section Keys
  'desert-safaris': {
    canonicalPath: '/evening-desert-safari',
    title: 'Evening Desert Safari Dubai with Red Dune Bashing & 5-Star BBQ Dinner',
    description:
      'Book official DTCM-licensed Dubai evening desert safari from AED 120. Includes 45-min Lahbab red dune bashing, camel rides, sandboarding, falcon photography, Tanoura show & live BBQ buffet.',
  },
  'adrenaline-buggies': {
    canonicalPath: '/dune-buggy-dubai',
    title: 'Can-Am Maverick & Polaris Dune Buggy Rental Dubai | Self Drive 1000cc',
    description:
      'Self-drive 1000cc turbo Can-Am Maverick X3 & Polaris RZR buggies in Dubai Red Dunes. No license required. Professional marshals, safety gear & hotel transfer included.',
  },
  'buggy': {
    canonicalPath: '/dune-buggy-dubai',
    title: 'Can-Am Maverick & Polaris Dune Buggy Rental Dubai | Self Drive 1000cc',
    description:
      'Self-drive 1000cc turbo Can-Am Maverick X3 & Polaris RZR buggies in Dubai Red Dunes. No license required. Professional marshals, safety gear & hotel transfer included.',
  },
  'quad': {
    canonicalPath: '/quad-biking-dubai',
    title: 'Quad Biking Dubai (250cc & 350cc Raptor) | Desert Safari with ATV Quad',
    description:
      'Ride Yamaha 250cc & 350cc Raptor quad bikes in high red dunes. Open desert tracks, instructor guides, safety gear and doorstep hotel pickup.',
  },
  'quad-and-buggy-rentals': {
    canonicalPath: '/dune-buggy-dubai',
    title: 'Dune Buggy Dubai & Quad Bike Tours | Can-Am & Polaris Rental',
    description:
      'Self-drive 1000cc turbo Can-Am Maverick X3 and Polaris RZR dune buggies and high-power quad bikes in open Lahbab red dunes. No license required. From AED 150.',
  },
  'city-tours': {
    canonicalPath: '/abu-dhabi-city-tour-ferrari-world',
    title: 'Abu Dhabi City Tour with Sheikh Zayed Grand Mosque & Ferrari World',
    description:
      'Full-day Abu Dhabi sightseeing tour from Dubai with Sheikh Zayed Grand Mosque, Emirates Palace photo stop, Corniche, and Ferrari World admission tickets.',
  },
  'travel-guides': {
    canonicalPath: '/faq',
    title: 'Dubai Desert Safari Guide | Dress Code, Buggy Safety & Lahbab Tips',
    description:
      'Everything you need to know about Dubai desert safaris: what to wear, best time for photography, dune buggy requirements, kid safety guidelines, and Lahbab dunes info.',
  },
  'faqs': {
    canonicalPath: '/faq',
    title: 'Dubai Desert Safari FAQs & Guide | What to Wear, Timings, Rates & Safety',
    description:
      'Complete guide and answers to frequently asked questions about Dubai desert safaris, pickup timings, payment options (100% pay on arrival), child safety, and food menus.',
  },
  'reviews': {
    canonicalPath: '/',
    title: 'Desert Safari Dubai Reviews | 4.9 Star Verified Guest Ratings',
    description:
      'Read real verified traveler reviews for The Phoenix Desert Safari Dubai. Rated 4.9/5 across 2,400+ guest testimonials for dune bashing, BBQ dinner and buggy rides.',
  },
  'direct-operator': {
    canonicalPath: '/',
    title: 'DTCM Licensed Direct Desert Safari Operator Dubai | The Phoenix',
    description:
      'Book directly with official DTCM-licensed Dubai desert safari operators at DAMAC XL Tower, Business Bay. Zero intermediary markup, guaranteed 4x4 Land Cruisers.',
  },
  'price-match': {
    canonicalPath: '/',
    title: 'Best Price Guarantee | Dubai Desert Safari & Buggy Tours',
    description:
      'Direct operator wholesale rates with zero middleman markup. 100% pay on arrival, free cancellation, and price match guarantee across all Dubai desert safaris.',
  },

  // Specific Tour Experience IDs
  'evening-desert-safari': {
    canonicalPath: '/evening-desert-safari',
    title: 'Evening Desert Safari Dubai with Red Dune Bashing & 5-Star BBQ Dinner',
    description:
      'Book official DTCM-licensed Dubai evening desert safari from AED 120. Includes 45-min Lahbab red dune bashing, camel rides, sandboarding, falcon photography, Tanoura show & live BBQ buffet.',
  },
  'morning-desert-safari': {
    canonicalPath: '/evening-desert-safari',
    title: 'Morning Desert Safari Dubai | Sunrise Dune Bashing & Camel Trek',
    description:
      'Experience Dubai Red Dunes at dawn. Smooth morning 4x4 dune bashing, sandboarding, camel rides, and traditional Arabic breakfast coffee & dates.',
  },
  'private-vip-safari': {
    canonicalPath: '/private-vip-safari',
    title: 'Private VIP Desert Safari Dubai in Luxury Land Cruiser 300 Series',
    description:
      'Exclusive private VIP desert safari for up to 6 guests at AED 850 flat rate. Dedicated private 4x4 vehicle, VIP table service, premium live BBQ buffet & shows.',
  },
  'can-am-buggy-safari': {
    canonicalPath: '/dune-buggy-dubai',
    title: 'Can-Am Maverick X3 Dune Buggy Dubai (1000cc Turbo) | Self Drive Safari',
    description:
      'Drive high-performance Can-Am Maverick X3 1000cc turbo buggies in high red dunes. Includes safety briefing, helmet, goggles, convoy guide, and hotel transfer.',
  },
  'can-am-dune-buggy': {
    canonicalPath: '/dune-buggy-dubai',
    title: 'Can-Am Maverick & Polaris Dune Buggy Rental Dubai | Self Drive 1000cc',
    description:
      'Self-drive 1000cc turbo Can-Am Maverick X3 & Polaris RZR buggies in Dubai Red Dunes. No license required. Professional marshals, safety gear & hotel transfer included.',
  },
  'polaris-rzr-safari': {
    canonicalPath: '/dune-buggy-dubai',
    title: 'Polaris RZR 1000cc Dune Buggy Rental Dubai | Red Dunes Convoy',
    description:
      'Rent 2-seater and 4-seater Polaris RZR 1000cc off-road buggies with expert guides in Dubai Lahbab dunes. Best price guarantee.',
  },
  'quad-bike-atv': {
    canonicalPath: '/quad-biking-dubai',
    title: 'Quad Biking Dubai (250cc & 350cc Raptor) | Desert Safari with ATV Quad',
    description:
      'Ride Yamaha 250cc & 350cc Raptor quad bikes in high red dunes. Open desert tracks, instructor guides, safety gear and doorstep hotel pickup.',
  },
  'quad-bike-atv-rental': {
    canonicalPath: '/quad-biking-dubai',
    title: 'Dubai Desert Quad Bike Rental | Yamaha Raptor 250cc & 350cc ATV',
    description:
      'High power Yamaha quad bikes for single and double riders. Open desert dunes and enclosed track sessions with safety gear provided.',
  },
  'abu-dhabi-city-tour-ferrari-world': {
    canonicalPath: '/abu-dhabi-city-tour-ferrari-world',
    title: 'Abu Dhabi City Tour with Sheikh Zayed Grand Mosque & Ferrari World',
    description:
      'Full-day Abu Dhabi sightseeing tour from Dubai with Sheikh Zayed Grand Mosque, Emirates Palace photo stop, Corniche, and Ferrari World admission tickets.',
  },
  'miracle-garden-global-village-combo': {
    canonicalPath: '/miracle-garden-global-village-combo',
    title: 'Dubai Miracle Garden & Global Village Combo Tour with Private Transfers',
    description:
      'Explore Dubai Miracle Garden flower displays and Global Village international pavilions in one evening. Includes private car transfer and official entry tickets.',
  },
  'alexandra-dhow-cruise-dubai-marina': {
    canonicalPath: '/alexandra-dhow-cruise-dubai-marina',
    title: 'Alexandra Luxury Dhow Cruise Dubai Marina | 5-Star Dinner Cruise & Live Tanoura',
    description:
      '2-hour luxury wooden dhow cruise in Dubai Marina, JBR skyline & Ain Dubai with 5-star international buffet, live Tanoura dance, and open-air upper deck.',
  },
  'burj-khalifa-124-125': {
    canonicalPath: '/burj-khalifa-tickets',
    title: 'Burj Khalifa At The Top (Levels 124 & 125) Official Entry Tickets',
    description:
      'Direct admission tickets to Burj Khalifa observation decks on levels 124 and 125. 360-degree panoramic skyline views, high-speed elevator, and outdoor terrace.',
  },
  'burj-khalifa-fountain-lake-ride': {
    canonicalPath: '/burj-khalifa-tickets',
    title: 'Dubai Fountain Lake Ride by Traditional Abra | Burj Khalifa Lake',
    description:
      'Front-row wooden abra boat cruise on Burj Lake during Dubai Fountain choreographed water and light shows. Direct official barcode tickets.',
  },
  'skydive-dubai-tandem-palm': {
    canonicalPath: '/skydive-dubai-palm',
    title: 'Skydive Dubai Tandem Jump over Palm Jumeirah | Official Booking',
    description:
      '13,000-feet tandem skydiving freefall over Palm Jumeirah and Dubai Marina. Includes professional instructor, flight suit, photos, and HD video.',
  },
  'aya-universe-dubai': {
    canonicalPath: '/aya-universe-dubai-experience',
    title: 'AYA Universe Dubai Tickets | Immersive Light & Sensory Cosmos Experience',
    description:
      'Official tickets to AYA Universe at WAFI City Mall Dubai. 12 immersive cosmic zones with futuristic lighting, interactive projections, and soundscapes.',
  },
  'aya-universe-dubai-experience': {
    canonicalPath: '/aya-universe-dubai-experience',
    title: 'AYA Universe Dubai Tickets | Immersive Light & Sensory Cosmos Experience',
    description:
      'Official tickets to AYA Universe at WAFI City Mall Dubai. 12 immersive cosmic zones with futuristic lighting, interactive projections, and soundscapes.',
  },
  'faq': {
    canonicalPath: '/faq',
    title: 'Dubai Desert Safari FAQs & Guide | What to Wear, Timings, Rates & Safety',
    description:
      'Complete guide and answers to frequently asked questions about Dubai desert safaris, pickup timings, payment options (100% pay on arrival), child safety, and food menus.',
  },
};

/**
 * Custom React hook that dynamically updates <link rel="canonical"> and OpenGraph tags
 * based on the active landing section, category, or open tour experience modal.
 */
export function useCanonicalSeo(activeSection?: string, modalTourId?: string) {
  useEffect(() => {
    try {
      // 1. Determine key to look up
      const targetKey = (modalTourId || activeSection || 'home').toLowerCase().replace(/^#/, '');

      // 2. Resolve metadata from map or fallback to clean current pathname
      const seoData = SEO_CANONICAL_MAP[targetKey] || SEO_CANONICAL_MAP['home'];
      const canonicalPath = seoData ? seoData.canonicalPath : (window.location.pathname || '/');

      // 3. Determine authoritative canonical URL
      const isCustomDomain =
        window.location.hostname.includes('desertsafaridxbpro.com') ||
        (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('run.app'));

      const origin = isCustomDomain ? CANONICAL_ORIGIN : window.location.origin;
      const canonicalUrl = `${origin}${canonicalPath === '/' ? '/' : canonicalPath}`;

      // 4. Update or create <link rel="canonical"> in document head
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);

      // 5. Update OpenGraph URL tag
      let ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', canonicalUrl);

      // 6. Update Page Title and Meta Description
      if (seoData) {
        document.title = seoData.title;

        let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
        if (metaDesc) {
          metaDesc.setAttribute('content', seoData.description);
        }

        let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
        if (ogTitle) {
          ogTitle.setAttribute('content', seoData.title);
        }

        let ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
        if (ogDesc) {
          ogDesc.setAttribute('content', seoData.description);
        }

        let twitterTitle = document.querySelector('meta[name="twitter:title"]') as HTMLMetaElement | null;
        if (twitterTitle) {
          twitterTitle.setAttribute('content', seoData.title);
        }

        let twitterDesc = document.querySelector('meta[name="twitter:description"]') as HTMLMetaElement | null;
        if (twitterDesc) {
          twitterDesc.setAttribute('content', seoData.description);
        }
      }

      // 7. Synchronize window history state for clear address bar attribution (without reloading)
      if (!modalTourId && activeSection && activeSection !== 'home' && activeSection !== 'desert-safaris') {
        const currentHash = window.location.hash;
        const expectedHash = `#${activeSection}`;
        if (currentHash !== expectedHash && window.history.replaceState) {
          window.history.replaceState(null, '', expectedHash);
        }
      }
    } catch (e) {
      console.warn('[SEO] Dynamic canonical update notice', e);
    }
  }, [activeSection, modalTourId]);
}
