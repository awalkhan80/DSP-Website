import React, { useState } from 'react';

export interface GuideArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: 'Safari Tips' | 'Adventure Guides' | 'Dubai Travel';
  readTime: string;
  publishedDate: string;
  author: string;
  image: string;
  altText: string;
  content: {
    intro: string;
    subheadings: {
      heading: string;
      text: string;
    }[];
    summary: string;
  };
}

export const TRAVEL_GUIDES: GuideArticle[] = [
  {
    id: 'guide-evening-vs-morning',
    slug: 'evening-vs-morning-desert-safari-dubai',
    title: 'Evening vs. Morning Desert Safari Dubai: Which One Should You Choose?',
    excerpt:
      'A deep comparison between crisp sunrise golden dunes and sunset Bedouin camp experiences with BBQ dinners and fire shows.',
    category: 'Safari Tips',
    readTime: '4 min read',
    publishedDate: 'May 2025',
    author: 'Captain Tariq • Senior Desert Marshal',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAnHfQ_xD50mSdKpb_AX87krGRMEnUDwIXco_BEGwEs4j-EpVpiuGkmIUB5RwaW2iC42DL2UjCqzYVjEnvSEtZA-pMdChCLUsegIFFlflTsUd2y3BvsvfP5Q2Qunr7sWjRY9BCYTi9ANBMbBZ2SZ2Ps4ve8rYtJGe19JPv4az0YV1li5eXxA6Qd7PkZWZ3hpkfjU0G-jePPYEo66vWaKMQgeOdgBW4H_xBquYIVqQu8oHMDw6l00wWd8g',
    altText: 'Dubai desert dunes at golden hour sunset during an evening desert safari tour',
    content: {
      intro:
        'When planning an Arabian adventure, the single most common dilemma travelers face is deciding between a Morning Desert Safari and an Evening Desert Safari. Both reveal different facets of the dramatic Lahbab dunes.',
      subheadings: [
        {
          heading: '1. The Evening Desert Safari: Complete Cultural Immersion',
          text: 'The evening expedition (02:30 PM to 09:30 PM) is the iconic Dubai tourism experience. It features 45 minutes of exhilarating dune bashing, sandboarding from ridge tops, panoramic sunset photography stops, and an authentic Bedouin camp with live 5-star BBQ dinner, Tanoura whirling dervish shows, fire spectacles, and henna painting.',
        },
        {
          heading: '2. The Morning Desert Safari: Crisp Sunrise & Photography Focus',
          text: 'For early risers, flight transit passengers, or business travelers with afternoon schedules, the morning safari (05:00 AM to 09:00 AM) offers cooler desert temperatures, untouched wind-swept sand ridges, and tranquil sunrise photography before the midday warmth begins.',
        },
        {
          heading: '3. Verdict & Recommendation',
          text: 'If it is your first visit to Dubai, book the Evening Safari for the complete package. If you prefer quiet photography and want to return to your hotel by 09:30 AM, choose the Morning Safari.',
        },
      ],
      summary:
        'Both experiences offer direct hotel pickup in recent-model Toyota Land Cruisers with DTCM-certified desert marshals.',
    },
  },
  {
    id: 'guide-dune-buggy-vs-quad-bike',
    slug: 'dune-buggy-vs-quad-bike-dubai',
    title: 'Dune Buggy vs. Quad Bike in Dubai: Power, Safety & Requirements',
    excerpt:
      'Everything you need to know about self-driving high-horsepower Can-Am Maverick turbos versus open-air Yamaha and Polaris ATVs.',
    category: 'Adventure Guides',
    readTime: '5 min read',
    publishedDate: 'May 2025',
    author: 'Marshal Zaid • Lead Off-Road Instructor',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBmUuhU2zvZss3m2z-biFjAJWSc-FFBbo1m6ZnN3dfwWCVNQG6SnfV_9_rKM4lG_4ZxVczonwj4fFA8ROhBmd3wkntbAFTYyWk5iVKcvLmfug4xiWYsSITDwsR4KLWVGBghcaRz5lIZ-3lZl4hKk4yEG5pD_1nxWvvUe2jR7HOnv1ZMSUb2WelPbcAkCKqeglh2mmFr64taMzfh-Z42tEhCHT2lzyKMiOgMV3-AEgDrmDbgWeGZEJmFPw',
    altText: 'Can-Am Maverick X3 Turbo dune buggy powering across the crest of high Dubai desert sand dunes',
    content: {
      intro:
        'Few outdoor experiences match the adrenaline rush of conquering Dubai’s towering red sand dunes behind the wheel of a high-performance off-road machine. But should you rent a Quad Bike (ATV) or a Can-Am Turbo Dune Buggy?',
      subheadings: [
        {
          heading: '1. Quad Bike ATVs (220cc to 700cc)',
          text: 'Quad bikes offer open-air freedom. You steer with handlebars and use your body weight to lean into dune ridges. They are nimble, cost-effective (starting from AED 150), and perfect for riders seeking an active physical thrill in designated tracks and perimeter dunes.',
        },
        {
          heading: '2. Can-Am Maverick X3 Turbo Dune Buggies',
          text: 'With 172 to 195 horsepower, full roll cages, and 4-point racing harnesses, Can-Am buggies are motorsport-grade desert machines. They allow you to climb the tallest 300-foot dunes with effortless power and superior cockpit safety, available in 2-seater and 4-seater family configurations.',
        },
        {
          heading: '3. Licensing & Safety Protocols',
          text: 'Neither vehicle requires a UAE or international driving license because operations take place in off-road desert zones under the supervision of lead escort marshals. Full safety gear (DOT-approved helmets, goggles) is provided.',
        },
      ],
      summary:
        'Choose a Quad Bike for casual adrenaline and single riders; choose a Can-Am Maverick Turbo Buggy for maximum horsepower, deep dune access, and shared passenger thrills.',
    },
  },
  {
    id: 'guide-what-to-wear-desert-safari',
    slug: 'what-to-wear-desert-safari-dubai',
    title: 'What to Wear for a Desert Safari in Dubai: The Complete Packing Guide',
    excerpt:
      'Practical tips on desert clothing, footwear, sun protection, and seasonal evening temperature drops in the Arabian sands.',
    category: 'Dubai Travel',
    readTime: '3 min read',
    publishedDate: 'May 2025',
    author: 'Elena Lindqvist • Travel Concierge',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDhLKdZSpsI-THhAJCLrcsZPNj-gOSpy8oKdNCLk_Zbr7pJwpG0jCxyp74F-3k7VZkmFRWFZbnaUpoPIH789ox6geGZguTZMFP8P0kNyi2i-PY8OU5uSU2q5W64R-ZCeVSYZ9fkU-5ow2gcgYY9c06-rE3xXfSpfRXLh6fhnP4-y4kRs2vLFL-8TPusZfPXu8neq_IKYLv0jhNER6PQK0Ng-Ijnzn4LL0IgWfLjrxBHGnr51csBfKnYPg',
    altText: 'Desert safari traveler walking across high red dunes in comfortable desert attire during sunrise',
    content: {
      intro:
        'Packing the right wardrobe ensures you remain comfortable whether you are riding a camel, sandboarding, or relaxing at the Bedouin camp under the stars.',
      subheadings: [
        {
          heading: '1. Daywear: Breathable Cotton & Loose Cuts',
          text: 'Loose-fitting linen or cotton shirts, t-shirts, and light trousers are ideal. They shield your skin from direct sun while allowing airflow. Light colors (khaki, white, beige) reflect heat better than dark fabrics.',
        },
        {
          heading: '2. Footwear: Sandals, Flip-Flops, or Sneakers',
          text: 'Open sandals or slip-on shoes are easiest to shake free of sand after dune bashing and sandboarding. If you plan to ride quad bikes or buggies, closed-toe sneakers are required for foot protection on pedals.',
        },
        {
          heading: '3. Winter Evenings: Bring a Light Jacket',
          text: 'From November through March, desert temperatures drop noticeably after dark—sometimes reaching 14°C to 16°C. Bringing a light jacket, sweater, or scarf ensures full comfort during dinner and evening stage shows.',
        },
      ],
      summary:
        'Don’t forget high-UV sunglasses, sunscreen, and a charged smartphone or camera for golden-hour portraits.',
    },
  },
];

