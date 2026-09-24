import React, { useState } from 'react';
import { Currency } from '../types';
import { CURRENCY_RATES } from '../data/safaris';

interface AdrenalineBuggySectionProps {
  currency: Currency;
  onBookExperience: (experienceId: string) => void;
  onViewItinerary: (experienceId: string) => void;
}

export const AdrenalineBuggySection: React.FC<AdrenalineBuggySectionProps> = ({
  currency,
  onBookExperience,
  onViewItinerary,
}) => {
  const [selectedAtvCc, setSelectedAtvCc] = useState<'220cc' | '350cc' | '700cc'>('220cc');
  const [selectedBuggySeater, setSelectedBuggySeater] = useState<'2-seater' | '4-seater'>('2-seater');

  const formatPrice = (aedAmount: number) => {
    const rateInfo = CURRENCY_RATES[currency];
    const converted = Math.round(aedAmount * rateInfo.rate);
    return `${currency} ${converted.toLocaleString()}`;
  };

  const atvPrice = selectedAtvCc === '220cc' ? 150 : selectedAtvCc === '350cc' ? 220 : 350;
  const buggyPrice = selectedBuggySeater === '2-seater' ? 1000 : 1500;

  return (
    <section
      id="quad-and-buggy-rentals"
      className="w-full py-16 bg-gradient-to-b from-[#FAF6F0] via-[#F4ECE1] to-[#FAF6F0] scroll-mt-24"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        {/* Headline & Subtitle */}
        <div className="max-w-3xl space-y-1 mb-10">
          <span className="text-[11px] uppercase tracking-widest text-[#C2410C] font-bold">
            Adrenaline &amp; High-Horsepower • Self-Drive Red Dune Expeditions
          </span>
          <h2 className="text-3xl sm:text-4xl text-stone-900 font-semibold font-serif">
            Dubai Dune Buggy &amp; Quad Bike ATV Rentals
          </h2>
          <p className="text-base text-stone-600">
            Command 1000cc Can-Am Maverick X3 Turbo buggies and Raptor ATVs across soaring open red sand
            dunes in Lahbab. Self-drive thrills under professional desert safety marshal guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Quad Bike Highlight Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-amber-100 shadow-[0_8px_30px_rgba(217,119,6,0.08)] relative overflow-hidden">
            <div className="space-y-4 z-10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold uppercase border border-amber-200">
                  No Driving License Required
                </span>
                <span className="text-2xl text-[#EA580C] font-bold font-serif">
                  {formatPrice(atvPrice)}{' '}
                  <span className="text-xs text-stone-500 font-normal font-sans">/ Session</span>
                </span>
              </div>

              <div>
                <h3 className="text-2xl text-stone-900 font-semibold font-serif">
                  Quad Bike ATV Rental
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed mt-1">
                  Conquer open desert dunes on high-performance 220cc to 700cc Raptor ATVs. Full
                  freedom in designated tracks or deep guided dune fields with complete safety gears
                  provided.
                </p>
              </div>

              {/* CC Selector interactive widget */}
              <div className="flex items-center gap-2 pt-1 pb-1">
                <span className="text-xs text-stone-500 font-semibold">Engine Tier:</span>
                {(['220cc', '350cc', '700cc'] as const).map((cc) => (
                  <button
                    key={cc}
                    type="button"
                    onClick={() => setSelectedAtvCc(cc)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                      selectedAtvCc === cc
                        ? 'bg-[#EA580C] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {cc} Raptor
                  </button>
                ))}
              </div>

              {/* Specs & Inclusions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 bg-[#FAF6F0] rounded-xl border border-stone-200/70 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#EA580C] text-[20px]">
                    two_wheeler
                  </span>
                  <span className="text-xs text-stone-800 font-semibold">
                    {selectedAtvCc} Raptor ATV
                  </span>
                </div>
                <div className="p-2.5 bg-[#FAF6F0] rounded-xl border border-stone-200/70 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#EA580C] text-[20px]">
                    sports_motorsports
                  </span>
                  <span className="text-xs text-stone-800 font-semibold">
                    Helmet &amp; Goggles Included
                  </span>
                </div>
                <div className="p-2.5 bg-[#FAF6F0] rounded-xl border border-stone-200/70 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#EA580C] text-[20px]">
                    person_pin
                  </span>
                  <span className="text-xs text-stone-800 font-semibold">Desert Trail Leader</span>
                </div>
                <div className="p-2.5 bg-[#FAF6F0] rounded-xl border border-stone-200/70 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#EA580C] text-[20px]">
                    security
                  </span>
                  <span className="text-xs text-stone-800 font-semibold">
                    Comprehensive Safety Brief
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Strip */}
            <div className="mt-6 relative h-48 w-full rounded-xl overflow-hidden shadow-inner group">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD3cf4jPrAC-DN5Da2vJ3_AGbHbR6Yx83Fa8N81kJ0Fe0oD87a2N_uLVWQbZW2Io8MdPi1Es_1bU7roSmN9lCjyb1fdk2uGtp0bKsod3-IPm9wxDqwXqvCZrgiEsYThx1JacNiHRBxVqp-EGOmKVV_iunEJuG04GQ9ta38QwMXXZBq_-KSto8HJDqypGth8xvt_T1PEBAqCFfEc9mE_AXABwf3Xc1lWLQKokQycJqqd6cGJtc6buc96jg')`,
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-4 gap-2">
                <button
                  type="button"
                  onClick={() => onViewItinerary('quad-bike-atv')}
                  className="py-2.5 px-3 rounded-lg bg-white/90 hover:bg-white text-stone-900 text-center text-xs uppercase tracking-wider font-bold shadow-md transition-all cursor-pointer"
                >
                  Itinerary
                </button>
                <button
                  type="button"
                  onClick={() => onBookExperience('quad-bike-atv')}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#EA580C] to-[#D97706] hover:from-[#C2410C] hover:to-[#EA580C] text-white text-center text-xs uppercase tracking-wider font-bold shadow-md transition-all cursor-pointer"
                >
                  Rent Quad Bike Now
                </button>
              </div>
            </div>
          </div>

          {/* Can-Am Buggy Highlight Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-amber-100 shadow-[0_8px_30px_rgba(217,119,6,0.08)] relative overflow-hidden">
            <div className="space-y-4 z-10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-[11px] font-bold uppercase border border-orange-200">
                  Turbo High Performance
                </span>
                <span className="text-2xl text-[#EA580C] font-bold font-serif">
                  {formatPrice(buggyPrice)}{' '}
                  <span className="text-xs text-stone-500 font-normal font-sans">/ Buggy</span>
                </span>
              </div>

              <div>
                <h3 className="text-2xl text-stone-900 font-semibold font-serif">
                  Can-Am Dune Buggy Safari
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed mt-1">
                  Drive 2-seater or 4-seater Can-Am Maverick X3 Turbo buggies with roll cages, 4-point
                  harnesses, and desert guides. Maximum power to scale the tallest Dubai dunes with ease.
                </p>
              </div>

              {/* Seater Selector interactive widget */}
              <div className="flex items-center gap-2 pt-1 pb-1">
                <span className="text-xs text-stone-500 font-semibold">Configuration:</span>
                {(['2-seater', '4-seater'] as const).map((seat) => (
                  <button
                    key={seat}
                    type="button"
                    onClick={() => setSelectedBuggySeater(seat)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                      selectedBuggySeater === seat
                        ? 'bg-[#EA580C] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Can-Am {seat.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Specs & Inclusions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 bg-[#FAF6F0] rounded-xl border border-stone-200/70 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#EA580C] text-[20px]">speed</span>
                  <span className="text-xs text-stone-800 font-semibold">
                    Can-Am Maverick X3 Turbo
                  </span>
                </div>
                <div className="p-2.5 bg-[#FAF6F0] rounded-xl border border-stone-200/70 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#EA580C] text-[20px]">
                    airline_seat_recline_extra
                  </span>
                  <span className="text-xs text-stone-800 font-semibold">
                    {selectedBuggySeater === '2-seater' ? '2-Seater Private' : '4-Seater Family'}
                  </span>
                </div>
                <div className="p-2.5 bg-[#FAF6F0] rounded-xl border border-stone-200/70 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#EA580C] text-[20px]">
                    unfold_more_double
                  </span>
                  <span className="text-xs text-stone-800 font-semibold">
                    Roll-Cage &amp; Race Harness
                  </span>
                </div>
                <div className="p-2.5 bg-[#FAF6F0] rounded-xl border border-stone-200/70 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#EA580C] text-[20px]">flag</span>
                  <span className="text-xs text-stone-800 font-semibold">
                    Lead Marshall Escort Car
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Strip */}
            <div className="mt-6 relative h-48 w-full rounded-xl overflow-hidden shadow-inner group">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBmUuhU2zvZss3m2z-biFjAJWSc-FFBbo1m6ZnN3dfwWCVNQG6SnfV_9_rKM4lG_4ZxVczonwj4fFA8ROhBmd3wkntbAFTYyWk5iVKcvLmfug4xiWYsSITDwsR4KLWVGBghcaRz5lIZ-3lZl4hKk4yEG5pD_1nxWvvUe2jR7HOnv1ZMSUb2WelPbcAkCKqeglh2mmFr64taMzfh-Z42tEhCHT2lzyKMiOgMV3-AEgDrmDbgWeGZEJmFPw')`,
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-4 gap-2">
                <button
                  type="button"
                  onClick={() => onViewItinerary('can-am-buggy-safari')}
                  className="py-2.5 px-3 rounded-lg bg-white/90 hover:bg-white text-stone-900 text-center text-xs uppercase tracking-wider font-bold shadow-md transition-all cursor-pointer"
                >
                  Itinerary
                </button>
                <button
                  type="button"
                  onClick={() => onBookExperience('can-am-buggy-safari')}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#D97706] text-white text-center text-xs uppercase tracking-wider font-bold hover:brightness-110 shadow-md transition-all cursor-pointer"
                >
                  Book Can-Am Buggy Experience
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
