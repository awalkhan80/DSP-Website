import { Currency, Experience, OffRoadPricingConfig, Review } from '../types';

export const DEFAULT_OFF_ROAD_PRICING: OffRoadPricingConfig = {
  quad220cc: {
    singleInside30m: 120,
    singleInside60m: 200,
    singleOpen30m: 150,
    singleOpen60m: 250,
    doubleInside30m: 160,
    doubleInside60m: 260,
    doubleOpen30m: 200,
    doubleOpen60m: 320,
  },
  quad350cc: {
    singleInside30m: 170,
    singleInside60m: 280,
    singleOpen30m: 220,
    singleOpen60m: 350,
    doubleInside30m: 220,
    doubleInside60m: 340,
    doubleOpen30m: 270,
    doubleOpen60m: 420,
  },
  buggyPolaris: {
    twoSeater30m: 600,
    twoSeater60m: 900,
    fourSeater30m: 800,
    fourSeater60m: 1200,
  },
  buggyCanAm: {
    twoSeater30m: 700,
    twoSeater60m: 1000,
    fourSeater30m: 950,
    fourSeater60m: 1500,
  },
};

export function getQuadBikePrice(
  pricing: OffRoadPricingConfig = DEFAULT_OFF_ROAD_PRICING,
  engine: '220cc' | '350cc',
  riderType: 'single' | 'double',
  terrain: 'inside_circle' | 'open_desert',
  duration: '30m' | '60m'
): number {
  const tier = engine === '220cc' ? pricing.quad220cc : pricing.quad350cc;
  if (riderType === 'single') {
    if (terrain === 'inside_circle') {
      return duration === '30m' ? tier.singleInside30m : tier.singleInside60m;
    } else {
      return duration === '30m' ? tier.singleOpen30m : tier.singleOpen60m;
    }
  } else {
    if (terrain === 'inside_circle') {
      return duration === '30m' ? tier.doubleInside30m : tier.doubleInside60m;
    } else {
      return duration === '30m' ? tier.doubleOpen30m : tier.doubleOpen60m;
    }
  }
}

export function getBuggyPrice(
  pricing: OffRoadPricingConfig = DEFAULT_OFF_ROAD_PRICING,
  model: 'polaris' | 'canam',
  seater: '2-seater' | '4-seater',
  duration: '30m' | '60m'
): number {
  const modelPricing = model === 'polaris' ? pricing.buggyPolaris : pricing.buggyCanAm;
  if (seater === '2-seater') {
    return duration === '30m' ? modelPricing.twoSeater30m : modelPricing.twoSeater60m;
  } else {
    return duration === '30m' ? modelPricing.fourSeater30m : modelPricing.fourSeater60m;
  }
}

