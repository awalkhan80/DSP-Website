/**
 * The Phoenix Desert Safari Dubai - Bespoke Frontend Application
 * Handles interactive booking dock, category filter tabs, itinerary modals, and WhatsApp concierge.
 */

// Load tours from window or embedded store
const TOURS_DATA = [
  {
    id: "evening-desert-safari",
    category: "desert-safaris",
    categoryLabel: "Desert Safaris",
    title: "Evening Desert Safari",
    subtitle: "Full Evening Red Dune Experience",
    badge: "Signature Best Seller",
    duration: "7 Hours",
    priceAED: 120,
    childPriceAED: 85,
    vehicleType: "Toyota Land Cruiser 4x4",
    description: "The quintessential Dubai safari. Thrilling dune bashing in Red Lahbab sands, traditional Bedouin camp hospitality, live BBQ dinner buffet, and captivating cultural shows.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnHfQ_xD50mSdKpb_AX87krGRMEnUDwIXco_BEGwEs4j-EpVpiuGkmIUB5RwaW2iC42DL2UjCqzYVjEnvSEtZA-pMdChCLUsegIFFlflTsUd2y3BvsvfP5Q2Qunr7sWjRY9BCYTi9ANBMbBZ2SZ2Ps4ve8rYtJGe19JPv4az0YV1li5eXxA6Qd7PkZWZ3hpkfjU0G-jePPYEo66vWaKMQgeOdgBW4H_xBquYIVqQu8oHMDw6l00wWd8g",
    highlights: ["45-min High Dune Bashing", "Sunset Photo Stop", "Camel Trekking", "Sandboarding Thrill", "Live BBQ Buffet & Sweets", "Fire & Tanoura Shows"],
    departureTime: "02:30 PM - 03:15 PM",
    returnTime: "09:30 PM",
    itinerary: [
      { time: "03:00 PM", title: "Home & Hotel Doorstep Pickup", description: "Air-conditioned 4x4 Land Cruiser picks you up directly from your Dubai hotel or residence." },
      { time: "04:15 PM", title: "Red Lahbab High Dune Bashing", description: "Experience 45 minutes of exhilarating roller-coaster dune driving with DTCM certified desert marshals." },
      { time: "05:30 PM", title: "Golden Sunset & Sandboarding", description: "Capture panoramic golden-hour photographs and glide down silky crimson dunes on custom boards." },
      { time: "06:30 PM", title: "Bedouin Oasis Camp Welcome", description: "Traditional Arabic coffee (Gahwa), fresh dates, complimentary henna hand painting, and camel rides." },
      { time: "07:30 PM", title: "5-Star Live BBQ Buffet & Shows", description: "Gourmet grilled meats, vegetarian delicacies, live Tanoura whirling dervish, and thrilling fire dancer show." },
      { time: "09:15 PM", title: "Starlit Convoy Return", description: "Relaxed return drive dropping you comfortably back at your home or hotel doorstep." }
    ]
  },
  {
    id: "morning-desert-safari",
    category: "desert-safaris",
    categoryLabel: "Desert Safaris",
    title: "Morning Sunrise Desert Safari",
    subtitle: "Private 4x4 Sunrise Dunes & Breakfast",
    badge: "Sunrise Special",
    duration: "4 Hours",
    priceAED: 450,
    childPriceAED: 350,
    vehicleType: "Private Land Cruiser 300 (Up to 6 Pax)",
    description: "Witness the tranquil majesty of Dubai's virgin dunes at dawn. Crisp desert air, 45-min dune bashing, camel trekking, sandboarding, and traditional Arabic breakfast.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhLKdZSpsI-THhAJCLrcsZPNj-gOSpy8oKdNCLk_Zbr7pJwpG0jCxyp74F-3k7VZkmFRWFZbnaUpoPIH789ox6geGZguTZMFP8P0kNyi2i-PY8OU5uSU2q5W64R-ZCeVSYZ9fkU-5ow2gcgYY9c06-rE3xXfSpfRXLh6fhnP4-y4kRs2vLFL-8TPusZfPXu8neq_IKYLv0jhNER6PQK0Ng-Ijnzn4LL0IgWfLjrxBHGnr51csBfKnYPg",
    highlights: ["Sunrise Photography Stop", "45-min Pure Dune Driving", "Camel Caravanning", "Sandboarding", "Arabian Breakfast & Gahwa", "Private Vehicle"],
    departureTime: "05:00 AM - 05:45 AM",
    returnTime: "09:30 AM",
    itinerary: [
      { time: "05:15 AM", title: "Early Morning Chauffeur Pickup", description: "Private 4x4 Land Cruiser arrives at your accommodation." },
      { time: "06:15 AM", title: "Sunrise Over Red Dunes", description: "Watch the golden sun rise over the pristine desert horizon with serene photo moments." },
      { time: "07:00 AM", title: "Morning Dune Bashing & Sandboarding", description: "Exhilarating dune driving over untouched morning ripples with certified desert marshal." },
      { time: "08:15 AM", title: "Camel Trek & Refreshments", description: "Gentle camel ride followed by Arabian coffee, tea, and picnic breakfast box." },
      { time: "09:30 AM", title: "Doorstep Return", description: "Arrive back in Dubai before the midday sun." }
    ]
  },
  {
    id: "private-vip-safari",
    category: "private-convoys",
    categoryLabel: "Private VIP Convoys",
    title: "Royal VIP Desert Safari",
    subtitle: "Bespoke Land Cruiser 300 Series",
    badge: "Ultra Luxury",
    duration: "Bespoke (7 Hours)",
    priceAED: 850,
    childPriceAED: 850,
    vehicleType: "Exclusive 2026 Land Cruiser 300",
    description: "Private luxury chauffeur, personalized dune driving tempo, dedicated VIP table service, open premium BBQ buffet, falconry photography, and secluded oasis seating.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCx_MJlPnOvvZCL_s2zXsDSpcSN6vCQpxufteJb1bM_5-NVXfaords45N_89yoBdvN9ELQdxN1lG50G0JsJz15rDhvgko9ZnSSFWHFLz3VdIhPKnIo5JIhnAfc740WHCXOxbZNwRfu3CDgTLn1aBsVqF83pWND5oLGG4dooQb8M72CEGZbFObEhwNxsx2ztAsP4DyPYRlOhy_BgPer9UBdAhphRmdqxfei8IwYL5LcIisMgN4wJrtrePw",
    highlights: ["Private 300-Series Vehicle", "Dedicated Master Driver", "VIP Air-Cooled Majlis Table", "Silver Service Dining", "Private Falconry Photo", "Premium Hookah / Shisha"],
    departureTime: "03:00 PM",
    returnTime: "10:00 PM",
    itinerary: [
      { time: "03:00 PM", title: "VIP Black-Car Chauffeur Pickup", description: "Exclusive private Land Cruiser pickup anywhere in Dubai or Sharjah." },
      { time: "04:15 PM", title: "Customized High Dune Expedition", description: "Tailored to your preference from gentle panoramic cruising to thrilling extreme dune climbs." },
      { time: "05:45 PM", title: "Private Dunes Sunset Toast", description: "Chilled sparkling dates juice, Arabic sweets, and private falcon holding." },
      { time: "06:45 PM", title: "Reserved Royal Majlis Lounge", description: "Skip all queues with dedicated table service waiter and private dining canopy." },
      { time: "07:30 PM", title: "Table-Served Gourmet BBQ Feast", description: "Freshly prepared premium grilled skewers and traditional Emirati mezze." },
      { time: "09:45 PM", title: "VIP Direct Return", description: "Express drop-off directly to your hotel suite or residence." }
    ]
  },
  {
    id: "can-am-buggy-safari",
    category: "buggies",
    categoryLabel: "Dune Buggies & ATVs",
    title: "Can-Am Maverick X3 Turbo Dune Buggy",
    subtitle: "1000cc Self-Drive Dune Beast",
    badge: "Extreme Power",
    duration: "1 Hour Drive + Safari",
    priceAED: 1000,
    childPriceAED: 500,
    vehicleType: "Can-Am Maverick X3 (2 or 4 Seater)",
    description: "Unleash raw off-road adrenaline across Dubai's steepest dunes. Full roll-cage, 4-point racing harness, helmet, goggles, and certified desert guide escort.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmUuhU2zvZss3m2z-biFjAJWSc-FFBbo1m6ZnN3dfwWCVNQG6SnfV_9_rKM4lG_4ZxVczonwj4fFA8ROhBmd3wkntbAFTYyWk5iVKcvLmfug4xiWYsSITDwsR4KLWVGBghcaRz5lIZ-3lZl4hKk4yEG5pD_1nxWvvUe2jR7HOnv1ZMSUb2WelPbcAkCKqeglh2mmFr64taMzfh-Z42tEhCHT2lzyKMiOgMV3-AEgDrmDbgWeGZEJmFPw",
    highlights: ["1000cc Turbo Engine", "No License Required", "Safety Briefing & Full Gear", "Open High Red Dunes", "Expert Lead Guide", "Hotel Transfer Included"],
    departureTime: "Morning & Afternoon Slots",
    returnTime: "Flexible",
    itinerary: [
      { time: "Slot 1", title: "Hotel Transfer to Buggy Depot", description: "Comfortable pickup and transport to the high dunes off-road base." },
      { time: "Slot 2", title: "Safety Orientation & Gear Up", description: "Professional helmet, goggles fitting, and vehicle controls tutorial." },
      { time: "Slot 3", title: "60-Min Guided Open Dune Driving", description: "Follow our lead desert marshal through sand valleys and knife-edge ridge crests." },
      { time: "Slot 4", title: "Hydration Stop & Photography", description: "Pause on red dunes for spectacular action photos." },
      { time: "Slot 5", title: "Return Chauffeur Transfer", description: "Transfer back to your hotel." }
    ]
  },
  {
    id: "quad-bike-atv",
    category: "buggies",
    categoryLabel: "Dune Buggies & ATVs",
    title: "Yamaha Quad Bike ATV Safari",
    subtitle: "250cc & 350cc Dune Quad Adventure",
    badge: "Popular Thrill",
    duration: "30 - 60 Minutes",
    priceAED: 150,
    childPriceAED: 150,
    vehicleType: "Yamaha 250cc / 350cc ATV",
    description: "Conquer the desert sand on an agile four-wheel all-terrain bike. Automatic transmission, easy controls, enclosed track or open red dunes options.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3cf4jPrAC-DN5Da2vJ3_AGbHbR6Yx83Fa8N81kJ0Fe0oD87a2N_uLVWQbZW2Io8MdPi1Es_1bU7roSmN9lCjyb1fdk2uGtp0bKsod3-IPm9wxDqwXqvCZrgiEsYThx1JacNiHRBxVqp-EGOmKVV_iunEJuG04GQ9ta38QwMXXZBq_-KSto8HJDqypGth8xvt_T1PEBAqCFfEc9mE_AXABwf3Xc1lWLQKokQycJqqd6cGJtc6buc96jg",
    highlights: ["Automatic Transmission", "Helmets & Goggles Provided", "Beginner Friendly", "Open Desert Tracks", "Photo Opportunities", "Instant Booking"],
    departureTime: "Flexible Daily Departures",
    returnTime: "Flexible",
    itinerary: [
      { time: "Pickup", title: "Hotel Transfer to Dunes", description: "Transfer directly to the private desert quad camp." },
      { time: "Briefing", title: "Mechanic Briefing & Helmet Fitting", description: "Instructions on throttle, brake, and safe sand handling." },
      { time: "Ride", title: "Quad Bike Dune Run", description: "Drive through designated desert terrain with guide monitors." },
      { time: "Wrap", title: "Cold Drinks & Return", description: "Enjoy complimentary water/sodas and return to vehicle." }
    ]
  },
  {
    id: "abu-dhabi-tour-from-dubai",
    category: "city-tours",
    categoryLabel: "City & Sightseeing Tours",
    title: "Abu Dhabi Grand Mosque & City Highlights",
    subtitle: "Full Day Guided Tour with Sheikh Zayed Mosque",
    badge: "Top Cultural Tour",
    duration: "8.5 Hours",
    priceAED: 150,
    childPriceAED: 120,
    vehicleType: "Luxury Mercedes Sprinter / SUV",
    description: "Explore the UAE capital with expert licensed guide. Sheikh Zayed Grand Mosque, Emirates Palace photo stop, Heritage Village, Corniche drive, and Ferrari World photo stop.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXPfyCuA5lyqU7evGIb2FceRF2y2FoioBzdAuIqxMsH48LLUKlgG5P2ofNMkB-E6HZHfEYuEphGo-1Q8LoFxAR5ZqqRnc2MQlPitOEVPLZ0Qy864vW2VSgx9i5Ctq1lAuSbIjdzOP6AgOGCL58LVqUfVZNbu7APd8EHMqvmqg8LChbSb6LXbmBXhDqzWzSTO4zVbZGHdkNcKXt9CxjZJJoFt_TsAOdQ75HDJfnMg-oTswWYenH5_iuIw",
    highlights: ["Sheikh Zayed Grand Mosque Visit", "Emirates Palace & Presidential Palace", "Abu Dhabi Corniche Drive", "Heritage Village & Dates Market", "Yas Island & Ferrari World", "Certified Tour Guide"],
    departureTime: "08:30 AM - 09:15 AM",
    returnTime: "06:00 PM",
    itinerary: [
      { time: "09:00 AM", title: "Dubai Hotel Departure", description: "Scenic highway drive to the capital city of Abu Dhabi." },
      { time: "11:00 AM", title: "Sheikh Zayed Grand Mosque Tour", description: "2 hours inside the world's most breathtaking architectural masterpiece (Abayas provided)." },
      { time: "01:30 PM", title: "Abu Dhabi Corniche & Breakwater", description: "Stunning skyline views and photo stop at the Emirates Palace." },
      { time: "03:00 PM", title: "Heritage Village & Dates Market", description: "Authentic cultural immersion with tastings of premium medjool dates." },
      { time: "04:30 PM", title: "Yas Island & Ferrari World Stop", description: "Iconic red roof photo stop at Yas Island." },
      { time: "06:00 PM", title: "Return Transfer to Dubai", description: "Comfortable drop-off back to your hotel." }
    ]
  },
  {
    id: "marina-luxury-dhow-cruise",
    category: "city-tours",
    categoryLabel: "City & Sightseeing Tours",
    title: "Dubai Marina 5-Star Luxury Dhow Dinner Cruise",
    subtitle: "Illuminated Marina, JBR & Ain Dubai Views",
    badge: "Romantic Evening",
    duration: "2 Hours Cruise",
    priceAED: 110,
    childPriceAED: 85,
    vehicleType: "Traditional Glass-Enclosed Wooden Dhow",
    description: "Glide beneath Dubai Marina's soaring illuminated skyscrapers. 5-star international buffet dinner, live Tanoura performance, background lounge music, and open-air upper deck.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAh1wX_W7KyozasE7f5-naObZ1gSRbV0UoV5qbhv32sk_Je7mGVmOxIdApZheVHWu33ILWAsdN6BbWT8O5LcGE3nu9LucMxHsZR4z6t2SrYDG5rjURmUHdSB6HcCPK98rqG2Um8ax7igChKltv3zVa6mXz2vFdkjM7QCeSf21AM9lZa7u5O3J7mVgsDjgvG2fblTUJ31fyCfWxKcc126CYryVuth49kZTs-j2b_hiQ-w7yfCgXCYbhwog",
    highlights: ["2-Hour Gliding Cruise", "International 5-Star Buffet", "Views of Ain Dubai & Marina Skyline", "Live Tanoura Dancing", "Unlimited Soft Beverages", "Upper & Lower Decks"],
    departureTime: "07:30 PM Boarding",
    returnTime: "10:30 PM",
    itinerary: [
      { time: "07:30 PM", title: "Red Carpet Marina Boarding", description: "Welcome Arabic coffee, juices, and table escort." },
      { time: "08:30 PM", title: "Cruise Sails Past Iconic Landmarks", description: "Glide past Cayan Tower, Bluewaters Island, and Ain Dubai." },
      { time: "08:45 PM", title: "Gourmet Buffet Dinner Opens", description: "Feast on freshly prepared Asian, Arabic, and Continental dishes." },
      { time: "09:30 PM", title: "Live Cultural Tanoura Show", description: "Fascinating spinning dance performance on the open deck." },
      { time: "10:30 PM", title: "Docking at Dubai Marina Harbor", description: "Disembarkation with hotel transfer option." }
    ]
  },
  {
    id: "dubai-half-day-city-tour",
    category: "city-tours",
    categoryLabel: "City & Sightseeing Tours",
    title: "Dubai Half-Day Classic & Modern City Tour",
    subtitle: "From Historic Al Fahidi to Burj Al Arab",
    badge: "Great Value",
    duration: "5 Hours",
    priceAED: 75,
    childPriceAED: 60,
    vehicleType: "Air-Conditioned Tour Coach / Mini-Bus",
    description: "Discover Dubai’s transformation from a humble pearl diving village to a global metropolis. Dubai Creek, Gold & Spice Souks, Abra boat crossing, Jumeirah Mosque, and Burj Al Arab photo stop.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuARCbBpC3G8-XasRWNmQgIyiyUnRKLJL4-VhxY964UAMEY-euFzP9c059Leon7MvPMCsQWJmlEeOx8wotquLmqoHznSUNq6ZpGD2lRzJn1CByeHLfvNvwhcgMDvP6zUuXuQ_oKIiAHIkRzFoDB-oPzTLVzP09IhOOyLkZC3qpS1-mNXEqQESQanEoVxVXzA67Lk6wGogsA0GciEgZte8xmr28piUdxYxqsuNj-yTGC4z4JBJml0RbCVfg",
    highlights: ["Traditional Abra Boat Ride", "Gold & Spice Souk Walking Tour", "Burj Al Arab Beach Photo", "Dubai Creek Historical Views", "Palm Jumeirah & Atlantis Drive", "Certified English Guide"],
    departureTime: "08:30 AM",
    returnTime: "01:30 PM",
    itinerary: [
      { time: "08:30 AM", title: "Hotel Chauffeur Pickup", description: "Morning pickup across central Dubai hotels." },
      { time: "09:15 AM", title: "Old Dubai & Abra Crossing", description: "Ride the traditional wooden boat across Dubai Creek." },
      { time: "10:15 AM", title: "Spice & Gold Souks", description: "Stroll through centuries-old bazaars with aromatic spices and gleaming jewelry." },
      { time: "11:30 AM", title: "Jumeirah Beach & Burj Al Arab", description: "World-famous photo stop in front of the sail-shaped 7-star hotel." },
      { time: "01:30 PM", title: "Drop-off at Dubai Mall or Hotel", description: "Option to stay at Dubai Mall for Burj Khalifa or return to hotel." }
    ]
  },
  {
    id: "burj-khalifa-124-125",
    category: "city-tours",
    categoryLabel: "City & Sightseeing Tours",
    title: "Burj Khalifa At The Top (Level 124 & 125)",
    subtitle: "Fast-Track Entry to World's Tallest Tower",
    badge: "Must Visit",
    duration: "1.5 Hours",
    priceAED: 175,
    childPriceAED: 140,
    vehicleType: "Direct Ticket Voucher with QR",
    description: "Ascend 452 meters in 60 seconds on high-speed double-deck elevators. 360-degree panoramic views of Dubai's skyline, Arabian Gulf, and desert.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    highlights: ["Level 124 & 125 Access", "High-Speed Elevator", "Outdoor Observation Terrace", "High-Powered Telescopes", "Instant Mobile Voucher", "Skip-the-Ticket-Line"],
    departureTime: "Daily Slots (09:00 AM - 11:00 PM)",
    returnTime: "Self-Paced",
    itinerary: [
      { time: "Step 1", title: "Arrive at Dubai Mall Lower Ground", description: "Present digital ticket voucher at the At The Top entrance." },
      { time: "Step 2", title: "Super-Fast Elevator Ride", description: "Travel at 10 meters/sec with multimedia presentation." },
      { time: "Step 3", title: "Observation Deck Experience", description: "Enjoy unobstructed skyline views and outdoor terrace." }
    ]
  },
  {
    id: "miracle-garden-global-village-combo",
    category: "city-tours",
    categoryLabel: "City & Sightseeing Tours",
    title: "Miracle Garden & Global Village Tour Combo",
    subtitle: "Admission Tickets with Doorstep Transfers",
    badge: "Seasonal Favorite",
    duration: "7 Hours",
    priceAED: 500,
    childPriceAED: 400,
    vehicleType: "Private Chauffeur Car",
    description: "Marvel at 150 million blooming flowers arranged in surreal castles and sculptures, followed by an evening exploring 90+ cultural country pavilions at Global Village.",
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=80",
    highlights: ["Both Admission Tickets Included", "Private Return Vehicle", "150 Million Blooming Flowers", "Emirates A380 Floral Structure", "90+ Global Pavilions", "Street Food & Shows"],
    departureTime: "02:30 PM",
    returnTime: "09:30 PM",
    itinerary: [
      { time: "02:30 PM", title: "Doorstep Pickup", description: "Private vehicle pickup from your hotel." },
      { time: "03:15 PM", title: "Dubai Miracle Garden Exploration", description: "Walk through floral tunnels, heart arches, and giant flower clocks." },
      { time: "06:00 PM", title: "Global Village Evening Immersion", description: "Explore world cultural pavilions, live acrobatics, and food street stalls." },
      { time: "09:30 PM", title: "Private Return Chauffeur", description: "Relaxed drop-off at your hotel." }
    ]
  },
  {
    id: "skydive-dubai-tandem-palm",
    category: "city-tours",
    categoryLabel: "City & Sightseeing Tours",
    title: "Skydive Dubai Tandem Jump — Palm Drop Zone",
    subtitle: "13,000 Feet Freefall over Palm Jumeirah",
    badge: "Bucket List",
    duration: "3 Hours Experience",
    priceAED: 2700,
    childPriceAED: 2700,
    vehicleType: "Twin Otter Aircraft",
    description: "The ultimate rush on earth. 60-second freefall at 120 mph with an experienced instructor, landing gracefully with views of the Palm Jumeirah and Dubai Marina. Full 4K video included.",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80",
    highlights: ["Tandem Jump from 13,000 ft", "60-Second Pure Freefall", "Views of Palm Jumeirah & Marina", "Dedicated Camera Flyer Included", "Official Edited Video & Photos", "USPA Certified Instructors"],
    departureTime: "Morning Slots",
    returnTime: "Flexible",
    itinerary: [
      { time: "Arrival", title: "Drop Zone Check-In", description: "Registration, health questionnaire, and instructor introduction." },
      { time: "Pre-Flight", title: "Safety Briefing & Harnessing", description: "20-minute safety run-through and gear check." },
      { time: "Flight", title: "Scenic Ascent to 13,000 ft", description: "20-minute panoramic flight over the Dubai coastline." },
      { time: "The Jump", title: "60-Second Adrenaline Freefall", description: "Speeds exceeding 190 km/h followed by 5-minute canopy glide." }
    ]
  },
  {
    id: "alexandra-dhow-cruise-dubai-marina",
    category: "city-tours",
    categoryLabel: "City & Sightseeing Tours",
    title: "Alexandra 5-Star Wooden Dhow Cruise",
    subtitle: "Fine Dining with Live Vocalist & Saxophone",
    badge: "Boutique Experience",
    duration: "2 Hours",
    priceAED: 165,
    childPriceAED: 120,
    vehicleType: "Refurbished Luxury Teak Dhow",
    description: "Dubai Marina's premier boutique dinner cruise. Authentic teak wood vessel, live singer, gourmet chef-prepared banquet, and scenic routing through the Dubai Marina canal.",
    image: "https://traveldesk-djbmfrc9edfxb9ec.z01.azurefd.net/photos/3666-fhd.webp",
    highlights: ["Live Female Vocalist & Music", "Chef-Crafted 5-Star Menu", "Boutique Teak Wood Setting", "Ain Dubai & Bluewaters Route", "Complimentary Welcome Drink", "Premium Table Amenities"],
    departureTime: "08:00 PM Boarding",
    returnTime: "10:30 PM",
    itinerary: [
      { time: "08:00 PM", title: "Boarding at Marina Yacht Club", description: "Captain's greeting and seated at your table." },
      { time: "08:30 PM", title: "Sailing & Live Music Starts", description: "Smooth cruise along Dubai Marina's high-rise corridor." },
      { time: "09:00 PM", title: "Five-Star Dinner Buffet", description: "Freshly prepared roast carving station, seafood, and desserts." },
      { time: "10:30 PM", title: "Return to Harbor", description: "Disembarkation at Dubai Marina." }
    ]
  },
  {
    id: "aya-universe-dubai-experience",
    category: "city-tours",
    categoryLabel: "City & Sightseeing Tours",
    title: "AYA Universe Immersive Sensory Experience",
    subtitle: "12 Interactive Cosmic Zones at WAFI Mall",
    badge: "Instagram Hit",
    duration: "2 Hours",
    priceAED: 135,
    childPriceAED: 95,
    vehicleType: "Digital Entry Pass with Instant QR",
    description: "Step into an extraterrestrial universe with bioluminescent gardens, reversed waterfalls, and infinite starry galaxies mapped with reactive light and sound projections.",
    image: "https://traveldesk-djbmfrc9edfxb9ec.z01.azurefd.net/photos/4354-fhd.webp",
    highlights: ["12 Multi-Sensory Zones", "Flora Bioluminescent Garden", "The River Luminous Waterfall", "Zero-Gravity Starry Ceilings", "Family & Kid Friendly", "Instant QR Confirmation"],
    departureTime: "Open Daily 10:00 AM - 10:00 PM",
    returnTime: "Self-Paced",
    itinerary: [
      { time: "Zone 1-4", title: "Aurora & The Source", description: "Interactive touch-sensitive light chambers reacting to footsteps." },
      { time: "Zone 5-8", title: "Drift & Outland", description: "Recline on celestial pods while cosmic nebula projections drift overhead." },
      { time: "Zone 9-12", title: "Flora & Harmonia", description: "Bioluminescent botanical forests with synchronized light orchestra." }
    ]
  },
  {
    id: "burj-khalifa-fountain-lake-ride",
    category: "city-tours",
    categoryLabel: "City & Sightseeing Tours",
    title: "Dubai Fountain Boardwalk & Lake Abra Ride",
    subtitle: "Front-Row Dancing Fountain Spectacle",
    badge: "Front-Row View",
    duration: "45 Minutes",
    priceAED: 100,
    childPriceAED: 80,
    vehicleType: "Traditional Electric Abra Boat",
    description: "Sail on Burj Lake right in front of the world's tallest dancing fountain. Skip the crowded promenade for an unobstructed, up-close front-row viewing of the light and water show.",
    image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1200&q=80",
    highlights: ["Abra Boat on Burj Lake", "Up-Close Water Fountain Show", "Best Photographic Angle of Burj Khalifa", "Audio Synchronized Experience", "No Waiting in Crowd", "Digital Ticket Voucher"],
    departureTime: "Every 30 Mins (06:00 PM - 11:00 PM)",
    returnTime: "30 Min Experience",
    itinerary: [
      { time: "Boarding", title: "Board Electric Abra at Dubai Mall", description: "Step aboard the peaceful wooden abra on Burj Lake." },
      { time: "The Show", title: "Fountain Performance Up Close", description: "Experience water jets soaring 150 meters into the air directly next to your boat." }
    ]
  }
];

