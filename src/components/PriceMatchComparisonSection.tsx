import React, { useState } from 'react';
import { Currency } from '../types';
import { CURRENCY_RATES } from '../data/safaris';

interface PriceMatchComparisonSectionProps {
  currency: Currency;
  onBookExperience: (id: string) => void;
  onOpenWhatsApp: () => void;
}

interface CompetitorComparisonItem {
  id: string;
  category: 'safari' | 'offroad' | 'city';
  title: string;
  phoenixPriceAED: number;
  otaPriceAED: number; // Viator / GetYourGuide / Agencies
  hotelPriceAED: number; // Hotel Desk / Concierge
  savingsPercent: number;
  inclusions: string[];
  badge?: string;
}

const COMPARISON_DATA: CompetitorComparisonItem[] = [
  {
    id: 'evening-desert-safari',
    category: 'safari',
    title: 'Evening Desert Safari (4x4 Land Cruiser Pickup + BBQ)',
    phoenixPriceAED: 120,
    otaPriceAED: 195,
    hotelPriceAED: 280,
    savingsPercent: 38,
    inclusions: ['Home/Hotel Doorstep Pickup', '45-Min Red Dune Bashing', 'BBQ Buffet & 3 Live Shows', '0% Upfront Deposit'],
    badge: 'Top Seller'
  },
  {
    id: 'private-vip-safari',
    category: 'safari',
    title: 'Private VIP Desert Safari (Dedicated Vehicle - Up to 6 Pax)',
    phoenixPriceAED: 850,
    otaPriceAED: 1350,
    hotelPriceAED: 1800,
    savingsPercent: 37,
    inclusions: ['Private 300 Series Land Cruiser', 'Table-side VIP Buffet Service', 'Personal Desert Marshal', 'Shisha & Falcon Photography'],
    badge: 'Exclusive Value'
  },
  {
    id: 'quad-bike-atv',
    category: 'offroad',
    title: '250cc Quad Bike ATV Open Desert Session (30 Mins)',
    phoenixPriceAED: 150,
    otaPriceAED: 240,
    hotelPriceAED: 320,
    savingsPercent: 37,
    inclusions: ['Open Red Dune Track', 'Helmet & Goggles', 'Guide Escort', 'No License Required'],
    badge: 'Popular Add-On'
  },
  {
    id: 'can-am-buggy-safari',
    category: 'offroad',
    title: 'Can-Am Maverick Turbo Buggy Self-Drive (1000cc - 30 Mins)',
    phoenixPriceAED: 700,
    otaPriceAED: 1100,
    hotelPriceAED: 1500,
    savingsPercent: 36,
    inclusions: ['1000cc Turbo Can-Am', 'Roll Cage & 4-Point Harness', 'High-Octane Fuel Included', 'Lead Safety Car Supervision'],
    badge: 'Adrenaline Leader'
  },
  {
    id: 'abu-dhabi-tour-from-dubai',
    category: 'city',
    title: 'Abu Dhabi Day Sightseeing Tour from Dubai',
    phoenixPriceAED: 150,
    otaPriceAED: 230,
    hotelPriceAED: 320,
    savingsPercent: 35,
    inclusions: ['Sheikh Zayed Grand Mosque Entry', 'Emirates Palace Photo Stop', 'AC Luxury Coach', 'Hotel Pickup & Drop'],
  },
  {
    id: 'miracle-garden-global-village-combo',
    category: 'city',
    title: 'Abu Dhabi City Tour + Ferrari World Ticket Combo',
    phoenixPriceAED: 280,
    otaPriceAED: 420,
    hotelPriceAED: 550,
    savingsPercent: 33,
    inclusions: ['Grand Mosque & City Tour', 'Ferrari World Admission Ticket', 'Formula Rossa Access', 'Roundtrip Transfers'],
    badge: 'Best Combo'
  }
];

