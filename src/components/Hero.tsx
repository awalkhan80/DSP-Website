import React, { useState } from 'react';
import { Experience } from '../types';
import { EXPERIENCES } from '../data/safaris';

interface HeroProps {
  onCheckLiveRates: (bookingParams: {
    experienceId: string;
    date: string;
    adults: number;
    children: number;
  }) => void;
  onOpenConcierge: () => void;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  experiences?: Experience[];
  phone?: string;
  announcementText?: string;
}

export const Hero: React.FC<HeroProps> = ({
  onCheckLiveRates,
  onOpenConcierge,
  heroTitle,
  heroSubtitle,
  heroImage,
  experiences,
  phone = '+971 56 150 5270',
}) => {
  const [activeTab, setActiveTab] = useState<'desert-safaris' | 'city-tours' | 'buggies' | 'private-convoys'>(
    'desert-safaris'
  );

  const allExperiences = experiences && experiences.length > 0 ? experiences : EXPERIENCES;

  // Filter experiences by active tab
  const filteredExperiences = allExperiences.filter((exp) => exp.category === activeTab);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string>(
    filteredExperiences[0]?.id || 'evening-desert-safari'
  );

  const handleTabChange = (tab: 'desert-safaris' | 'city-tours' | 'buggies' | 'private-convoys') => {
    setActiveTab(tab);
    const matches = allExperiences.filter((exp) => exp.category === tab);
    if (matches.length > 0) {
      setSelectedExperienceId(matches[0].id);
    }
  };

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [safariDate, setSafariDate] = useState<string>(getTomorrowDate());
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);

  const handlePlus = () => {
    if (adults < 14) setAdults((prev) => prev + 1);
  };

  const handleMinus = () => {
    if (adults > 1) setAdults((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckLiveRates({
      experienceId: selectedExperienceId,
      date: safariDate,
      adults,
      children,
    });
  };

  const bgImageUrl =
    heroImage ||
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1800&auto=format&fit=crop&q=85';

  return (
    <section id="home" className="relative w-full pt-28 sm:pt-36 pb-0 overflow-hidden bg-[#071727]">
      {/* Cinematic Panoramic Background with Gradient Overlays */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url('${bgImageUrl}')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#071727] via-[#071727]/75 to-[#071727]/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#071727]/90 via-[#071727]/70 to-transparent"></div>
      </div>

      {/* Main Hero Content (Matches uploaded design) */}
      <div className="relative z-10 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-16 pt-8 pb-16 flex flex-col justify-end">
        {/* Eyebrow with trailing dash */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#38BDF8] uppercase">
            YOUR DREAM VACATION AWAITS —
          </span>
        </div>

        {/* Grand Headline (Explore Dubai With Phoenix Tours) */}
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.08]">
            {heroTitle ? (
              heroTitle
            ) : (
              <>
                Explore the World <br />
                With <span className="text-[#38BDF8]">The Phoenix Tours</span>
              </>
            )}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-stone-200 leading-relaxed max-w-2xl">
            {heroSubtitle ||
              'Discover breathtaking red dunes, unforgettable Arabian experiences, and expertly crafted luxury tours across Dubai and beyond.'}
          </p>
        </div>

        {/* Dual CTA Buttons (Matches reference design) */}
        <div className="flex flex-wrap items-center gap-4 mt-8">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('destinations');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-7 py-3.5 rounded-full bg-[#0084FF] hover:bg-[#0070db] text-white text-xs sm:text-sm font-bold shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center gap-2.5"
          >
            <span className="material-symbols-outlined text-[18px]">flight</span>
            <span>Explore Tours</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>

          <button
            type="button"
            onClick={onOpenConcierge}
            className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition-all cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px] text-[#38BDF8]">play_circle</span>
            <span>Watch Our Story</span>
          </button>
        </div>

        {/* Quick Interactive Search / Rate Check Bar */}
        <div className="mt-12 w-full bg-white/95 backdrop-blur-2xl rounded-2xl border border-stone-200/80 shadow-2xl p-5 sm:p-6 text-stone-900">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
            <button
              onClick={() => handleTabChange('desert-safaris')}
              className={`px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'desert-safaris'
                  ? 'bg-[#0084FF] text-white font-bold shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
              type="button"
            >
              Desert Safaris
            </button>
            <button
              onClick={() => handleTabChange('city-tours')}
              className={`px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'city-tours'
                  ? 'bg-[#0084FF] text-white font-bold shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
              type="button"
            >
              City Tours
            </button>
            <button
              onClick={() => handleTabChange('buggies')}
              className={`px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'buggies'
                  ? 'bg-[#0084FF] text-white font-bold shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
              type="button"
            >
              Can-Am Buggies &amp; ATVs
            </button>
            <button
              onClick={() => handleTabChange('private-convoys')}
              className={`px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'private-convoys'
                  ? 'bg-[#0084FF] text-white font-bold shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
              type="button"
            >
              Private VIP Convoys
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label htmlFor="experience" className="text-[11px] font-bold text-stone-500 uppercase mb-1">
                Select Tour
              </label>
              <div className="relative">
                <select
                  id="experience"
                  value={selectedExperienceId}
                  onChange={(e) => setSelectedExperienceId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0084FF] appearance-none cursor-pointer"
                >
                  {filteredExperiences.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.title} (AED {exp.priceAED})
                    </option>
                  ))}
                  {filteredExperiences.length === 0 && (
                    <option value="evening-desert-safari">Evening Desert Safari (AED 120)</option>
                  )}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-[20px]">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="safari-date" className="text-[11px] font-bold text-stone-500 uppercase mb-1">
                Date
              </label>
              <input
                type="date"
                id="safari-date"
                value={safariDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSafariDate(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0084FF] cursor-pointer"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-stone-500 uppercase mb-1">Guests</label>
              <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2">
                <span className="text-xs sm:text-sm font-semibold text-stone-900">
                  {adults} {adults === 1 ? 'Adult' : 'Adults'}
                  {children > 0 && `, ${children} ${children === 1 ? 'Child' : 'Children'}`}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleMinus}
                    className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={handlePlus}
                    className="w-7 h-7 rounded-lg bg-[#0084FF] hover:bg-[#0070db] text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-[#0084FF] hover:bg-[#0070db] text-white text-xs sm:text-sm uppercase tracking-wider font-extrabold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Check Live Rates</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 5-Column Trust & Value Bar (Exact bar matching reference design) */}
      <div className="w-full bg-[#0B1E33] border-t border-sky-900/40 py-5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6 text-white">
            {/* Pillar 1 */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#38BDF8] shrink-0">
                <span className="material-symbols-outlined text-[20px]">shield</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">Safe &amp; Secure</span>
                <span className="text-[11px] text-stone-400">100% Pay on Arrival</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#38BDF8] shrink-0">
                <span className="material-symbols-outlined text-[20px]">headset_mic</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">24/7 Support</span>
                <span className="text-[11px] text-stone-400">Live VIP Chauffeur</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#38BDF8] shrink-0">
                <span className="material-symbols-outlined text-[20px]">star</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">Expertly Curated</span>
                <span className="text-[11px] text-stone-400">Red Lahbab Sand Dunes</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#38BDF8] shrink-0">
                <span className="material-symbols-outlined text-[20px]">sell</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">Best Price</span>
                <span className="text-[11px] text-stone-400">Zero Middleman Markup</span>
              </div>
            </div>

            {/* Pillar 5 */}
            <div className="flex items-center gap-3 col-span-2 md:col-span-1 justify-center md:justify-start">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#38BDF8] shrink-0">
                <span className="material-symbols-outlined text-[20px]">group</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">Happy Travelers</span>
                <span className="text-[11px] text-stone-400">4.9 / 5.0 Star Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
