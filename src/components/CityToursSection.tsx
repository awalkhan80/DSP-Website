import React from 'react';
import { Currency } from '../types';
import { CURRENCY_RATES } from '../data/safaris';

interface CityToursSectionProps {
  currency: Currency;
  onViewItinerary: (experienceId: string) => void;
  onBookExperience: (experienceId: string) => void;
}

export const CityToursSection: React.FC<CityToursSectionProps> = ({
  currency,
  onViewItinerary,
  onBookExperience,
}) => {
  const formatPrice = (aedAmount: number) => {
    const rateInfo = CURRENCY_RATES[currency];
    const converted = Math.round(aedAmount * rateInfo.rate);
    return `${currency} ${converted.toLocaleString()}`;
  };

  return (
    <section id="city-tours" className="w-full py-16 bg-[#FAF6F0] scroll-mt-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div className="space-y-1 max-w-2xl">
            <span className="text-[11px] uppercase tracking-widest text-[#0284C7] font-bold">
              Beyond The Sand
            </span>
            <h2 className="text-3xl sm:text-4xl text-stone-900 font-semibold font-serif">
              Sightseeing &amp; UAE City Excursions
            </h2>
            <p className="text-base text-stone-600">
              Explore the futuristic architectural wonders of Dubai and Abu Dhabi with fully guided
              luxury air-conditioned coaches and private vehicles.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="text-xs text-[#0284C7] bg-sky-50 border border-sky-200 px-4 py-1.5 rounded-full font-bold">
              Daily Scheduled Departures
            </span>
          </div>
        </div>

        {/* City Tours Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tour 1: Dubai City Tour */}
          <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-[0_6px_20px_rgba(0,0,0,0.05)] flex flex-col group hover:shadow-[0_12px_30px_rgba(0,0,0,0.1)] transition-all">
            <div
              className="relative h-56 w-full overflow-hidden cursor-pointer"
              onClick={() => onViewItinerary('dubai-half-day-city-tour')}
            >
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuARCbBpC3G8-XasRWNmQgIyiyUnRKLJL4-VhxY964UAMEY-euFzP9c059Leon7MvPMCsQWJmlEeOx8wotquLmqoHznSUNq6ZpGD2lRzJn1CByeHLfvNvwhcgMDvP6zUuXuQ_oKIiAHIkRzFoDB-oPzTLVzP09IhOOyLkZC3qpS1-mNXEqQESQanEoVxVXzA67Lk6wGogsA0GciEgZte8xmr28piUdxYxqsuNj-yTGC4z4JBJml0RbCVfg')`,
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/95 text-stone-900 text-[11px] font-bold shadow-sm">
                6 Hours
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#0284C7] font-bold">
                    Discover Dubai's Marvels
                  </span>
                  <span className="text-xl text-[#EA580C] font-bold font-serif">
                    {formatPrice(75)}
                  </span>
                </div>
                <h3 className="text-xl text-stone-900 font-semibold mb-2 font-serif">
                  Dubai Half-Day City Tour
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Witness the transformation from ancient fishing village to glittering metropolis.
                  Includes Burj Al Arab photo stop, Dubai Frame, Gold &amp; Spice Souk, and Dubai Mall.
                </p>
                <div className="mt-3 space-y-1.5 text-xs text-stone-700">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">check</span>
                    <span>AC Transport &amp; Professional Tour Guide</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">check</span>
                    <span>Abra Boat Crossing at Creek Included</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onViewItinerary('dubai-half-day-city-tour')}
                  className="flex-1 py-2.5 rounded-lg bg-stone-100 hover:bg-[#0284C7] text-stone-800 hover:text-white text-center text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
                >
                  View Itinerary
                </button>
                <button
                  type="button"
                  onClick={() => onBookExperience('dubai-half-day-city-tour')}
                  className="py-2.5 px-3 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
                >
                  Book
                </button>
              </div>
            </div>
          </div>

          {/* Tour 2: Abu Dhabi City Tour */}
          <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-[0_6px_20px_rgba(0,0,0,0.05)] flex flex-col group hover:shadow-[0_12px_30px_rgba(0,0,0,0.1)] transition-all">
            <div
              className="relative h-56 w-full overflow-hidden cursor-pointer"
              onClick={() => onViewItinerary('abu-dhabi-tour-from-dubai')}
            >
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBXPfyCuA5lyqU7evGIb2FceRF2y2FoioBzdAuIqxMsH48LLUKlgG5P2ofNMkB-E6HZHfEYuEphGo-1Q8LoFxAR5ZqqRnc2MQlPitOEVPLZ0Qy864vW2VSgx9i5Ctq1lAuSbIjdzOP6AgOGCL58LVqUfVZNbu7APd8EHMqvmqg8LChbSb6LXbmBXhDqzWzSTO4zVbZGHdkNcKXt9CxjZJJoFt_TsAOdQ75HDJfnMg-oTswWYenH5_iuIw')`,
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/95 text-stone-900 text-[11px] font-bold shadow-sm">
                8h 30m
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#0284C7] font-bold">
                    UAE Capital Odyssey
                  </span>
                  <span className="text-xl text-[#EA580C] font-bold font-serif">
                    {formatPrice(150)}
                  </span>
                </div>
                <h3 className="text-xl text-stone-900 font-semibold mb-2 font-serif">
                  Abu Dhabi Tour from Dubai
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Full-day capital journey featuring the awe-inspiring Sheikh Zayed Grand Mosque,
                  Emirates Palace photo opportunity, Abu Dhabi Corniche, and Ferrari World Yas Island.
                </p>
                <div className="mt-3 space-y-1.5 text-xs text-stone-700">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">check</span>
                    <span>Mosque Entry Pass &amp; Dress Assistance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">check</span>
                    <span>Roundtrip Dubai Hotel Pick &amp; Drop</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onViewItinerary('abu-dhabi-tour-from-dubai')}
                  className="flex-1 py-2.5 rounded-lg bg-stone-100 hover:bg-[#0284C7] text-stone-800 hover:text-white text-center text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
                >
                  View Itinerary
                </button>
                <button
                  type="button"
                  onClick={() => onBookExperience('abu-dhabi-tour-from-dubai')}
                  className="py-2.5 px-3 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
                >
                  Book
                </button>
              </div>
            </div>
          </div>

          {/* Tour 3: Marina Luxury Dhow Cruise */}
          <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-[0_6px_20px_rgba(0,0,0,0.05)] flex flex-col group hover:shadow-[0_12px_30px_rgba(0,0,0,0.1)] transition-all">
            <div
              className="relative h-56 w-full overflow-hidden cursor-pointer"
              onClick={() => onViewItinerary('marina-luxury-dhow-cruise')}
            >
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAh1wX_W7KyozasE7f5-naObZ1gSRbV0UoV5qbhv32sk_Je7mGVmOxIdApZheVHWu33ILWAsdN6BbWT8O5LcGE3nu9LucMxHsZR4z6t2SrYDG5rjURmUHdSB6HcCPK98rqG2Um8ax7igChKltv3zVa6mXz2vFdkjM7QCeSf21AM9lZa7u5O3J7mVgsDjgvG2fblTUJ31fyCfWxKcc126CYryVuth49kZTs-j2b_hiQ-w7yfCgXCYbhwog')`,
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/95 text-stone-900 text-[11px] font-bold shadow-sm">
                2 Hours
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#0284C7] font-bold">
                    Waterfront Dining
                  </span>
                  <span className="text-xl text-[#EA580C] font-bold font-serif">
                    {formatPrice(110)}
                  </span>
                </div>
                <h3 className="text-xl text-stone-900 font-semibold mb-2 font-serif">
                  Marina Luxury Dhow Cruise
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Sail along Dubai Marina's world-renowned skyline. Enjoy an international 5-star
                  buffet dinner, soft drinks, ambient music, and live Tanoura dance performances.
                </p>
                <div className="mt-3 space-y-1.5 text-xs text-stone-700">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">check</span>
                    <span>International Multi-Cuisine Buffet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">check</span>
                    <span>Upper Deck Open Air Sightseeing</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onViewItinerary('marina-luxury-dhow-cruise')}
                  className="flex-1 py-2.5 rounded-lg bg-stone-100 hover:bg-[#0284C7] text-stone-800 hover:text-white text-center text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
                >
                  View Itinerary
                </button>
                <button
                  type="button"
                  onClick={() => onBookExperience('marina-luxury-dhow-cruise')}
                  className="py-2.5 px-3 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
                >
                  Book
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