// Helper to format WhatsApp message
function getWhatsAppBookingUrl(tourTitle, date, adults, children, pickup) {
  const phone = "971561505270";
  const text = `Hello Phoenix Desert Safari Dubai,\n\nI would like to book:\n• Tour: ${tourTitle}\n• Date: ${date || 'Tomorrow'}\n• Adults: ${adults || 2}\n• Children: ${children || 0}\n• Pickup Location: ${pickup || 'Hotel in Dubai'}\n\nPlease confirm availability and pickup time. (100% Pay on Arrival)`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

// Render Tour Cards
function renderTours(category = 'all') {
  const container = document.getElementById('tours-container');
  if (!container) return;

  const filtered = category === 'all' 
    ? TOURS_DATA 
    : TOURS_DATA.filter(t => t.category === category);

  container.innerHTML = filtered.map(t => `
    <div class="tour-card" data-category="${t.category}">
      <div class="card-img-wrap">
        <img src="${t.image}" alt="${t.title}" loading="lazy" />
        <span class="card-badge">${t.badge || 'Official Tour'}</span>
        <span class="card-duration">
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/></svg>
          ${t.duration}
        </span>
      </div>
      <div class="card-body">
        <div class="kicker" style="margin-bottom: 4px;">${t.categoryLabel}</div>
        <h3 class="card-title">${t.title}</h3>
        <p class="card-desc">${t.description}</p>
        
        <div class="card-highlights">
          ${t.highlights.slice(0, 4).map(h => `<span class="highlight-pill">✓ ${h}</span>`).join('')}
        </div>

        <div class="card-footer">
          <div class="price-box">
            <span class="price-sub">Pay on Arrival</span>
            <div class="price-aed">
              <span class="price-curr">AED</span> ${t.priceAED}
              <span style="font-size: 0.75rem; font-weight: normal; color: #7a7c87;">/ adult</span>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-outline-dark" onclick="openItineraryModal('${t.id}')" title="View Full Itinerary">
              Itinerary
            </button>
            <a href="${getWhatsAppBookingUrl(t.title, '', 2, 0, '')}" target="_blank" class="btn-whatsapp" style="padding: 10px 16px; font-size: 0.8rem;">
              Book
            </a>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Modal handling
window.openItineraryModal = function(tourId) {
  const tour = TOURS_DATA.find(t => t.id === tourId);
  if (!tour) return;

  const modal = document.getElementById('itinerary-modal');
  const body = document.getElementById('modal-body-content');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="position: relative;">
      <div style="height: 220px; overflow: hidden; position: relative;">
        <img src="${tour.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="${tour.title}" />
        <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,11,14,0.85) 0%, transparent 60%);"></div>
        <div style="position: absolute; bottom: 16px; left: 20px; color: #fff;">
          <span class="hero-pill" style="margin-bottom: 6px;">${tour.categoryLabel}</span>
          <h2 style="font-family: var(--font-serif); font-size: 1.5rem; font-weight: 700; color: #fff;">${tour.title}</h2>
        </div>
      </div>
      <div style="padding: 24px;">
        <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #eee;">
          <div><strong style="color: #12141c; display: block; font-size: 0.75rem; text-transform: uppercase;">Duration</strong>${tour.duration}</div>
          <div><strong style="color: #12141c; display: block; font-size: 0.75rem; text-transform: uppercase;">Vehicle</strong>${tour.vehicleType}</div>
          <div><strong style="color: #12141c; display: block; font-size: 0.75rem; text-transform: uppercase;">Pickup Window</strong>${tour.departureTime}</div>
          <div><strong style="color: #12141c; display: block; font-size: 0.75rem; text-transform: uppercase;">Rate</strong><span style="color: var(--color-gold-dark); font-weight: 800; font-size: 1.1rem;">AED ${tour.priceAED}</span> (Adult)</div>
        </div>

        <h3 style="font-family: var(--font-serif); font-size: 1.15rem; margin-bottom: 16px; color: #12141c;">Hour-by-Hour Expedition Itinerary</h3>
        <div style="margin-bottom: 28px;">
          ${(tour.itinerary || []).map(step => `
            <div class="timeline-item">
              <span class="timeline-dot"></span>
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-gold-dark);">${step.time}</div>
              <h4 style="font-size: 0.95rem; font-weight: 700; color: #12141c; margin: 2px 0 4px;">${step.title}</h4>
              <p style="font-size: 0.85rem; color: #555762; line-height: 1.5;">${step.description}</p>
            </div>
          `).join('')}
        </div>

        <h3 style="font-family: var(--font-serif); font-size: 1.15rem; margin-bottom: 12px; color: #12141c;">Experience Inclusions</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin-bottom: 28px;">
          ${tour.highlights.map(h => `
            <div style="font-size: 0.85rem; color: #333; display: flex; align-items: center; gap: 8px;">
              <span style="color: #15803d; font-weight: bold;">✓</span> ${h}
            </div>
          `).join('')}
        </div>

        <div style="background: #faf8f5; border: 1px solid #ebd9b5; border-radius: 8px; padding: 18px; display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 0.75rem; text-transform: uppercase; color: #777;">100% Pay On Arrival</span>
              <div style="font-size: 1.35rem; font-weight: 800; color: #000;">AED ${tour.priceAED} <span style="font-size: 0.8rem; font-weight: normal; color: #666;">/ person</span></div>
            </div>
            <a href="${getWhatsAppBookingUrl(tour.title, '', 2, 0, '')}" target="_blank" class="btn-whatsapp">
              Instant WhatsApp Reservation
            </a>
          </div>
          <div style="font-size: 0.75rem; color: #666; text-align: center;">
            No credit card or deposit needed upfront. Free cancellation up to 12 hours prior.
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeItineraryModal = function() {
  const modal = document.getElementById('itinerary-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// FAQ Accordion toggles
window.toggleFaq = function(element) {
  const parent = element.closest('.faq-box');
  if (parent) {
    parent.classList.toggle('open');
  }
};

// Initialize DOM
document.addEventListener('DOMContentLoaded', () => {
  // Populate Tour dropdown in Hero Dock
  const tourSelect = document.getElementById('hero-tour-select');
  if (tourSelect) {
    tourSelect.innerHTML = TOURS_DATA.map(t => `
      <option value="${t.title}" ${t.id === 'evening-desert-safari' ? 'selected' : ''}>
        ${t.title} (AED ${t.priceAED})
      </option>
    `).join('');
  }

  // Set default date to tomorrow
  const dateInput = document.getElementById('hero-date-input');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  // Hero Booking Button click
  const heroBtn = document.getElementById('hero-book-btn');
  if (heroBtn) {
    heroBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const tour = tourSelect ? tourSelect.value : 'Evening Desert Safari';
      const date = dateInput ? dateInput.value : 'Tomorrow';
      const adults = document.getElementById('hero-adults-input')?.value || 2;
      const children = document.getElementById('hero-children-input')?.value || 0;
      const pickup = document.getElementById('hero-pickup-input')?.value || 'Hotel in Dubai';

      const url = getWhatsAppBookingUrl(tour, date, adults, children, pickup);
      window.open(url, '_blank');
    });
  }

  // Category filter tabs
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-category');
      renderTours(cat);
    });
  });

  // Initial render
  renderTours('all');

  // Close modal when clicking background
  const modal = document.getElementById('itinerary-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        window.closeItineraryModal();
      }
    });
  }
});
