import React from 'react';
import { Currency, Experience } from '../types';
import { CURRENCY_RATES, EXPERIENCES } from '../data/safaris';

interface CityToursSectionProps {
  currency: Currency;
  onViewItinerary: (experienceId: string) => void;
  onBookExperience: (experienceId: string) => void;
  experiences?: Experience[];
}

export const CityToursSection: React.FC<CityToursSectionProps> = ({
  currency,
  onViewItinerary,
  onBookExperience,
  experiences,
}) => {
  const formatPrice = (aedAmount: number) => {
    const rateInfo = CURRENCY_RATES[currency];
    const converted = Math.round(aedAmount * rateInfo.rate);
    return `${currency} ${converted.toLocaleString()}`;
  };

  const allExperiences = experiences && experiences.length > 0 ? experiences : EXPERIENCES;
  const cityList = allExperiences.filter((exp) => exp.category === 'city-tours');

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cityList.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-[0_6px_20px_rgba(0,0,0,0.05)] flex flex-col justify-between group hover:shadow-[0_12px_30px_rgba(0,0,0,0.1)] transition-all"
            >
              <div>
                <div
                  className="relative h-56 w-full overflow-hidden cursor-pointer"
                  onClick={() => onViewItinerary(tour.id)}
                >
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: `url('${tour.image}')`,
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/95 text-stone-900 text-[11px] font-bold shadow-sm">
                    {tour.duration || '6 Hours'}
                  </div>
                  {tour.badge && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white text-[11px] font-bold shadow-sm">
                      {tour.badge}
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#0284C7] font-bold truncate max-w-[180px]">
                      {tour.subtitle || 'Discover UAE'}
                    </span>
                    <span className="text-xl text-[#EA580C] font-bold font-serif">
                      {formatPrice(tour.priceAED)}
                    </span>
                  </div>
                  <h3 className="text-xl text-stone-900 font-semibold mb-2 font-serif">
                    {tour.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {tour.description}
                  </p>
                  <div className="mt-3 space-y-1.5 text-xs text-stone-700">
                    {tour.highlights && tour.highlights.length > 0 ? (
                      tour.highlights.slice(0, 2).map((h, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-[18px]">check</span>
                          <span className="truncate">{h}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-[18px]">check</span>
                          <span>AC Transport &amp; Professional Tour Guide</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-[18px]">check</span>
                          <span>Instant Mobile Voucher Confirmation</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Payment Policy Indicator */}
                  <div className="pt-2.5 flex items-center justify-between text-[11px] border-t border-stone-100">
                    <span className="text-stone-500 font-medium">Payment Terms:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[10px] tracking-wide ${
                        tour.id.includes('burj') || tour.id.includes('skydive') || tour.id.includes('miracle')
                          ? 'text-amber-800 bg-amber-50 border border-amber-300'
                          : 'text-emerald-800 bg-emerald-50 border border-emerald-300'
                      }`}
                    >
                      {tour.id.includes('burj') || tour.id.includes('skydive') || tour.id.includes('miracle')
                        ? 'Advance Payment (Official E-Ticket)'
                        : '100% Pay on Arrival (Cash or Card)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onViewItinerary(tour.id)}
                  className="flex-1 py-2.5 rounded-lg bg-stone-100 hover:bg-[#0284C7] text-stone-800 hover:text-white text-center text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
                >
                  Itinerary
                </button>
                <button
                  type="button"
                  onClick={() => onBookExperience(tour.id)}
                  className="flex-1 py-2.5 rounded-lg bg-stone-900 hover:bg-[#EA580C] text-white text-center text-xs uppercase tracking-wider font-bold transition-all shadow-sm cursor-pointer"
                >
                  Book Tour
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