interface TravelGuidesSectionProps {
  onOpenArticle?: (article: GuideArticle) => void;
}

export const TravelGuidesSection: React.FC<TravelGuidesSectionProps> = () => {
  const [selectedArticle, setSelectedArticle] = useState<GuideArticle | null>(null);

  return (
    <section id="travel-guides" className="w-full py-16 bg-[#F5ECE1] scroll-mt-24 border-t border-amber-200/60">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] uppercase tracking-widest text-[#C2410C] font-bold">
              Dubai Desert Exploration Insights • Topical Authority
            </span>
            <h2 className="text-3xl sm:text-4xl text-stone-900 font-semibold font-serif">
              Desert Safari &amp; Buggy Guides
            </h2>
            <p className="text-base text-stone-600">
              Expert advice prepared by certified desert marshals and tour leaders to help you maximize
              your Dubai Arabian holiday.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="text-xs text-stone-700 bg-white/80 border border-amber-200 px-4 py-1.5 rounded-full font-bold shadow-2xs">
              Updated for 2025 Season
            </span>
          </div>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TRAVEL_GUIDES.map((guide) => (
            <article
              key={guide.id}
              className="bg-white rounded-2xl overflow-hidden border border-amber-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-lg transition-all group"
            >
              <div>
                <div
                  className="relative h-48 w-full overflow-hidden cursor-pointer"
                  onClick={() => setSelectedArticle(guide)}
                >
                  <img
                    src={guide.image}
                    alt={guide.altText}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-stone-900 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    {guide.category}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                    {guide.readTime}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-stone-500">
                    <span>{guide.publishedDate}</span>
                    <span>•</span>
                    <span>{guide.author}</span>
                  </div>
                  <h3
                    className="text-lg font-serif font-bold text-stone-900 group-hover:text-[#EA580C] transition-colors cursor-pointer leading-snug"
                    onClick={() => setSelectedArticle(guide)}
                  >
                    {guide.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {guide.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedArticle(guide)}
                  className="text-xs font-bold text-[#EA580C] hover:text-[#C2410C] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Read Full Guide</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Article Modal Reader */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#FAF6F0] rounded-2xl sm:rounded-3xl border border-amber-200 shadow-2xl max-w-3xl w-full overflow-hidden text-stone-900 relative">
            <div className="relative h-64 sm:h-72 w-full overflow-hidden">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.altText}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  {selectedArticle.category} • {selectedArticle.readTime}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold drop-shadow leading-tight">
                  {selectedArticle.title}
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-5 max-h-[60vh] overflow-y-auto text-stone-800">
              <div className="flex items-center gap-3 text-xs text-stone-500 pb-3 border-b border-stone-200">
                <span className="font-semibold text-stone-800">{selectedArticle.author}</span>
                <span>•</span>
                <span>{selectedArticle.publishedDate}</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  DTCM Verified Guide
                </span>
              </div>

              <p className="text-sm sm:text-base leading-relaxed font-medium text-stone-700">
                {selectedArticle.content.intro}
              </p>

              <div className="space-y-4 pt-2">
                {selectedArticle.content.subheadings.map((section, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <h4 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                      {section.heading}
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {section.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-stone-800">
                <strong>Key Takeaway: </strong>
                {selectedArticle.content.summary}
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-white border-t border-amber-200 flex items-center justify-between">
              <span className="text-xs text-stone-500">Need personal booking recommendations?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50"
                >
                  Close
                </button>
                <a
                  href="https://wa.me/971561505270"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Ask Safari Concierge
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
