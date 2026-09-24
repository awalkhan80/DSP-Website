/**
 * Comprehensive Keyword Strategy and Target Mapping for desertsafaridxbpro.com
 * Classifications: High-Priority Commercial, Medium Competition, Long-Tail, Local Intent,
 * Informational, Transactional, Comparison, Price-Related, Activity-Specific, Audience-Specific.
 */

export interface KeywordTarget {
  keyword: string;
  category:
    | 'Commercial'
    | 'Transactional'
    | 'Long-Tail'
    | 'Local Intent'
    | 'Informational'
    | 'Comparison'
    | 'Price-Related'
    | 'Activity-Specific'
    | 'Audience-Specific';
  targetUrl: string;
  targetSectionId: string;
  searchIntent: 'Commercial' | 'Transactional' | 'Informational' | 'Navigational' | 'Local Intent';
  primaryHeadingTarget: string;
  estimatedVolumeTier: 'High' | 'Medium' | 'Niche';
}

export const SEO_KEYWORD_STRATEGY: KeywordTarget[] = [
  // A. High-Priority Commercial Keywords
  {
    keyword: 'desert safari Dubai',
    category: 'Commercial',
    targetUrl: 'https://desertsafaridxbpro.com/#desert-safaris',
    targetSectionId: 'desert-safaris',
    searchIntent: 'Commercial',
    primaryHeadingTarget: 'Dubai Desert Safari Tours & Luxury Red Dune Expeditions',
    estimatedVolumeTier: 'High',
  },
  {
    keyword: 'Dubai desert safari',
    category: 'Commercial',
    targetUrl: 'https://desertsafaridxbpro.com/#desert-safaris',
    targetSectionId: 'desert-safaris',
    searchIntent: 'Commercial',
    primaryHeadingTarget: 'Dubai Desert Safari Tours & Luxury Red Dune Expeditions',
    estimatedVolumeTier: 'High',
  },
  {
    keyword: 'dune buggy Dubai',
    category: 'Commercial',
    targetUrl: 'https://desertsafaridxbpro.com/#quad-and-buggy-rentals',
    targetSectionId: 'quad-and-buggy-rentals',
    searchIntent: 'Commercial',
    primaryHeadingTarget: 'Dubai Dune Buggy & Can-Am Maverick Rentals',
    estimatedVolumeTier: 'High',
  },
  {
    keyword: 'Dubai dune buggy',
    category: 'Commercial',
    targetUrl: 'https://desertsafaridxbpro.com/#quad-and-buggy-rentals',
    targetSectionId: 'quad-and-buggy-rentals',
    searchIntent: 'Commercial',
    primaryHeadingTarget: 'Dubai Dune Buggy & Can-Am Maverick Rentals',
    estimatedVolumeTier: 'High',
  },
  {
    keyword: 'quad bike Dubai',
    category: 'Commercial',
    targetUrl: 'https://desertsafaridxbpro.com/#quad-and-buggy-rentals',
    targetSectionId: 'quad-and-buggy-rentals',
    searchIntent: 'Commercial',
    primaryHeadingTarget: 'Dubai Quad Bike Rental & ATV Tours',
    estimatedVolumeTier: 'High',
  },
  {
    keyword: 'ATV Dubai',
    category: 'Commercial',
    targetUrl: 'https://desertsafaridxbpro.com/#quad-and-buggy-rentals',
    targetSectionId: 'quad-and-buggy-rentals',
    searchIntent: 'Commercial',
    primaryHeadingTarget: 'Dubai Quad Bike Rental & ATV Tours',
    estimatedVolumeTier: 'High',
  },
  {
    keyword: 'red dune safari Dubai',
    category: 'Commercial',
    targetUrl: 'https://desertsafaridxbpro.com/#evening-desert-safari',
    targetSectionId: 'evening-desert-safari',
    searchIntent: 'Commercial',
    primaryHeadingTarget: 'Evening Desert Safari - Red Lahbab Dunes',
    estimatedVolumeTier: 'High',
  },

  // B. Medium-Competition & Specific Activity Keywords
  {
    keyword: 'evening desert safari Dubai',
    category: 'Activity-Specific',
    targetUrl: 'https://desertsafaridxbpro.com/#evening-desert-safari',
    targetSectionId: 'evening-desert-safari',
    searchIntent: 'Transactional',
    primaryHeadingTarget: 'Evening Desert Safari with BBQ Dinner & Live Cultural Shows',
    estimatedVolumeTier: 'High',
  },
  {
    keyword: 'morning desert safari Dubai',
    category: 'Activity-Specific',
    targetUrl: 'https://desertsafaridxbpro.com/#morning-desert-safari',
    targetSectionId: 'morning-desert-safari',
    searchIntent: 'Transactional',
    primaryHeadingTarget: 'Sunrise Morning Desert Safari with Camel Ride & Sandboarding',
    estimatedVolumeTier: 'Medium',
  },
  {
    keyword: 'private desert safari Dubai',
    category: 'Audience-Specific',
    targetUrl: 'https://desertsafaridxbpro.com/#private-vip-safari',
    targetSectionId: 'private-vip-safari',
    searchIntent: 'Transactional',
    primaryHeadingTarget: 'Private Desert Safari VIP & Exclusive Land Cruiser Convoys',
    estimatedVolumeTier: 'Medium',
  },
  {
    keyword: 'Can-Am buggy Dubai',
    category: 'Activity-Specific',
    targetUrl: 'https://desertsafaridxbpro.com/#quad-and-buggy-rentals',
    targetSectionId: 'quad-and-buggy-rentals',
    searchIntent: 'Commercial',
    primaryHeadingTarget: 'Can-Am Maverick X3 Turbo Buggy Safari',
    estimatedVolumeTier: 'Medium',
  },
  {
    keyword: 'Polaris RZR Dubai',
    category: 'Activity-Specific',
    targetUrl: 'https://desertsafaridxbpro.com/#quad-and-buggy-rentals',
    targetSectionId: 'quad-and-buggy-rentals',
    searchIntent: 'Commercial',
    primaryHeadingTarget: 'Polaris RZR & High-Horsepower Buggy Safari',
    estimatedVolumeTier: 'Medium',
  },

  // C. Price-Related & Transactional Keywords
  {
    keyword: 'desert safari Dubai price',
    category: 'Price-Related',
    targetUrl: 'https://desertsafaridxbpro.com/#desert-safaris',
    targetSectionId: 'desert-safaris',
    searchIntent: 'Transactional',
    primaryHeadingTarget: 'Desert Safari Dubai Pricing, Packages & Inclusions (from AED 120)',
    estimatedVolumeTier: 'High',
  },
  {
    keyword: 'dune buggy Dubai price',
    category: 'Price-Related',
    targetUrl: 'https://desertsafaridxbpro.com/#quad-and-buggy-rentals',
    targetSectionId: 'quad-and-buggy-rentals',
    searchIntent: 'Transactional',
    primaryHeadingTarget: 'Dubai Dune Buggy Rental Rates & Turbo Can-Am Pricing',
    estimatedVolumeTier: 'Medium',
  },
  {
    keyword: 'quad bike Dubai price',
    category: 'Price-Related',
    targetUrl: 'https://desertsafaridxbpro.com/#quad-and-buggy-rentals',
    targetSectionId: 'quad-and-buggy-rentals',
    searchIntent: 'Transactional',
    primaryHeadingTarget: 'Quad Bike ATV Rental Rates & Special Red Dune Deals',
    estimatedVolumeTier: 'Medium',
  },
  {
    keyword: 'cheap desert safari Dubai',
    category: 'Price-Related',
    targetUrl: 'https://desertsafaridxbpro.com/#direct-advantage',
    targetSectionId: 'direct-advantage',
    searchIntent: 'Commercial',
    primaryHeadingTarget: 'Affordable Direct Operator Desert Safari Deals Without Middlemen',
    estimatedVolumeTier: 'High',
  },

  // D. Local Intent Keywords
  {
    keyword: 'desert safari operator Business Bay Dubai',
    category: 'Local Intent',
    targetUrl: 'https://desertsafaridxbpro.com/#direct-advantage',
    targetSectionId: 'direct-advantage',
    searchIntent: 'Local Intent',
    primaryHeadingTarget: 'Direct DTCM Licensed Operator in DAMAC XL Tower, Business Bay',
    estimatedVolumeTier: 'Medium',
  },
  {
    keyword: 'Lahbab desert safari',
    category: 'Local Intent',
    targetUrl: 'https://desertsafaridxbpro.com/#desert-safaris',
    targetSectionId: 'desert-safaris',
    searchIntent: 'Commercial',
    primaryHeadingTarget: 'Red Sand Lahbab Desert Safari with 45-Min Dune Bashing',
    estimatedVolumeTier: 'Medium',
  },

  // E. Combo & Long-Tail Keywords
  {
    keyword: 'Dubai desert safari with quad bike',
    category: 'Long-Tail',
    targetUrl: 'https://desertsafaridxbpro.com/#quad-and-buggy-rentals',
    targetSectionId: 'quad-and-buggy-rentals',
    searchIntent: 'Transactional',
    primaryHeadingTarget: 'Dubai Desert Safari with Quad Bike Combo Package',
    estimatedVolumeTier: 'High',
  },
  {
    keyword: 'Dubai desert safari with buggy',
    category: 'Long-Tail',
    targetUrl: 'https://desertsafaridxbpro.com/#quad-and-buggy-rentals',
    targetSectionId: 'quad-and-buggy-rentals',
    searchIntent: 'Transactional',
    primaryHeadingTarget: 'Desert Safari and Dune Buggy Combo Deals',
    estimatedVolumeTier: 'Medium',
  },
  {
    keyword: 'desert safari and dune buggy Dubai',
    category: 'Long-Tail',
    targetUrl: 'https://desertsafaridxbpro.com/#quad-and-buggy-rentals',
    targetSectionId: 'quad-and-buggy-rentals',
    searchIntent: 'Transactional',
    primaryHeadingTarget: 'Complete Adventure: Dune Buggy Self-Drive Plus VIP Camp Safari',
    estimatedVolumeTier: 'Medium',
  },

  // F. Comparison & Informational Keywords
  {
    keyword: 'evening vs morning desert safari Dubai',
    category: 'Comparison',
    targetUrl: 'https://desertsafaridxbpro.com/#faqs',
    targetSectionId: 'faqs',
    searchIntent: 'Informational',
    primaryHeadingTarget: 'Comparison: Evening Safari vs. Morning Desert Safari in Dubai',
    estimatedVolumeTier: 'Medium',
  },
  {
    keyword: 'what to wear desert safari Dubai',
    category: 'Informational',
    targetUrl: 'https://desertsafaridxbpro.com/#faqs',
    targetSectionId: 'faqs',
    searchIntent: 'Informational',
    primaryHeadingTarget: 'Essential Packing and Dress Code Guidelines for Desert Safaris',
    estimatedVolumeTier: 'High',
  },
  {
    keyword: 'best desert safari Dubai for families',
    category: 'Audience-Specific',
    targetUrl: 'https://desertsafaridxbpro.com/#faqs',
    targetSectionId: 'faqs',
    searchIntent: 'Informational',
    primaryHeadingTarget: 'Child-Friendly Desert Safaris & Family Safety Protocols',
    estimatedVolumeTier: 'Medium',
  },
];
