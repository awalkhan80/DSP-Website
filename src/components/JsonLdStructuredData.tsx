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

    // High-Intent AEO Question-Answer Database tailored for Google AI Overviews, Perplexity & Voice Search
    const faqs = [
      {
        question: "How much does a desert safari cost in Dubai?",
        answer: "Standard evening desert safari rates start from AED 75 to AED 120 per person, including 4x4 dune bashing, camel riding, sandboarding, live entertainment shows, and a BBQ buffet dinner. VIP desert safari packages with table service range from AED 150 to AED 250, while quad bike and dune buggy add-ons range from AED 150 to AED 450."
      },
      {
        question: "What is included in an evening desert safari in Dubai?",
        answer: "An evening desert safari includes 4x4 Land Cruiser hotel pickup and drop-off from Dubai and Sharjah, 30–45 minutes of red dune bashing at Lahbab Desert, sandboarding, sunset photo stops, camel riding, unlimited soft drinks, Arabic coffee (Gahwa), live Tanoura dance, fire show, belly dance, and an international BBQ buffet dinner (vegetarian and non-vegetarian)."
      },
      {
        question: "How do I make a desert safari Dubai online booking?",
        answer: "You can book directly online via WhatsApp at +971 56 150 5270 or through our secure website at desertsafaridxbpro.com with instant confirmation, best price guarantee, and pay-on-pickup options in cash or card."
      },
      {
        question: "Do I need a driving license to drive a dune buggy or quad bike in Dubai?",
        answer: "No UAE or international driving license is required to drive dune buggies or quad bikes in Dubai. Full safety gear (helmet, goggles), vehicle briefings, and guided desert tracks are provided. Drivers must be at least 16 years old to operate solo vehicles."
      },
      {
        question: "What is the cost of an Abu Dhabi city tour with Ferrari World tickets?",
        answer: "An Abu Dhabi city tour with Ferrari World tickets typically starts from AED 280 to AED 399 per person. Packages include round-trip hotel transfers from Dubai, visits to the Sheikh Zayed Grand Mosque, Abu Dhabi Corniche, and standard admission tickets to Ferrari World with access to Formula Rossa and all signature rides."
      },
      {
        question: "What should I wear for a Dubai desert safari?",
        answer: "Wear lightweight, breathable cotton clothing and open sandals, flip-flops, or slip-on shoes because sand easily gets inside sneakers. From November to March (winter), bring a light jacket or cardigan, as desert temperatures drop significantly after sunset."
      }
    ];

    const graph = [
      // 1. AEO: FAQ Schema
      {
        "@type": "FAQPage",
        "@id": "https://desertsafaridxbpro.com/#faq-schema",
        "mainEntity": faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      },
      // 2. Breadcrumbs Schema
      {
        "@type": "BreadcrumbList",
        "@id": "https://desertsafaridxbpro.com/#breadcrumbs",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://desertsafaridxbpro.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Dubai Desert Safaris",
            "item": "https://desertsafaridxbpro.com/evening-desert-safari"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Dune Buggy & Quad Biking",
            "item": "https://desertsafaridxbpro.com/dune-buggy-dubai"
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": "Abu Dhabi Tour with Ferrari World",
            "item": "https://desertsafaridxbpro.com/abu-dhabi-city-tour-ferrari-world"
          }
        ]
      },
      // 3. GEO / Commercial Products & Offers
      {
        "@type": "Product",
        "@id": "https://desertsafaridxbpro.com/#evening-desert-safari",
        "name": "Dubai Evening Desert Safari with BBQ Dinner & Dune Bashing",
        "description": "Top-rated 6-hour Lahbab red dune evening safari with 4x4 dune bashing, camel riding, sandboarding, live entertainment shows, and 5-star international BBQ buffet dinner.",
        "image": "https://desertsafaridxbpro.com/images/hero-safari.jpg",
        "brand": {
          "@type": "Brand",
          "name": "Desert Safari DXB Pro"
        },
        "offers": {
          "@type": "Offer",
          "price": "75",
          "priceCurrency": "AED",
          "availability": "https://schema.org/InStock",
          "priceValidUntil": "2027-12-31",
          "url": "https://desertsafaridxbpro.com/evening-desert-safari"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "890",
          "bestRating": "5",
          "worstRating": "1"
        }
      },
      {
        "@type": "Product",
        "@id": "https://desertsafaridxbpro.com/#dune-buggy-quad",
        "name": "Dubai Dune Buggy & Quad Biking Desert Adventure",
        "description": "High-powered Can-Am Maverick and Polaris RZR desert dune buggy and quad bike rentals in Dubai red dunes with transfers and safety equipment.",
        "image": "https://desertsafaridxbpro.com/images/dune-buggy.jpg",
        "brand": {
          "@type": "Brand",
          "name": "Desert Safari DXB Pro"
        },
        "offers": {
          "@type": "Offer",
          "price": "299",
          "priceCurrency": "AED",
          "availability": "https://schema.org/InStock",
          "priceValidUntil": "2027-12-31",
          "url": "https://desertsafaridxbpro.com/dune-buggy-dubai"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "420",
          "bestRating": "5",
          "worstRating": "1"
        }
      },
      {
        "@type": "Product",
        "@id": "https://desertsafaridxbpro.com/#abu-dhabi-ferrari-world",
        "name": "Abu Dhabi City Tour with Ferrari World Tickets",
        "description": "Full day Abu Dhabi sightseeing tour including Sheikh Zayed Grand Mosque, Corniche, and standard admission tickets to Ferrari World Yas Island.",
        "image": "https://desertsafaridxbpro.com/images/abu-dhabi-ferrari.jpg",
        "brand": {
          "@type": "Brand",
          "name": "Desert Safari DXB Pro"
        },
        "offers": {
          "@type": "Offer",
          "price": "280",
          "priceCurrency": "AED",
          "availability": "https://schema.org/InStock",
          "priceValidUntil": "2027-12-31",
          "url": "https://desertsafaridxbpro.com/abu-dhabi-city-tour-ferrari-world"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "215",
          "bestRating": "5",
          "worstRating": "1"
        }
      }
    ];

    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": graph
    });

    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [tours]);

  return null;
};

export default JsonLdStructuredData;
