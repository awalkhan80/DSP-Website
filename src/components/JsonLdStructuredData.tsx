import React, { useEffect } from 'react';
import { EXPERIENCES, REVIEWS } from '../data/safaris';

export const JsonLdStructuredData: React.FC = () => {
  useEffect(() => {
    // 1. Organization & LocalBusiness (TravelAgency) Schema
    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': ['TravelAgency', 'LocalBusiness'],
      '@id': 'https://desertsafaridxbpro.com/#organization',
      name: 'The Phoenix Desert Safari Dubai',
      legalName: 'The Phoenix Tourism LLC',
      alternateName: ['Phoenix Desert Safari', 'Desert Safari DXB Pro'],
      description:
        'Official DTCM-licensed Dubai desert safari tour operator offering luxury Arabian dune expeditions, Can-Am Maverick dune buggies, quad bike rentals, and private convoys.',
      url: 'https://desertsafaridxbpro.com',
      telephone: '+971561505270',
      email: 'concierge@phoenixdesertsafari.com',
      image: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAnHfQ_xD50mSdKpb_AX87krGRMEnUDwIXco_BEGwEs4j-EpVpiuGkmIUB5RwaW2iC42DL2UjCqzYVjEnvSEtZA-pMdChCLUsegIFFlflTsUd2y3BvsvfP5Q2Qunr7sWjRY9BCYTi9ANBMbBZ2SZ2Ps4ve8rYtJGe19JPv4az0YV1li5eXxA6Qd7PkZWZ3hpkfjU0G-jePPYEo66vWaKMQgeOdgBW4H_xBquYIVqQu8oHMDw6l00wWd8g',
      ],
      priceRange: 'AED 75 - AED 1500',
      currenciesAccepted: 'AED, USD, EUR, GBP',
      paymentAccepted: 'Cash, Credit Card, Apple Pay',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'DAMAC XL Tower, Business Bay',
        addressLocality: 'Dubai',
        addressRegion: 'Dubai',
        postalCode: '00000',
        addressCountry: 'AE',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 25.1856,
        longitude: 55.2708,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          opens: '00:00',
          closes: '23:59',
        },
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5.0',
        reviewCount: '1840',
        bestRating: '5',
        worstRating: '1',
      },
      sameAs: [
        'https://www.tripadvisor.com',
        'https://www.instagram.com/phoenixdesertsafari',
      ],
    };

    // 2. Product & Tour Schemas
    const productSchemas = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: EXPERIENCES.map((exp, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': ['Product', 'TouristTrip'],
          '@id': `https://desertsafaridxbpro.com/#${exp.id}`,
          name: `${exp.title} - Dubai Desert Safari`,
          description: exp.description,
          image: exp.image,
          touristType: ['Adventure', 'Couples', 'Families', 'Luxury'],
          offers: {
            '@type': 'Offer',
            price: exp.priceAED.toString(),
            priceCurrency: 'AED',
            availability: 'https://schema.org/InStock',
            validFrom: '2025-01-01',
            url: `https://desertsafaridxbpro.com/#${exp.id}`,
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '5.0',
            reviewCount: '420',
          },
        },
      })),
    };

    // 3. FAQPage Schema
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is the best desert safari in Dubai: Morning or Evening?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The Evening Desert Safari is the most popular choice for first-time visitors because it includes 45-minute dune bashing on high Red Lahbab dunes, sunset photography stops, camel rides, sandboarding, and an authentic Bedouin desert camp with live BBQ dinner buffet, Tanoura dancing, fire shows, and belly dancing. The Morning Desert Safari is ideal for early risers seeking cool sunrise lighting.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much does a Dubai desert safari cost in 2025?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Standard Evening Desert Safaris at The Phoenix start from AED 120 per adult including 4x4 hotel pickup and buffet dinner. Morning Desert Safaris start from AED 450 per vehicle, and exclusive Private VIP Desert Safaris start from AED 850 per vehicle.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need a driving license to drive a dune buggy or quad bike in Dubai?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No driving license is required. Self-drive dune buggies (1000cc Can-Am Maverick Turbo) and quad bikes (220cc to 700cc ATVs) operate off-road in designated desert tracks under professional marshal escort.',
          },
        },
        {
          '@type': 'Question',
          name: 'What should I wear for a desert safari in Dubai?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Wear loose-fitting, comfortable cotton clothing, sunglasses, and open sandals or flip-flops. During winter months (November to March), bring a light jacket or shawl as desert temperatures drop after sunset.',
          },
        },
      ],
    };

    // 4. BreadcrumbList Schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://desertsafaridxbpro.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Desert Safaris',
          item: 'https://desertsafaridxbpro.com/#desert-safaris',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Dune Buggy & Quad Bikes',
          item: 'https://desertsafaridxbpro.com/#quad-and-buggy-rentals',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'UAE City Sightseeing',
          item: 'https://desertsafaridxbpro.com/#city-tours',
        },
      ],
    };

    // Inject into document head
    const scriptId = 'phoenix-json-ld-schemas';
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = scriptId;
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }

    scriptElement.textContent = JSON.stringify([
      localBusinessSchema,
      productSchemas,
      faqSchema,
      breadcrumbSchema,
    ]);

    return () => {
      // Clean up on unmount if needed
    };
  }, []);

  return null;
};
