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
  announcementText,
}) => {
  // Category tabs
  const [activeTab, setActiveTab] = useState<'desert-safaris' | 'city-tours' | 'buggies' | 'private-convoys'>(
    'desert-safaris'
  );

  const allExperiences = experiences && experiences.length > 0 ? experiences : EXPERIENCES;

  // Filter experiences by active tab
  const filteredExperiences = allExperiences.filter((exp) => exp.category === activeTab);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string>(
    filteredExperiences[0]?.id || 'evening-desert-safari'
  );

  // Update selected experience when tab changes
  const handleTabChange = (tab: 'desert-safaris' | 'city-tours' | 'buggies' | 'private-convoys') => {
    setActiveTab(tab);
    const matches = allExperiences.filter((exp) => exp.category === tab);
    if (matches.length > 0) {
      setSelectedExperienceId(matches[0].id);
    }
  };

  // Date defaults to tomorrow
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
    'https://lh3.googleusercontent.com/aida/AEtjO1XhYTIm6i_lgiqgiHMctjmM6WOhkzihEl1WR6AUT1AvGVtCpbttGjyrmbnYUegujMEQtDFsUaCvXxB7QPFlPXRFkznTeSdPeoLy40cUupg_ikW7Sqrlnc_ZTVDnvk-KdFd-3YUT2NPnjB1X_6Bzy1CSvT8faI-OBIsGG8vnvWeTvGcvqGR_lyk-212F0dmwNcb04VN71vxKCLC2Oafz9CkYbjvweLjwOesvIjIceQnU4Mvz5TMS1bqwYsE0';

  return (
    <section className="relative w-full min-h-[942px] flex flex-col justify-end -mt-20 overflow-hidden bg-[#FFF9F2]">
      {/* Desert Cinematic Background with warm sunlit amber overlay */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url('${bgImageUrl}')`,
        }}
      >
        {/* Sunlit warm radiant overlays for pristine readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF6F0] via-[#FAF6F0]/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF6F0]/95 via-[#FAF6F0]/80 to-amber-900/10"></div>
        <div className="absolute inset-0 bg-amber-500/10 mix-blend-color-burn"></div>
      </div>

      {/* Content Scrim & Typography */}
      <div className="relative z-10 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-16 pt-36 pb-10 flex flex-col justify-end">
        {/* Overline Tag */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80 shadow-sm backdrop-blur-md">
            <span className="material-symbols-outlined text-[16px] text-[#EA580C]">stars</span>
            <span className="text-[11px] uppercase tracking-widest font-bold">
              {announcementText || 'DTCM Licensed Operator • Free Home & Hotel Pickup Across Dubai'}
            </span>
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm backdrop-blur-md">
            <span className="material-symbols-outlined text-emerald-600 text-[14px]">bolt</span>
            <span className="text-[11px] font-semibold">Instant Voucher Confirmation</span>
          </span>
        </div>

        {/* Main Headline & Subtitle */}
        <div className="max-w-4xl space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] text-[#1C1917] tracking-tight leading-[1.08] font-serif font-semibold">
            {heroTitle ? (
              heroTitle
            ) : (
              <>
                Experience the Untamed Spirit of{' '}
                <span className="italic font-serif bg-gradient-to-r from-[#C2410C] via-[#EA580C] to-[#D97706] bg-clip-text text-transparent">
                  Dubai’s Golden Dunes
                </span>
              </>
            )}
          </h1>
          <p className="text-base sm:text-lg text-stone-700 leading-relaxed max-w-3xl">
            {heroSubtitle ||
              'Phoenix Desert Safari is a Dubai tour operator offering authentic Bedouin desert experiences, 5-star camp hospitality, private convoys, and 1000HP dune buggies.'}
          </p>
        </div>

        {/* Key Trust Pillars Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-2">
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-amber-100 shadow-[0_4px_16px_rgba(217,119,6,0.06)] hover:border-amber-300 transition-colors">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-[#EA580C] text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-stone-900 font-bold truncate">5.0 Google Reviews</span>
              <span className="text-xs text-stone-600 truncate">Official &amp; Verified Rating</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-sky-100 shadow-[0_4px_16px_rgba(2,132,199,0.06)] hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#0284C7] text-[20px]">qr_code_2</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-stone-900 font-bold truncate">Instant Mobile Tickets</span>
              <span className="text-xs text-stone-600 truncate">Zero paperwork needed</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-emerald-100 shadow-[0_4px_16px_rgba(5,150,105,0.06)] hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#059669] text-[20px]">
                verified_user
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-stone-900 font-bold truncate">Licensed Desert Marshals</span>
              <span className="text-xs text-stone-600 truncate">Fleet of luxury 4x4 Land Cruisers</span>
            </div>
          </div>

          <div
            onClick={onOpenConcierge}
            className="flex items-center gap-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-orange-100 shadow-[0_4px_16px_rgba(234,88,12,0.06)] hover:border-orange-300 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-orange-100 group-hover:bg-[#EA580C] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <span className="material-symbols-outlined text-[#EA580C] group-hover:text-white text-[20px] transition-colors">
                support_agent
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-stone-900 font-bold truncate group-hover:text-[#EA580C] transition-colors">
                24/7 VIP Concierge
              </span>
              <span className="text-xs text-stone-600 truncate">Call &amp; WhatsApp: {phone}</span>
            </div>
          </div>
        </div>

        {/* Quick Interactive Booking Bar */}
        <div className="mt-6 w-full bg-white/95 backdrop-blur-2xl rounded-2xl border border-amber-200/80 shadow-[0_12px_40px_rgba(217,119,6,0.12)] p-6">
          {/* Category Tab Selection */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
            <button
              onClick={() => handleTabChange('desert-safaris')}
              className={`px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'desert-safaris'
                  ? 'bg-gradient-to-r from-[#EA580C] to-[#D97706] text-white font-bold shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:text-stone-900 hover:bg-stone-200/80'
              }`}
              type="button"
            >
              Desert Safaris
            </button>
            <button
              onClick={() => handleTabChange('city-tours')}
              className={`px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'city-tours'
                  ? 'bg-gradient-to-r from-[#EA580C] to-[#D97706] text-white font-bold shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:text-stone-900 hover:bg-stone-200/80'
              }`}
              type="button"
            >
              City Tours
            </button>
            <button
              onClick={() => handleTabChange('buggies')}
              className={`px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'buggies'
                  ? 'bg-gradient-to-r from-[#EA580C] to-[#D97706] text-white font-bold shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:text-stone-900 hover:bg-stone-200/80'
              }`}
              type="button"
            >
              Buggies &amp; ATVs
            </button>
            <button
              onClick={() => handleTabChange('private-convoys')}
              className={`px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'private-convoys'
                  ? 'bg-gradient-to-r from-[#EA580C] to-[#D97706] text-white font-bold shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:text-stone-900 hover:bg-stone-200/80'
              }`}
              type="button"
            >
              Private VIP Convoys
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Experience Selector */}
            <div className="flex flex-col">
              <label htmlFor="experience" className="text-[11px] font-bold text-stone-600 uppercase mb-1">
                Select Tour
              </label>
              <div className="relative">
                <select
                  id="experience"
                  value={selectedExperienceId}
                  onChange={(e) => setSelectedExperienceId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#EA580C] appearance-none cursor-pointer"
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
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none text-[20px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Date Selector */}
            <div className="flex flex-col">
              <label htmlFor="safari-date" className="text-[11px] font-bold text-stone-600 uppercase mb-1">
                Safari Date
              </label>
              <input
                type="date"
                id="safari-date"
                value={safariDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSafariDate(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#EA580C] cursor-pointer"
              />
            </div>

            {/* Guests Counter */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-stone-600 uppercase mb-1">Guests</label>
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
                    className="w-7 h-7 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Check Rates / Book CTA */}
            <div className="flex flex-col justify-end">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#EA580C] via-[#D97706] to-[#C2410C] text-white text-xs sm:text-sm uppercase tracking-wider font-extrabold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Check Live Rates</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

