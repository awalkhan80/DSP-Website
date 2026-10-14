import React, { useEffect } from 'react';

interface JsonLdStructuredDataProps {
  tours?: Array<{
    id: string;
    name: string;
    description: string;
    price: number | string;
    image?: string;
  }>;
}

export const JsonLdStructuredData: React.FC<JsonLdStructuredDataProps> = ({ tours = [] }) => {
  useEffect(() => {
    const existingScript = document.getElementById('dynamic-jsonld-schema');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'dynamic-jsonld-schema';
    script.type = 'application/ld+json';

    const faqs = [
      {
        question: 'How much does a desert safari cost in Dubai?',
        answer:
          'Standard evening desert safari rates start from AED 120 per adult (AED 85 per child), including 4x4 dune bashing, camel riding, sandboarding, live entertainment shows, and a 5-star BBQ buffet dinner. Private VIP Land Cruiser safaris are AED 850 per vehicle (up to 6 guests), with 100% Pay on Arrival.',
      },
      {
        question: 'What is included in an evening desert safari in Dubai?',
        answer:
          'An evening desert safari includes 4x4 Land Cruiser hotel pickup and drop-off across Dubai and Sharjah, 45 minutes of red dune bashing at Lahbab Desert, sandboarding, sunset photo stops, camel riding, unlimited soft drinks, Arabic coffee (Gahwa), live Tanoura dance, fire show, belly dance, and an international BBQ buffet dinner.',
      },
      {
        question: 'How do I make a desert safari Dubai online booking?',
        answer:
          'You can book directly online at desertsafaridxbpro.com or via WhatsApp at +971 56 150 5270 with instant confirmation, best price guarantee, and 100% Pay on Arrival in cash or card.',
      },
      {
        question: 'Do I need a driving license to drive a dune buggy or quad bike in Dubai?',
        answer:
          'No UAE or international driving license is required to drive dune buggies or quad bikes in the desert. Full safety gear (helmet, goggles), vehicle briefings, and guided desert convoy marshals are provided. Drivers must be at least 16 years old.',
      },
      {
        question: 'What is the cost of an Abu Dhabi city tour from Dubai?',
        answer:
          'Full-day Abu Dhabi city sightseeing tours start from AED 150 per person (or AED 350 per adult with Ferrari World admission tickets), including round-trip transfers from Dubai, Sheikh Zayed Grand Mosque entry, and Abu Dhabi Corniche.',
      },
      {
        question: 'What should I wear for a Dubai desert safari?',
        answer:
          'Wear lightweight, breathable cotton clothing and open sandals or sneakers. From November to March, bring a light jacket for the evening desert camp.',
      },
    ];

    const graph = [
      {
        '@type': ['TravelAgency', 'LocalBusiness'],
        '@id': 'https://desertsafaridxbpro.com/#organization',
        name: 'Phoenix Desert Safari Dubai (Phoenix Travel & Tours)',
        url: 'https://desertsafaridxbpro.com/',
        logo: 'https://desertsafaridxbpro.com/logo.svg',
        image: 'https://desertsafaridxbpro.com/logo.svg',
        telephone: '+971561505270',
        email: 'info@desertsafaridxbpro.com',
        priceRange: 'AED 75 - AED 2700',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'DAMAC XL Tower, Business Bay',
          addressLocality: 'Dubai',
          addressRegion: 'Dubai',
          addressCountry: 'AE',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 25.1856,
          longitude: 55.2708,
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00',
          closes: '23:59',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://desertsafaridxbpro.com/#faq-schema',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://desertsafaridxbpro.com/#breadcrumbs',
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
            name: 'Evening Desert Safari Dubai',
            item: 'https://desertsafaridxbpro.com/evening-desert-safari',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Dune Buggy & Quad Biking Dubai',
            item: 'https://desertsafaridxbpro.com/dune-buggy-dubai',
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'Abu Dhabi City Tour & Ferrari World',
            item: 'https://desertsafaridxbpro.com/abu-dhabi-city-tour-ferrari-world',
          },
        ],
      },
      {
        '@type': 'Product',
        '@id': 'https://desertsafaridxbpro.com/#evening-desert-safari',
        name: 'Dubai Evening Desert Safari with Red Dune Bashing & BBQ Dinner',
        description:
          'Official DTCM-licensed 7-hour Lahbab red dune evening safari with 4x4 Land Cruiser pickup, 45-minute dune bashing, camel ride, sandboarding, live shows, and 5-star BBQ buffet dinner.',
        image: 'https://desertsafaridxbpro.com/logo.svg',
        brand: {
          '@type': 'Brand',
          name: 'Phoenix Desert Safari Dubai',
        },
        offers: {
          '@type': 'Offer',
          price: '120',
          priceCurrency: 'AED',
          availability: 'https://schema.org/InStock',
          priceValidUntil: '2027-12-31',
          url: 'https://desertsafaridxbpro.com/evening-desert-safari',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '890',
          bestRating: '5',
          worstRating: '1',
        },
      },
      {
        '@type': 'Product',
        '@id': 'https://desertsafaridxbpro.com/#dune-buggy-quad',
        name: 'Can-Am Maverick X3 & Polaris RZR Dune Buggy Safari Dubai',
        description:
          'Self-drive 1000cc turbo Can-Am Maverick X3 and Polaris RZR desert dune buggies and Yamaha quad bikes in Lahbab red dunes with safety gear and desert marshal escort.',
        image: 'https://desertsafaridxbpro.com/logo.svg',
        brand: {
          '@type': 'Brand',
          name: 'Phoenix Desert Safari Dubai',
        },
        offers: {
          '@type': 'Offer',
          price: '600',
          priceCurrency: 'AED',
          availability: 'https://schema.org/InStock',
          priceValidUntil: '2027-12-31',
          url: 'https://desertsafaridxbpro.com/dune-buggy-dubai',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '420',
          bestRating: '5',
          worstRating: '1',
        },
      },
      {
        '@type': 'Product',
        '@id': 'https://desertsafaridxbpro.com/#abu-dhabi-ferrari-world',
        name: 'Abu Dhabi City Tour from Dubai with Sheikh Zayed Grand Mosque',
        description:
          'Full-day Abu Dhabi sightseeing tour from Dubai including Sheikh Zayed Grand Mosque entry, Corniche, Emirates Palace stop, and optional Ferrari World tickets.',
        image: 'https://desertsafaridxbpro.com/logo.svg',
        brand: {
          '@type': 'Brand',
          name: 'Phoenix Desert Safari Dubai',
        },
        offers: {
          '@type': 'Offer',
          price: '150',
          priceCurrency: 'AED',
          availability: 'https://schema.org/InStock',
          priceValidUntil: '2027-12-31',
          url: 'https://desertsafaridxbpro.com/abu-dhabi-city-tour-ferrari-world',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '215',
          bestRating: '5',
          worstRating: '1',
        },
      },
    ];

    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': graph,
    });

    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [tours]);

  return null;
};

export default JsonLdStructuredData;
