import React from 'react';
import { Currency, Experience } from '../types';
import { CURRENCY_RATES, EXPERIENCES } from '../data/safaris';

interface SignatureExpeditionsProps {
  currency: Currency;
  onBookExperience: (experienceId: string) => void;
  onViewItinerary: (experienceId: string) => void;
  experiences?: Experience[];
}

export const SignatureExpeditions: React.FC<SignatureExpeditionsProps> = ({
  currency,
  onBookExperience,
  onViewItinerary,
  experiences,
}) => {
  const formatPrice = (aedAmount: number) => {
    const rateInfo = CURRENCY_RATES[currency];
    const converted = Math.round(aedAmount * rateInfo.rate);
    return `${currency} ${converted.toLocaleString()}`;
  };

  const allExperiences = experiences && experiences.length > 0 ? experiences : EXPERIENCES;
  const safariList = allExperiences.filter(
    (exp) => exp.category === 'desert-safaris' || exp.category === 'private-convoys'
  );

  return (
    <section id="desert-safaris" className="w-full py-16 bg-[#FAF6F0] scroll-mt-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div className="space-y-1 max-w-2xl">
            <span className="text-[11px] uppercase tracking-widest text-[#C2410C] font-bold">
              Signature Red Dune Expeditions • DTCM Licensed
            </span>
            <h2 className="text-3xl sm:text-4xl text-stone-900 font-semibold font-serif">
              Dubai Desert Safari Tours &amp; VIP Expeditions
            </h2>
            <p className="text-base text-stone-600">
              Selected by over 40,000 global travelers for pristine Red Lahbab dunes, licensed English-speaking
              safari captains, 45-minute 4x4 dune bashing, and 5-star desert camp hospitality.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full self-start md:self-auto">
            <span className="text-[11px] text-amber-900 uppercase tracking-wider font-bold">
              Complimentary Home &amp; Hotel Pickup &amp; Drop Included
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C] animate-pulse"></div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {safariList.map((tour) => {
            const isBestSeller = tour.badge === 'Best Seller' || tour.id === 'evening-desert-safari';
            const isMorning = tour.id.includes('morning');
            const isVip = tour.category === 'private-convoys' || tour.id.includes('private');

            return (
              <div
                key={tour.id}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-amber-100 shadow-[0_6px_24px_rgba(217,119,6,0.08)] transition-all duration-300 hover:shadow-[0_12px_36px_rgba(217,119,6,0.16)] hover:-translate-y-1"
              >
                {/* Image Container */}
                <div
                  className="relative h-64 w-full overflow-hidden cursor-pointer"
                  onClick={() => onViewItinerary(tour.id)}
                >
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage: `url('${tour.image}')`,
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30"></div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    {tour.badge && (
                      <span
                        className={`px-3 py-1 rounded-full text-white text-[11px] uppercase tracking-wider font-extrabold shadow-sm ${
                          isBestSeller
                            ? 'bg-gradient-to-r from-[#EA580C] to-[#D97706]'
                            : isMorning
                            ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9]'
                            : 'bg-gradient-to-r from-[#B45309] to-[#F59E0B]'
                        }`}
                      >
                        {tour.badge}
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-stone-900 text-[11px] font-semibold">
                      {tour.duration || '7 Hours'}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold drop-shadow">
                        {tour.subtitle || 'Full Experience'}
                      </span>
                      <h3 className="text-xl sm:text-2xl text-white drop-shadow font-serif font-semibold">
                        {tour.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-amber-200 block uppercase font-bold drop-shadow">
                        From
                      </span>
                      <span className="text-2xl sm:text-3xl text-white font-bold leading-none drop-shadow">
                        {formatPrice(tour.priceAED)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Package Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {tour.description}
                    </p>
                    {/* Inclusions Chips */}
                    <div className="grid grid-cols-2 gap-y-2 gap-x-3 pt-1 text-xs text-stone-800">
                      {tour.highlights && tour.highlights.length > 0 ? (
                        tour.highlights.slice(0, 6).map((h, i) => (
                          <span key={i} className="flex items-center gap-1.5 font-medium truncate" title={h}>
                            <span className="material-symbols-outlined text-[#EA580C] text-[18px] shrink-0">
                              check_circle
                            </span>
                            <span className="truncate">{h}</span>
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="flex items-center gap-1.5 font-medium">
                            <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                              check_circle
                            </span>
                            45-min Dune Bashing
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                              check_circle
                            </span>
                            Sunset Photo Stop
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                              check_circle
                            </span>
                            Camel Trek
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                              check_circle
                            </span>
                            Sandboarding
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Booking Action */}
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1.5 text-stone-600 text-xs font-medium">
                        <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                          done_all
                        </span>
                        <span>Doorstep 4x4 Transfer Included</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit mt-1">
                        100% Pay on Arrival (Cash/Card)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onViewItinerary(tour.id)}
                        className="px-3 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:text-[#EA580C] transition-colors cursor-pointer"
                      >
                        Itinerary
                      </button>
                      <button
                        type="button"
                        onClick={() => onBookExperience(tour.id)}
                        className="px-4 py-2.5 rounded-lg bg-stone-900 hover:bg-[#EA580C] text-white text-xs uppercase tracking-wider font-bold transition-all shadow-sm cursor-pointer"
                      >
                        Book Online
                      </button>
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