export const EXPERIENCES: Experience[] = [
  // --- DESERT SAFARIS ---
  {
    id: 'evening-desert-safari',
    category: 'desert-safaris',
    categoryLabel: 'Desert Safaris',
    title: 'Evening Desert Safari',
    subtitle: 'Full Evening Experience',
    badge: 'Best Seller',
    badgeColor: 'from-[#EA580C] to-[#D97706]',
    duration: '7 Hours',
    priceAED: 120,
    priceUnit: 'From',
    description: 'The quintessential Dubai safari. Thrilling dune bashing in Red Lahbab sands, traditional Bedouin camp hospitality, live BBQ dinner buffet, and captivating cultural shows.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnHfQ_xD50mSdKpb_AX87krGRMEnUDwIXco_BEGwEs4j-EpVpiuGkmIUB5RwaW2iC42DL2UjCqzYVjEnvSEtZA-pMdChCLUsegIFFlflTsUd2y3BvsvfP5Q2Qunr7sWjRY9BCYTi9ANBMbBZ2SZ2Ps4ve8rYtJGe19JPv4az0YV1li5eXxA6Qd7PkZWZ3hpkfjU0G-jePPYEo66vWaKMQgeOdgBW4H_xBquYIVqQu8oHMDw6l00wWd8g',
    altText: 'A luxury 4x4 desert safari convoy resting on high dunes during golden sunset in Dubai, with passengers enjoying sandboarding and camel caravans walking gently in the background with soft amber twilight glow',
    highlights: [
      '45-min Dune Bashing',
      'Sunset Photo Stop',
      'Camel Trek Experience',
      'Sandboarding Thrill',
      'BBQ Buffet & Drinks',
      'Fire & Belly Dancing'
    ],
    departureTime: '02:30 PM - 03:15 PM',
    returnTime: '09:30 PM',
    hotelPickup: true,
    featured: true,
    vehicleType: 'Toyota Land Cruiser 4x4',
    itinerary: [
      { time: '03:00 PM', title: 'Home & Hotel Chauffeur Pickup', description: 'Air-conditioned 4x4 Land Cruiser picks you up directly from your Dubai home villa, apartment, or hotel lobby.' },
      { time: '04:15 PM', title: 'Red Lahbab High Dune Bashing', description: 'Experience 45 minutes of adrenaline-filled roller-coaster dune driving with DTCM certified desert marshals.' },
      { time: '05:30 PM', title: 'Golden Sunset & Sandboarding', description: 'Capture panoramic golden-hour photographs and glide down towering silky sand dunes on custom boards.' },
      { time: '06:30 PM', title: 'Bedouin Oasis Camp Welcome', description: 'Traditional Arabic coffee (Gahwa), sweet dates, complimentary henna hand painting, and camel rides.' },
      { time: '07:30 PM', title: '5-Star Live BBQ Buffet & Shows', description: 'Gourmet grilled meats, vegetarian delicacies, live Tanoura whirling dervish, and thrilling fire dancer show.' },
      { time: '09:15 PM', title: 'Starlit Convoy Return', description: 'Relaxed return drive dropping you comfortably back at your home or hotel doorstep.' }
    ]
  },
  {
    id: 'morning-desert-safari',
    category: 'desert-safaris',
    categoryLabel: 'Desert Safaris',
    title: 'Morning Desert Safari',
    subtitle: 'Crisp Sunrise Vibes',
    badge: 'Morning Escape',
    badgeColor: 'from-[#0284C7] to-[#0EA5E9]',
    duration: '3 Hours',
    priceAED: 450,
    priceUnit: 'From',
    description: 'Ideal for travelers tight on schedule or those wishing to beat the midday warmth. Witness magical first light over pristine windswept crests with coffee and dates.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhLKdZSpsI-THhAJCLrcsZPNj-gOSpy8oKdNCLk_Zbr7pJwpG0jCxyp74F-3k7VZkmFRWFZbnaUpoPIH789ox6geGZguTZMFP8P0kNyi2i-PY8OU5uSU2q5W64R-ZCeVSYZ9fkU-5ow2gcgYY9c06-rE3xXfSpfRXLh6fhnP4-y4kRs2vLFL-8TPusZfPXu8neq_IKYLv0jhNER6PQK0Ng-Ijnzn4LL0IgWfLjrxBHGnr51csBfKnYPg',
    altText: 'Serene Dubai desert dunes at sunrise with golden morning rays glistening over untouched sand ridges, accompanied by a luxury white 4x4 vehicle parked quietly and an adventurer sandboarding down a dune',
    highlights: [
      'Sunrise Golden Dune Run',
      'Camel Ride Experience',
      'High Dune Sandboarding',
      'Arabic Coffee & Dates',
      'Chilled Refreshments',
      'Pickup 05:00 - 05:30 AM'
    ],
    departureTime: '05:00 AM - 05:30 AM',
    returnTime: '09:00 AM - 09:30 AM',
    hotelPickup: true,
    featured: true,
    vehicleType: 'Luxury 4x4 Land Cruiser',
    itinerary: [
      { time: '05:00 AM', title: 'Dawn Hotel Pickup', description: 'Early morning pickup in fresh desert-ready 4x4 luxury fleet.' },
      { time: '06:00 AM', title: 'Sunrise Sand Crest Arrival', description: 'Watch the sun rise over endless ripple dunes while sipping freshly brewed Arabic coffee and enjoying dates.' },
      { time: '06:45 AM', title: 'Morning Dune Drive & Sandboard', description: 'Smooth morning dune bash on cool untouched sand followed by crest-to-valley sandboarding.' },
      { time: '08:00 AM', title: 'Desert Camel Trek', description: 'Gentle sunrise camel ride through the quiet dunes before the heat begins.' },
      { time: '09:00 AM', title: 'Return Before Noon', description: 'Comfortable drop-off back at your hotel in time for brunch or daytime meetings.' }
    ]
  },
  {
    id: 'private-vip-safari',
    category: 'private-convoys',
    categoryLabel: 'Private Royal Convoys',
    title: 'Private Desert Safari VIP',
    subtitle: 'Royal White Glove Treatment',
    badge: 'VIP Private',
    badgeColor: 'from-purple-700 to-amber-600',
    duration: 'Bespoke',
    priceAED: 850,
    priceUnit: 'Car Price',
    description: 'An exclusive private Land Cruiser solely reserved for your family or group. Includes dedicated desert guide, custom pickup schedules, VIP camp seating and table-side service.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx_MJlPnOvvZCL_s2zXsDSpcSN6vCQpxufteJb1bM_5-NVXfaords45N_89yoBdvN9ELQdxN1lG50G0JsJz15rDhvgko9ZnSSFWHFLz3VdIhPKnIo5JIhnAfc740WHCXOxbZNwRfu3CDgTLn1aBsVqF83pWND5oLGG4dooQb8M72CEGZbFObEhwNxsx2ztAsP4DyPYRlOhy_BgPer9UBdAhphRmdqxfei8IwYL5LcIisMgN4wJrtrePw',
    altText: 'Exclusive VIP desert camp setup in Dubai under star-lit evening sky with private table dining, warm lantern illumination, luxurious cushions, carpets on the sand and private 4x4 parked nearby',
    highlights: [
      'Dedicated Private 4x4',
      'Custom Pick-up Timing',
      'VIP Table Dining Service',
      'Falcon Photography',
      'Shisha on Table Included',
      'Up to 6 Guests Total'
    ],
    departureTime: 'Flexible (Your Choice)',
    returnTime: 'Flexible (Up to 10:00 PM)',
    hotelPickup: true,
    featured: true,
    vehicleType: 'Private VIP Land Cruiser 300 Series',
    itinerary: [
      { time: 'Custom', title: 'Private VIP Chauffeur', description: 'Private Land Cruiser exclusively dedicated to your party with bottled water and cold scented towels.' },
      { time: 'Flexible', title: 'Personalized Dune Experience', description: 'Tailor dune bashing intensity to your preference from gentle panoramic cruising to high-adrenaline drops.' },
      { time: 'Sunset', title: 'Private Falcon Encounter', description: 'Hold and photograph the majestic hunting falcon against the setting Arabian sun with falconer guidance.' },
      { time: 'Evening', title: 'VIP Table-side Dining & Shisha', description: 'Reserved cushioned majlis seating with dedicated personal waiter serving fresh barbecue skewers directly to your table.' }
    ]
  },

  // --- BUGGIES & QUAD BIKING ---
  {
    id: 'quad-bike-atv',
    category: 'buggies',
    categoryLabel: 'Buggies & Quad Biking',
    title: 'Quad Bike ATV Rental',
    subtitle: 'No Driving License Required',
    badge: 'Popular Adrenaline',
    duration: 'Session',
    priceAED: 150,
    priceUnit: '/ Session',
    description: 'Conquer open desert dunes on high-performance 220cc to 350cc Raptor ATVs. Full freedom in open desert dunes with helmet, goggles, and safety guide escort. Direct desert meeting point (free) or private 4x4 luxury transfer available.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3cf4jPrAC-DN5Da2vJ3_AGbHbR6Yx83Fa8N81kJ0Fe0oD87a2N_uLVWQbZW2Io8MdPi1Es_1bU7roSmN9lCjyb1fdk2uGtp0bKsod3-IPm9wxDqwXqvCZrgiEsYThx1JacNiHRBxVqp-EGOmKVV_iunEJuG04GQ9ta38QwMXXZBq_-KSto8HJDqypGth8xvt_T1PEBAqCFfEc9mE_AXABwf3Xc1lWLQKokQycJqqd6cGJtc6buc96jg',
    altText: 'An ATV rider powering a high-speed quad bike through Dubai red dunes carving sand trails during sunny daylight with protective helmet and gear',
    highlights: [
      '220cc & 350cc Raptor ATVs',
      'Helmet & Goggles Included',
      'Direct Meeting Point (Free)',
      'Private 4x4 Chauffeur Option',
      'Lead Desert Marshall',
      'Comprehensive Safety Brief'
    ],
    hotelPickup: false,
    vehicleType: 'Yamaha Raptor ATV (220cc / 350cc)',
    itinerary: [
      { time: '0-15 Min', title: 'Gear Fitting & Safety Brief', description: 'Professional briefing on throttle, brakes, body weight shifting and safety perimeter.' },
      { time: '15-45 Min', title: 'Open Dune Riding', description: 'Ride through sweeping open red sand tracks with a lead marshall guiding you along safe, thrilling lines.' },
      { time: '45-60 Min', title: 'High Ridge Photo Stop', description: 'Rest on top of towering sand peaks for dramatic photos and cooling refreshments.' }
    ]
  },
  {
    id: 'can-am-buggy-safari',
    category: 'buggies',
    categoryLabel: 'Buggies & Quad Biking',
    title: 'Can-Am Dune Buggy Safari',
    subtitle: 'Turbo High Performance',
    badge: 'High-Horsepower',
    duration: 'Buggy',
    priceAED: 1000,
    priceUnit: '/ Buggy',
    description: 'Drive 2-seater or 4-seater Can-Am Maverick X3 Turbo buggies with roll cages, 4-point harnesses, and desert guides. Direct meeting point at Lahbab camp or private 4x4 luxury transfer available.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmUuhU2zvZss3m2z-biFjAJWSc-FFBbo1m6ZnN3dfwWCVNQG6SnfV_9_rKM4lG_4ZxVczonwj4fFA8ROhBmd3wkntbAFTYyWk5iVKcvLmfug4xiWYsSITDwsR4KLWVGBghcaRz5lIZ-3lZl4hKk4yEG5pD_1nxWvvUe2jR7HOnv1ZMSUb2WelPbcAkCKqeglh2mmFr64taMzfh-Z42tEhCHT2lzyKMiOgMV3-AEgDrmDbgWeGZEJmFPw',
    altText: 'A customized high-performance Can-Am Maverick dune buggy racing over the crest of high desert dunes near Dubai kicking up sand with passengers wearing protective helmets',
    highlights: [
      'Can-Am Maverick X3 Turbo',
      '2-Seater & 4-Seater Options',
      'Direct Meeting Point (Free)',
      'Private 4x4 Chauffeur Option',
      'Roll-Cage & Race Harness',
      'Full Tank High-Octane Fuel'
    ],
    hotelPickup: false,
    vehicleType: 'Can-Am Maverick X3 Turbo 1000cc',
    itinerary: [
      { time: 'Arrival', title: 'Race Suit & Harness Adjustment', description: 'Fitted with professional helmets, dust goggles, and secure 4-point seatbelt harness.' },
      { time: 'Warm-up', title: 'Controls & Handling Drill', description: 'Learn power-steering response, 4WD crawl modes, and turbo throttle control.' },
      { time: 'Expedition', title: 'Conquer the Big Red Dunes', description: 'Follow the lead desert marshal car deep into untouched remote dune territory inaccessible to ordinary vehicles.' }
    ]
  },

  // --- SIGHTSEEING & UAE CITY EXCURSIONS ---
  {
    id: 'dubai-half-day-city-tour',
    category: 'city-tours',
    categoryLabel: 'City Sightseeing',
    title: 'Dubai Half-Day City Tour',
    subtitle: "Discover Dubai's Marvels",
    badge: 'Popular Sightseeing',
    duration: '6 Hours',
    priceAED: 75,
    priceUnit: 'From',
    description: 'Witness the transformation from ancient fishing village to glittering metropolis. Includes Burj Al Arab photo stop, Dubai Frame, Gold & Spice Souk, and Dubai Mall.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARCbBpC3G8-XasRWNmQgIyiyUnRKLJL4-VhxY964UAMEY-euFzP9c059Leon7MvPMCsQWJmlEeOx8wotquLmqoHznSUNq6ZpGD2lRzJn1CByeHLfvNvwhcgMDvP6zUuXuQ_oKIiAHIkRzFoDB-oPzTLVzP09IhOOyLkZC3qpS1-mNXEqQESQanEoVxVXzA67Lk6wGogsA0GciEgZte8xmr28piUdxYxqsuNj-yTGC4z4JBJml0RbCVfg',
    altText: 'Panoramic view of modern Dubai skyline including Burj Al Arab, luxury yachts in Dubai Marina and the historic Dubai Creek in golden afternoon sunlight',
    highlights: [
      'AC Transport & Tour Guide',
      'Abra Boat Crossing at Creek',
      'Burj Al Arab & Jumeirah Beach',
      'Gold & Spice Souk Walk',
      'Dubai Frame Panorama Stop',
      'Zabeel Palace Pass'
    ],
    departureTime: '08:30 AM - 09:00 AM',
    returnTime: '02:30 PM',
    hotelPickup: true,
    vehicleType: 'Luxury AC Mini-Coach',
    itinerary: [
      { time: '09:00 AM', title: 'Pickup & Jumeirah Mosque Drive', description: 'Scenic drive past Dubai coastline and iconic white stone Jumeirah Mosque.' },
      { time: '10:00 AM', title: 'Burj Al Arab & Palm Jumeirah', description: 'Exclusive stop on Jumeirah Beach overlooking the sail-shaped 7-star hotel.' },
      { time: '11:15 AM', title: 'Old Dubai & Historic Abra Crossing', description: 'Glide across Dubai Creek on a traditional wooden Abra to the bustling Spice and Gold Souks.' },
      { time: '01:00 PM', title: 'Dubai Frame & Downtown Mall', description: 'Marvel at the architectural bridge between Old and New Dubai before final drop-off.' }
    ]
  },
  {
    id: 'abu-dhabi-tour-from-dubai',
    category: 'city-tours',
    categoryLabel: 'City Sightseeing',
    title: 'Abu Dhabi Tour from Dubai',
    subtitle: 'UAE Capital Odyssey',
    badge: 'Full Day Odyssey',
    duration: '8h 30m',
    priceAED: 150,
    priceUnit: 'From',
    description: 'Full-day capital journey featuring the awe-inspiring Sheikh Zayed Grand Mosque, Emirates Palace photo opportunity, Abu Dhabi Corniche, and Ferrari World Yas Island.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXPfyCuA5lyqU7evGIb2FceRF2y2FoioBzdAuIqxMsH48LLUKlgG5P2ofNMkB-E6HZHfEYuEphGo-1Q8LoFxAR5ZqqRnc2MQlPitOEVPLZ0Qy864vW2VSgx9i5Ctq1lAuSbIjdzOP6AgOGCL58LVqUfVZNbu7APd8EHMqvmqg8LChbSb6LXbmBXhDqzWzSTO4zVbZGHdkNcKXt9CxjZJJoFt_TsAOdQ75HDJfnMg-oTswWYenH5_iuIw',
    altText: 'Majestic Sheikh Zayed Grand Mosque in Abu Dhabi with white marble domes, reflective pools, ornate gold minarets under a clear sky',
    highlights: [
      'Mosque Entry Pass & Dress Assistance',
      'Roundtrip Dubai Hotel Pick & Drop',
      'Emirates Palace & Etihad Towers',
      'Abu Dhabi Corniche Promenade',
      'Heritage Village Cultural Visit',
      'Ferrari World Yas Island Stop'
    ],
    departureTime: '08:00 AM - 08:30 AM',
    returnTime: '05:00 PM',
    hotelPickup: true,
    vehicleType: 'Executive Coach with Free WiFi',
    itinerary: [
      { time: '08:30 AM', title: 'Highway Highway Drive to Capital', description: 'Comfortable 90-minute drive down Sheikh Zayed Road connecting Dubai and Abu Dhabi.' },
      { time: '10:30 AM', title: 'Sheikh Zayed Grand Mosque Tour', description: '2 hours inside the architectural masterpiece featuring the world largest hand-knotted carpet and crystal chandeliers.' },
      { time: '01:00 PM', title: 'Corniche & Emirates Palace', description: 'Breathtaking coastal skyline views and photo stop at the golden Emirates Palace.' },
      { time: '02:30 PM', title: 'Heritage Village & Date Market', description: 'Explore authentic pre-oil desert craftsmanship and sample premium Emirati dates.' },
      { time: '03:45 PM', title: 'Ferrari World Yas Island Photo Stop', description: 'Visit the futuristic Yas Island entertainment hub before returning to Dubai.' }
    ]
  },
  {
    id: 'marina-luxury-dhow-cruise',
    category: 'city-tours',
    categoryLabel: 'City Sightseeing',
    title: 'Marina Luxury Dhow Cruise',
    subtitle: 'Waterfront Dining',
    badge: 'Evening Cruise',
    duration: '2 Hours',
    priceAED: 110,
    priceUnit: 'From',
    description: "Sail along Dubai Marina's world-renowned skyline. Enjoy an international 5-star buffet dinner, soft drinks, ambient music, and live Tanoura dance performances.",
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAh1wX_W7KyozasE7f5-naObZ1gSRbV0UoV5qbhv32sk_Je7mGVmOxIdApZheVHWu33ILWAsdN6BbWT8O5LcGE3nu9LucMxHsZR4z6t2SrYDG5rjURmUHdSB6HcCPK98rqG2Um8ax7igChKltv3zVa6mXz2vFdkjM7QCeSf21AM9lZa7u5O3J7mVgsDjgvG2fblTUJ31fyCfWxKcc126CYryVuth49kZTs-j2b_hiQ-w7yfCgXCYbhwog',
    altText: 'Traditional illuminated wooden Arabian dhow cruising along the illuminated skyscraper canal of Dubai Marina during night with ambient lighting',
    highlights: [
      'International Multi-Cuisine Buffet',
      'Upper Deck Open Air Sightseeing',
      'Ain Dubai & Marina Mall Views',
      'Live Tanoura Folk Performance',
      'Unlimited Soft Drinks, Tea & Coffee',
      'Red Carpet Welcome Drink'
    ],
    departureTime: '08:00 PM (Boarding 07:30 PM)',
    returnTime: '10:30 PM',
    hotelPickup: true,
    vehicleType: 'Traditional Double-Decker Wooden Dhow',
    itinerary: [
      { time: '07:30 PM', title: 'Marina Promenade Boarding', description: 'Warm Arabic coffee, cold juices, and red carpet welcome onto the luxury dhow.' },
      { time: '08:15 PM', title: 'Dhow Cruise Departure', description: 'Set sail through the 3km Dubai Marina canal surrounded by illuminated skyscrapers.' },
      { time: '08:45 PM', title: 'Grand Buffet Dinner Opens', description: 'Enjoy multi-course delicacies prepared by 5-star culinary chefs with fresh salads, kebabs, and desserts.' },
      { time: '09:30 PM', title: 'Live Tanoura Dancing Show', description: 'Mesmerizing hypnotic spinning dancer with glowing illuminated skirts on the open deck.' }
    ]
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Marcus & Elena Lindqvist',
    location: 'Stockholm, Sweden',
    experienceType: 'Evening Safari',
    rating: 5,
    date: '3 days ago',
    content: '"The dune bashing was utterly exhilarating! Our guide Tariq was super experienced and made us feel safe while giving us heart-stopping dune drops. The VIP camp dinner was fresh, and the fire show was the highlight for our children."',
    avatarInitial: 'M',
    avatarBg: 'bg-amber-100 text-[#EA580C]',
    verified: true
  },
  {
    id: 'rev-2',
    author: 'Dr. Faisal Al-Hussaini',
    location: 'Riyadh, KSA',
    experienceType: 'Private VIP Safari',
    rating: 5,
    date: '1 week ago',
    content: '"Rented the Can-Am Buggy Maverick for an hour followed by the private camp dinner. Flawless white-glove communication from their Business Bay office on WhatsApp. Punctual hotel pickup in a brand new Land Cruiser."',
    avatarInitial: 'D',
    avatarBg: 'bg-orange-100 text-[#EA580C]',
    verified: true
  },
  {
    id: 'rev-3',
    author: 'Claire & Jonathan Wright',
    location: 'London, UK',
    experienceType: 'Safari & City Combo',
    rating: 5,
    date: '2 weeks ago',
    content: '"Did both the Dubai City tour and Morning Safari in one combo package. Everything ran like clockwork. Fair transparent pricing with zero surprise charges. Best experience in UAE!"',
    avatarInitial: 'C',
    avatarBg: 'bg-amber-100 text-[#EA580C]',
    verified: true
  },
  {
    id: 'rev-4',
    author: 'Sophie & Matthieu Laurent',
    location: 'Paris, France',
    experienceType: 'Can-Am Dune Buggy',
    rating: 5,
    date: '3 weeks ago',
    content: '"Driving the Can-Am Maverick in the open red desert was one of the greatest thrills of our lives! The buggy was clean, powerful, and our escort lead car ensured we did not get stuck in deep sand. 10/10 recommend Phoenix!"',
    avatarInitial: 'S',
    avatarBg: 'bg-orange-100 text-[#C2410C]',
    verified: true
  },
  {
    id: 'rev-5',
    author: 'Captain Ahmed Bin Zayed',
    location: 'Dubai, UAE',
    experienceType: 'Private Royal Convoy',
    rating: 5,
    date: '1 month ago',
    content: '"We booked 3 private Land Cruisers for overseas business guests. Phoenix delivered exceptional white-glove service, immaculate cars, and private VIP table dining away from the crowd. Our top recommendation in Dubai."',
    avatarInitial: 'A',
    avatarBg: 'bg-amber-100 text-[#D97706]',
    verified: true
  }
];

export const CURRENCY_RATES: Record<Currency, { rate: number; symbol: string }> = {
  AED: { rate: 1.0, symbol: 'AED' },
  USD: { rate: 0.272, symbol: '$' },
  EUR: { rate: 0.252, symbol: '€' },
  GBP: { rate: 0.215, symbol: '£' }
};