export const PriceMatchComparisonSection: React.FC<PriceMatchComparisonSectionProps> = ({
  currency,
  onBookExperience,
  onOpenWhatsApp,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'safari' | 'offroad' | 'city'>('all');

  const rateInfo = CURRENCY_RATES[currency] || { rate: 1, symbol: 'AED' };

  const formatPrice = (aedAmount: number) => {
    const converted = Math.round(aedAmount * rateInfo.rate);
    if (currency === 'AED') return `AED ${converted}`;
    return `${rateInfo.symbol}${converted.toLocaleString()} (AED ${aedAmount})`;
  };

  const filteredItems = COMPARISON_DATA.filter(
    (item) => filterCategory === 'all' || item.category === filterCategory
  );

  return (
    <section id="price-comparison" className="py-20 bg-stone-900 text-stone-100 relative overflow-hidden border-t border-stone-800">
      {/* Background Decorative Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest shadow-xs">
            <span className="material-symbols-outlined text-[16px]">price_check</span>
            <span>Direct Operator Best Price Guarantee</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            Why Pay Middleman Commissions? <br />
            <span className="bg-gradient-to-r from-amber-200 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Direct Operator Price Match Guarantee
            </span>
          </h2>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            By booking directly with <strong className="text-amber-300">The Phoenix Desert Safari Dubai</strong> (DTCM Permit EXP-2024-8849), you eliminate 30–50% agency markups charged by hotel concierges and third-party reseller portals.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {[
            { id: 'all', label: 'All Packages' },
            { id: 'safari', label: 'Desert Safaris' },
            { id: 'offroad', label: 'Dune Buggy & Quad Biking' },
            { id: 'city', label: 'City Sightseeing & Combos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                filterCategory === tab.id
                  ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 scale-105'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-700/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Comparison Grid & Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredItems.map((item) => {
            const phoenixConv = Math.round(item.phoenixPriceAED * rateInfo.rate);
            const otaConv = Math.round(item.otaPriceAED * rateInfo.rate);
            const hotelConv = Math.round(item.hotelPriceAED * rateInfo.rate);
            const savedAed = item.otaPriceAED - item.phoenixPriceAED;

            return (
              <div
                key={item.id}
                className="bg-stone-950/80 rounded-2xl border border-stone-800 p-6 space-y-5 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between group shadow-xl"
              >
                <div>
                  {/* Top Bar with Title & Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-serif font-bold text-lg sm:text-xl text-white group-hover:text-amber-300 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    {item.badge && (
                      <span className="shrink-0 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Price Comparison Bars */}
                  <div className="bg-stone-900/90 rounded-xl p-4 border border-stone-800/80 space-y-3">
                    {/* Phoenix Direct Rate */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-400 text-[20px]">verified</span>
                        <div>
                          <span className="text-xs font-extrabold text-emerald-300 block">The Phoenix (Direct Operator)</span>
                          <span className="text-[10px] text-emerald-400/80">0% Booking Fees • Pay on Pickup</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-emerald-300 block">
                          {currency === 'AED' ? `AED ${phoenixConv}` : `${rateInfo.symbol}${phoenixConv}`}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded">
                          Save AED {savedAed} ({item.savingsPercent}% OFF)
                        </span>
                      </div>
                    </div>

                    {/* OTA / Reseller Portals */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-stone-950 text-stone-400 text-xs">
                      <span className="text-stone-400">Viator / GetYourGuide Resellers:</span>
                      <span className="line-through font-semibold text-stone-400">
                        {currency === 'AED' ? `AED ${otaConv}` : `${rateInfo.symbol}${otaConv}`}
                      </span>
                    </div>

                    {/* Hotel Concierge Desk */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-stone-950 text-stone-500 text-xs">
                      <span className="text-stone-500">Hotel Concierge Desks:</span>
                      <span className="line-through font-semibold text-stone-500">
                        {currency === 'AED' ? `AED ${hotelConv}` : `${rateInfo.symbol}${hotelConv}`}
                      </span>
                    </div>
                  </div>

                  {/* Key Inclusions Checklist */}
                  <div className="mt-4 pt-3 border-t border-stone-800/60">
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-2">
                      Guaranteed Direct Inclusions:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs text-stone-300">
                      {item.inclusions.map((inc, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-amber-400 text-[14px]">check_circle</span>
                          <span className="truncate">{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Booking CTA */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onBookExperience(item.id)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    <span>Book at Direct Rate ({formatPrice(item.phoenixPriceAED)})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Competitor Price Match Pledge Callout */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-500/10 via-stone-800 to-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
              <span className="material-symbols-outlined text-[28px]">verified_user</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">Found a Lower Published Price Elsewhere?</h4>
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                If you find a lower published rate for the exact same DTCM licensed desert safari or dune buggy itinerary, send us a quick screenshot on WhatsApp. We will <strong className="text-amber-300">match the price instantly</strong> and give you a free VIP camel ride or table upgrade!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenWhatsApp}
            className="shrink-0 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 cursor-pointer transition-all active:scale-98 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>WhatsApp Price Match Concierge</span>
          </button>
        </div>
      </div>
    </section>
  );
};
