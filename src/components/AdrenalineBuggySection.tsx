import React, { useState } from 'react';
import { Currency, Experience, OffRoadPricingConfig } from '../types';
import { CURRENCY_RATES, DEFAULT_OFF_ROAD_PRICING, EXPERIENCES, getBuggyPrice, getQuadBikePrice } from '../data/safaris';

interface AdrenalineBuggySectionProps {
  currency: Currency;
  onBookExperience: (
    experienceId: string,
    params?: {
      duration?: '30m' | '60m';
      machine?: string;
      timeSlot?: string;
      quadRider?: 'single' | 'double';
      quadTerrain?: 'inside_circle' | 'open_desert';
      quadEngine?: '220cc' | '350cc';
      buggyModel?: 'polaris' | 'canam';
      buggySeater?: '2-seater' | '4-seater';
    }
  ) => void;
  onViewItinerary: (experienceId: string) => void;
  experiences?: Experience[];
  offRoadPricing?: OffRoadPricingConfig;
}

export const AdrenalineBuggySection: React.FC<AdrenalineBuggySectionProps> = ({
  currency,
  onBookExperience,
  onViewItinerary,
  experiences,
  offRoadPricing = DEFAULT_OFF_ROAD_PRICING,
}) => {
  // Quad Bike State
  const [selectedAtvDuration, setSelectedAtvDuration] = useState<'30m' | '60m'>('30m');
  const [selectedAtvCc, setSelectedAtvCc] = useState<'220cc' | '350cc'>('220cc');
  const [selectedAtvRider, setSelectedAtvRider] = useState<'single' | 'double'>('single');
  const [selectedAtvTerrain, setSelectedAtvTerrain] = useState<'inside_circle' | 'open_desert'>('open_desert');
  const [selectedAtvSlot, setSelectedAtvSlot] = useState<string>('04:30 PM (Sunset Slot)');

  // Dune Buggy State (Polaris vs Can-Am)
  const [selectedBuggyModel, setSelectedBuggyModel] = useState<'polaris' | 'canam'>('canam');
  const [selectedBuggyDuration, setSelectedBuggyDuration] = useState<'30m' | '60m'>('60m');
  const [selectedBuggySeater, setSelectedBuggySeater] = useState<'2-seater' | '4-seater'>('2-seater');
  const [selectedBuggySlot, setSelectedBuggySlot] = useState<string>('05:00 PM (Golden Hour)');

  const allExperiences = experiences && experiences.length > 0 ? experiences : EXPERIENCES;
  const atvTour =
    allExperiences.find((e) => e.id === 'quad-bike-atv' || e.id === 'quad-bike-atv-rental') ||
    EXPERIENCES.find((e) => e.id === 'quad-bike-atv');
  const buggyTour =
    allExperiences.find((e) => e.id === 'can-am-buggy-safari' || e.id === 'can-am-dune-buggy') ||
    EXPERIENCES.find((e) => e.id === 'can-am-buggy-safari');

  const formatPrice = (aedAmount: number) => {
    const rateInfo = CURRENCY_RATES[currency];
    const converted = Math.round(aedAmount * rateInfo.rate);
    return `${currency} ${converted.toLocaleString()}`;
  };

  const atvPrice = getQuadBikePrice(
    offRoadPricing,
    selectedAtvCc,
    selectedAtvRider,
    selectedAtvTerrain,
    selectedAtvDuration
  );

  const buggyPrice = getBuggyPrice(
    offRoadPricing,
    selectedBuggyModel,
    selectedBuggySeater,
    selectedBuggyDuration
  );

  return (
    <section
      id="quad-and-buggy-rentals"
      className="w-full py-16 bg-gradient-to-b from-[#FAF6F0] via-[#F4ECE1] to-[#FAF6F0] scroll-mt-24"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        {/* Headline & Subtitle */}
        <div className="max-w-3xl space-y-1 mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-widest text-[#C2410C] font-bold">
              Adrenaline &amp; High-Horsepower • Self-Drive Red Dune Expeditions
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
              Direct Meeting Point (Free) • Private 4x4 Available
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl text-stone-900 font-semibold font-serif">
            Dubai Dune Buggy &amp; Quad Bike ATV Rentals
          </h2>
          <p className="text-base text-stone-600">
            Self-drive high-performance Can-Am Maverick X3 Turbo, Polaris RZR Buggies, and Yamaha Raptor ATVs across soaring Lahbab dunes. Pricing is for the whole vehicle. Direct arrival to desert base camp with free parking or optional private 4x4 chauffeur transfer.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* ===================== QUAD BIKE HIGHLIGHT CARD ===================== */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-amber-100 shadow-[0_8px_30px_rgba(217,119,6,0.08)] relative overflow-hidden">
            <div className="space-y-4 z-10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold uppercase border border-amber-200">
                  Rate per Quad Bike Vehicle
                </span>
                <div className="text-right">
                  <span className="text-2xl text-[#EA580C] font-bold font-serif">
                    {formatPrice(atvPrice)}
                  </span>
                  <span className="text-xs text-stone-500 font-normal font-sans ml-1">
                    / {selectedAtvDuration === '30m' ? '30 Mins' : '1 Hour'} ({selectedAtvRider === 'single' ? 'Single' : 'Double'})
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl text-stone-900 font-semibold font-serif">
                  {atvTour?.title || 'Quad Bike ATV Rental'}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed mt-1">
                  Ride 220cc or 350cc Raptor ATVs. Choose between designated circle tracks or deep open red dune trails with marshals. Helmet, goggles, and fuel included.
                </p>
              </div>

              {/* 1. DURATION TOGGLE (30 MINS vs 1 HOUR) */}
              <div className="p-3 bg-[#FAF6F0] rounded-xl border border-amber-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-700 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#EA580C]">timer</span>
                    Select Duration:
                  </span>
                  <span className="text-[11px] text-[#EA580C] font-semibold">
                    {selectedAtvDuration === '30m' ? 'Standard 30 Minutes' : 'Full 1 Hour (60 Mins)'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAtvDuration('30m')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedAtvDuration === '30m'
                        ? 'bg-[#EA580C] text-white shadow-sm'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">schedule</span>
                    <span>30 Minutes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAtvDuration('60m')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedAtvDuration === '60m'
                        ? 'bg-[#EA580C] text-white shadow-sm'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">schedule</span>
                    <span>1 Hour (60 Mins)</span>
                  </button>
                </div>
              </div>

              {/* 2. RIDER TYPE: SINGLE vs DOUBLE */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-1">
                <span className="text-xs text-stone-600 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-[#EA580C]">person</span>
                  Riders on Bike:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedAtvRider('single')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      selectedAtvRider === 'single'
                        ? 'bg-[#8D4B00] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <span>Single Rider (1 Person)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAtvRider('double')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      selectedAtvRider === 'double'
                        ? 'bg-[#8D4B00] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <span>Double (2 Persons)</span>
                  </button>
                </div>
              </div>

              {/* 3. TERRAIN: INSIDE CIRCLE vs OPEN DESERT */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-1">
                <span className="text-xs text-stone-600 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-[#EA580C]">terrain</span>
                  Track Location:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedAtvTerrain('inside_circle')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                      selectedAtvTerrain === 'inside_circle'
                        ? 'bg-[#8D4B00] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Inside Circle Track
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAtvTerrain('open_desert')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                      selectedAtvTerrain === 'open_desert'
                        ? 'bg-[#8D4B00] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Open Desert Dunes
                  </button>
                </div>
              </div>

              {/* 4. ENGINE CAPACITY: 220CC vs 350CC */}
              <div className="flex items-center justify-between gap-2 pt-1 pb-1">
                <span className="text-xs text-stone-500 font-semibold">Engine Tier:</span>
                <div className="flex items-center gap-1.5">
                  {(['220cc', '350cc'] as const).map((cc) => (
                    <button
                      key={cc}
                      type="button"
                      onClick={() => setSelectedAtvCc(cc)}
                      className={`px-3.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                        selectedAtvCc === cc
                          ? 'bg-[#EA580C] text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {cc} Raptor ATV
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. TIME SLOT SELECTION */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-xs text-stone-500 font-semibold">Time Slot:</span>
                <select
                  value={selectedAtvSlot}
                  onChange={(e) => setSelectedAtvSlot(e.target.value)}
                  className="bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
                >
                  <option value="07:30 AM (Sunrise Desert Run)">07:30 AM (Sunrise Desert Run)</option>
                  <option value="09:00 AM (Cool Morning)">09:00 AM (Cool Morning)</option>
                  <option value="10:30 AM (Mid-Morning Track)">10:30 AM (Mid-Morning Track)</option>
                  <option value="03:30 PM (Afternoon Dunes)">03:30 PM (Afternoon Dunes)</option>
                  <option value="04:30 PM (Sunset Slot)">04:30 PM (Sunset Slot)</option>
                  <option value="05:30 PM (Twilight Run)">05:30 PM (Twilight Run)</option>
                </select>
              </div>

              {/* Specs & Inclusions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 bg-[#FAF6F0] rounded-xl border border-stone-200/70 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                    two_wheeler
                  </span>
                  <span className="text-xs text-stone-800 font-semibold truncate">
                    {selectedAtvCc} ({selectedAtvRider === 'single' ? '1 Rider' : '2 Riders'})
                  </span>
                </div>
                <div className="p-2 bg-[#FAF6F0] rounded-xl border border-stone-200/70 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                    location_on
                  </span>
                  <span className="text-xs text-stone-800 font-semibold truncate">
                    Camp Meeting / Private 4x4
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Strip & Action Buttons */}
            <div className="mt-6 relative h-48 w-full rounded-xl overflow-hidden shadow-inner group">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url('${atvTour?.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3cf4jPrAC-DN5Da2vJ3_AGbHbR6Yx83Fa8N81kJ0Fe0oD87a2N_uLVWQbZW2Io8MdPi1Es_1bU7roSmN9lCjyb1fdk2uGtp0bKsod3-IPm9wxDqwXqvCZrgiEsYThx1JacNiHRBxVqp-EGOmKVV_iunEJuG04GQ9ta38QwMXXZBq_-KSto8HJDqypGth8xvt_T1PEBAqCFfEc9mE_AXABwf3Xc1lWLQKokQycJqqd6cGJtc6buc96jg'}')`,
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-4 gap-2">
                <button
                  type="button"
                  onClick={() => onViewItinerary(atvTour?.id || 'quad-bike-atv')}
                  className="py-2.5 px-3 rounded-lg bg-white/90 hover:bg-white text-stone-900 text-center text-xs uppercase tracking-wider font-bold shadow-md transition-all cursor-pointer"
                >
                  Itinerary
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onBookExperience(atvTour?.id || 'quad-bike-atv', {
                      duration: selectedAtvDuration,
                      machine: `${selectedAtvCc} Raptor (${selectedAtvRider === 'single' ? 'Single' : 'Double'} • ${selectedAtvTerrain === 'inside_circle' ? 'Circle Track' : 'Open Desert'})`,
                      timeSlot: selectedAtvSlot,
                      quadRider: selectedAtvRider,
                      quadTerrain: selectedAtvTerrain,
                      quadEngine: selectedAtvCc,
                    })
                  }
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#EA580C] to-[#D97706] hover:from-[#C2410C] hover:to-[#EA580C] text-white text-center text-xs uppercase tracking-wider font-bold shadow-md transition-all cursor-pointer"
                >
                  Book Quad ({selectedAtvDuration === '30m' ? '30 Min' : '1 Hr'} • AED {atvPrice})
                </button>
              </div>
            </div>
          </div>

          {/* ===================== DUNE BUGGY HIGHLIGHT CARD ===================== */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-amber-100 shadow-[0_8px_30px_rgba(217,119,6,0.08)] relative overflow-hidden">
            <div className="space-y-4 z-10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-[11px] font-bold uppercase border border-orange-200">
                  Rate per Buggy Vehicle
                </span>
                <div className="text-right">
                  <span className="text-2xl text-[#EA580C] font-bold font-serif">
                    {formatPrice(buggyPrice)}
                  </span>
                  <span className="text-xs text-stone-500 font-normal font-sans ml-1">
                    / {selectedBuggyDuration === '30m' ? '30 Mins' : '1 Hour'} ({selectedBuggyModel === 'canam' ? 'Can-Am' : 'Polaris'} {selectedBuggySeater})
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl text-stone-900 font-semibold font-serif">
                  {selectedBuggyModel === 'canam' ? 'Can-Am Maverick X3 Buggy' : 'Polaris RZR Dune Buggy'}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed mt-1">
                  Choose between Can-Am Maverick X3 Turbo (1000cc) or Polaris RZR buggies in 2-seater and 4-seater models with full roll cage, 4-point harness, and escort guide.
                </p>
              </div>

              {/* 1. DURATION TOGGLE (30 MINS vs 1 HOUR) */}
              <div className="p-3 bg-[#FAF6F0] rounded-xl border border-amber-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-700 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#EA580C]">timer</span>
                    Select Duration:
                  </span>
                  <span className="text-[11px] text-[#EA580C] font-semibold">
                    {selectedBuggyDuration === '30m' ? '30-Minute Sprint' : 'Full 1-Hour Expedition'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBuggyDuration('30m')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedBuggyDuration === '30m'
                        ? 'bg-[#EA580C] text-white shadow-sm'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">schedule</span>
                    <span>30 Minutes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBuggyDuration('60m')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedBuggyDuration === '60m'
                        ? 'bg-[#EA580C] text-white shadow-sm'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">schedule</span>
                    <span>1 Hour (60 Mins)</span>
                  </button>
                </div>
              </div>

              {/* 2. MODEL SELECTOR: POLARIS RZR vs CAN-AM MAVERICK */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-1">
                <span className="text-xs text-stone-600 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-[#EA580C]">directions_car</span>
                  Buggy Model:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedBuggyModel('polaris')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                      selectedBuggyModel === 'polaris'
                        ? 'bg-[#8D4B00] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Polaris RZR
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBuggyModel('canam')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                      selectedBuggyModel === 'canam'
                        ? 'bg-[#8D4B00] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Can-Am Maverick Turbo
                  </button>
                </div>
              </div>

              {/* 3. SEATER CONFIGURATION: 2-SEATER vs 4-SEATER */}
              <div className="flex items-center justify-between gap-2 pt-1 pb-1">
                <span className="text-xs text-stone-500 font-semibold">Seater Capacity:</span>
                <div className="flex items-center gap-1.5">
                  {(['2-seater', '4-seater'] as const).map((seat) => (
                    <button
                      key={seat}
                      type="button"
                      onClick={() => setSelectedBuggySeater(seat)}
                      className={`px-3.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                        selectedBuggySeater === seat
                          ? 'bg-[#EA580C] text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {seat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. TIME SLOT SELECTION */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-xs text-stone-500 font-semibold">Time Slot:</span>
                <select
                  value={selectedBuggySlot}
                  onChange={(e) => setSelectedBuggySlot(e.target.value)}
                  className="bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
                >
                  <option value="08:00 AM (Morning Desert Cruise)">08:00 AM (Morning Desert Cruise)</option>
                  <option value="10:00 AM (Mid-Day Adrenaline)">10:00 AM (Mid-Day Adrenaline)</option>
                  <option value="03:30 PM (Afternoon Desert Dunes)">03:30 PM (Afternoon Desert Dunes)</option>
                  <option value="05:00 PM (Golden Hour)">05:00 PM (Golden Hour)</option>
                  <option value="06:00 PM (Sunset &amp; Twilight)">06:00 PM (Sunset &amp; Twilight)</option>
                </select>
              </div>

              {/* Specs & Inclusions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 bg-[#FAF6F0] rounded-xl border border-stone-200/70 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#EA580C] text-[18px]">speed</span>
                  <span className="text-xs text-stone-800 font-semibold truncate">
                    {selectedBuggyModel === 'canam' ? 'Can-Am Maverick X3' : 'Polaris RZR'} ({selectedBuggySeater})
                  </span>
                </div>
                <div className="p-2 bg-[#FAF6F0] rounded-xl border border-stone-200/70 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                    location_on
                  </span>
                  <span className="text-xs text-stone-800 font-semibold truncate">
                    Camp Meeting / Private 4x4
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Strip & Action Buttons */}
            <div className="mt-6 relative h-48 w-full rounded-xl overflow-hidden shadow-inner group">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url('${buggyTour?.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmUuhU2zvZss3m2z-biFjAJWSc-FFBbo1m6ZnN3dfwWCVNQG6SnfV_9_rKM4lG_4ZxVczonwj4fFA8ROhBmd3wkntbAFTYyWk5iVKcvLmfug4xiWYsSITDwsR4KLWVGBghcaRz5lIZ-3lZl4hKk4yEG5pD_1nxWvvUe2jR7HOnv1ZMSUb2WelPbcAkCKqeglh2mmFr64taMzfh-Z42tEhCHT2lzyKMiOgMV3-AEgDrmDbgWeGZEJmFPw'}')`,
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-4 gap-2">
                <button
                  type="button"
                  onClick={() => onViewItinerary(buggyTour?.id || 'can-am-buggy-safari')}
                  className="py-2.5 px-3 rounded-lg bg-white/90 hover:bg-white text-stone-900 text-center text-xs uppercase tracking-wider font-bold shadow-md transition-all cursor-pointer"
                >
                  Itinerary
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onBookExperience(buggyTour?.id || 'can-am-buggy-safari', {
                      duration: selectedBuggyDuration,
                      machine: `${selectedBuggyModel === 'canam' ? 'Can-Am Maverick' : 'Polaris RZR'} (${selectedBuggySeater})`,
                      timeSlot: selectedBuggySlot,
                      buggyModel: selectedBuggyModel,
                      buggySeater: selectedBuggySeater,
                    })
                  }
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#D97706] text-white text-center text-xs uppercase tracking-wider font-bold hover:brightness-110 shadow-md transition-all cursor-pointer"
                >
                  Book Buggy ({selectedBuggyDuration === '30m' ? '30 Min' : '1 Hr'} • AED {buggyPrice})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
