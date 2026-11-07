import React from 'react';
import { Currency, Experience } from '../types';
import { CURRENCY_RATES } from '../data/safaris';

interface TopDestinationsSectionProps {
  currency: Currency;
  onBookExperience: (id: string) => void;
  onViewItinerary?: (id: string) => void;
  experiences?: Experience[];
}

export const TopDestinationsSection: React.FC<TopDestinationsSectionProps> = ({
  currency,
  onBookExperience,
  onViewItinerary,
  experiences,
}) => {
  // Destination cards modeled directly on the design reference
  const destinations = [
    {
      id: 'evening-desert-safari',
      location: 'Dubai Desert',
      title: 'Lahbab Red Dunes',
      tagline: 'The Dunes That Never Sleep',
      priceAED: 120,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAnHfQ_xD50mSdKpb_AX87krGRMEnUDwIXco_BEGwEs4j-EpVpiuGkmIUB5RwaW2iC42DL2UjCqzYVjEnvSEtZA-pMdChCLUsegIFFlflTsUd2y3BvsvfP5Q2Qunr7sWjRY9BCYTi9ANBMbBZ2SZ2Ps4ve8rYtJGe19JPv4az0YV1li5eXxA6Qd7PkZWZ3hpkfjU0G-jePPYEo66vWaKMQgeOdgBW4H_xBquYIVqQu8oHMDw6l00wWd8g',
    },
    {
      id: 'dubai-half-day-city-tour',
      location: 'Dubai City',
      title: 'Dubai Marina & Creek',
      tagline: 'Modern City, Endless Wonders',
      priceAED: 120,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA7c0zK-wO7fF_hL00r3V_14dK2x_kK2_hD3Z32r4hX04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF?w=800&auto=format&fit=crop',
      fallbackImage:
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'abu-dhabi-tour-from-dubai',
      location: 'Abu Dhabi',
      title: 'Grand Mosque & Palace',
      tagline: 'Culture, Luxury, Adventure',
      priceAED: 150,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA0zK14dK2x_kK2_hD3Z32r4hX04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF?w=800&auto=format&fit=crop',
      fallbackImage:
        'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'can-am-buggy-safari',
      location: 'Lahbab Arena',
      title: 'Can-Am Maverick Buggy',
      tagline: 'Lights, Fun & Unforgettable',
      priceAED: 600,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDTp1P8j5e9Z_14dK2x_kK2_hD3Z32r4hX04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF?w=800&auto=format&fit=crop',
      fallbackImage:
        'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'morning-desert-safari',
      location: 'Red Dunes Oasis',
      title: 'Bedouin Sunrise & Camp',
      tagline: 'Paradise in Golden Sands',
      priceAED: 350,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC1_hD3Z32r4hX04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF-cZ2Y1hA04B-yQ3x33rF?w=800&auto=format&fit=crop',
      fallbackImage:
        'https://images.unsplash.com/photo-1547234935-80c7145ec969?w=800&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <section id="destinations" className="w-full py-16 bg-[#F8FAFC] border-b border-stone-200/60 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        {/* Section Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-[#0284C7] uppercase tracking-widest block mb-1">
              — POPULAR DESTINATIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0F172A] tracking-tight">
              Top Destinations &amp; Experiences
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-xl">
              From bustling city sights to natural desert wonders, explore our most loved destinations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onBookExperience('evening-desert-safari')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0284C7] hover:text-[#0369A1] transition-colors self-start md:self-auto cursor-pointer group"
          >
            <span>View All Destinations</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>

        {/* 5-Card Destination Grid (Matches uploaded design) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {destinations.map((item) => {
            const rateInfo = CURRENCY_RATES[currency] || { rate: 1, symbol: 'AED' };
            const formattedPrice = `${rateInfo.symbol} ${Math.round(item.priceAED * rateInfo.rate)}`;
            return (
              <div
                key={item.id}
                onClick={() => onBookExperience(item.id)}
                className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Photo Thumbnail */}
                <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(e) => {
                      if (item.fallbackImage) {
                        (e.target as HTMLImageElement).src = item.fallbackImage;
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  {/* Floating Price Pill */}
                  <span className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-stone-900 shadow-sm">
                    {formattedPrice}
                  </span>
                </div>

                {/* Card Info Content */}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    {/* Location Pin */}
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#EA580C] mb-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      <span>{item.location}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-serif font-bold text-[#0F172A] leading-snug group-hover:text-[#0284C7] transition-colors">
                      {item.title}
                    </h3>

                    {/* Subtitle / Tagline */}
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {item.tagline}
                    </p>
                  </div>

                  {/* Bottom Action Row with Circular Arrow Button */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-stone-500">100% Pay on Arrival</span>
                    <div className="w-8 h-8 rounded-full bg-[#0B1E33] group-hover:bg-[#0284C7] text-white flex items-center justify-center shadow-xs transition-colors">
                      <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
