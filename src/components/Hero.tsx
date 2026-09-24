import React, { useState } from 'react';
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
}

export const Hero: React.FC<HeroProps> = ({
  onCheckLiveRates,
  onOpenConcierge,
  heroTitle,
  heroSubtitle,
  heroImage,
}) => {
  // Category tabs
  const [activeTab, setActiveTab] = useState<'desert-safaris' | 'city-tours' | 'buggies' | 'private-convoys'>(
    'desert-safaris'
  );

  // Filter experiences by active tab
  const filteredExperiences = EXPERIENCES.filter((exp) => exp.category === activeTab);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string>(
    filteredExperiences[0]?.id || 'evening-desert-safari'
  );

  // Update selected experience when tab changes
  const handleTabChange = (tab: 'desert-safaris' | 'city-tours' | 'buggies' | 'private-convoys') => {
    setActiveTab(tab);
    const matches = EXPERIENCES.filter((exp) => exp.category === tab);
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

  return (
    <section className="relative w-full min-h-[942px] flex flex-col justify-end -mt-20 overflow-hidden bg-[#FFF9F2]">
      {/* Desert Cinematic Background with warm sunlit amber overlay */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida/AEtjO1XhYTIm6i_lgiqgiHMctjmM6WOhkzihEl1WR6AUT1AvGVtCpbttGjyrmbnYUegujMEQtDFsUaCvXxB7QPFlPXRFkznTeSdPeoLy40cUupg_ikW7Sqrlnc_ZTVDnvk-KdFd-3YUT2NPnjB1X_6Bzy1CSvT8faI-OBIsGG8vnvWeTvGcvqGR_lyk-212F0dmwNcb04VN71vxKCLC2Oafz9CkYbjvweLjwOesvIjIceQnU4Mvz5TMS1bqwYsE0')`,
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
              DTCM Licensed Operator • Business Bay, Dubai
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
              'Phoenix Desert Safari is a Dubai tour operator offering desert experiences and UAE sightseeing tours. Services include evening and morning desert safaris, private desert safaris, quad biking, dune bashing, camel rides, sandboarding, Dubai city tours, Abu Dhabi city tours and dhow cruises.'}
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
              <span className="text-xs text-stone-600 truncate">Call &amp; WhatsApp: 056 150 5270</span>
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
              City Sightseeing
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
              Buggies &amp; Quad Biking
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
              Private Royal Convoys
            </button>
          </div>

          {/* Form Selectors Row */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Experience Choice */}
            <div className="flex flex-col gap-1 bg-[#FAF6F0] border border-amber-200/70 px-4 py-2 rounded-xl focus-within:border-[#EA580C] transition-colors">
              <label className="text-[11px] text-[#C2410C] font-bold uppercase tracking-wider">
                Select Experience
              </label>
              <div className="flex items-center justify-between">
                <select
                  value={selectedExperienceId}
                  onChange={(e) => setSelectedExperienceId(e.target.value)}
                  className="bg-transparent text-stone-900 text-sm font-medium outline-none cursor-pointer w-full"
                >
                  {filteredExperiences.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.title} {exp.badge ? `(${exp.badge})` : ''}
                    </option>
                  ))}
                  {/* Also show all other experiences grouped */}
                  <optgroup label="All Experiences">
                    {EXPERIENCES.map((exp) => (
                      <option key={`all-${exp.id}`} value={exp.id}>
                        {exp.title} (AED {exp.priceAED})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Date Picker */}
            <div className="flex flex-col gap-1 bg-[#FAF6F0] border border-amber-200/70 px-4 py-2 rounded-xl focus-within:border-[#EA580C] transition-colors">
              <label className="text-[11px] text-[#C2410C] font-bold uppercase tracking-wider">
                Safari Date
              </label>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                  calendar_month
                </span>
                <input
                  className="bg-transparent text-stone-900 text-sm font-medium outline-none cursor-pointer w-full"
                  type="date"
                  value={safariDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSafariDate(e.target.value)}
                />
              </div>
            </div>

            {/* Guests Counter */}
            <div className="flex flex-col gap-1 bg-[#FAF6F0] border border-amber-200/70 px-4 py-2 rounded-xl">
              <label className="text-[11px] text-[#C2410C] font-bold uppercase tracking-wider">
                Guests &amp; Convoy
              </label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#EA580C] text-[18px]">group</span>
                  <span className="text-sm text-stone-900 font-medium">
                    {adults} Adult{adults > 1 ? 's' : ''}, {children} Kid{children !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center text-amber-900 hover:bg-[#EA580C] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    onClick={handleMinus}
                    type="button"
                    aria-label="Decrease adults"
                  >
                    -
                  </button>
                  <button
                    className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center text-amber-900 hover:bg-[#EA580C] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    onClick={handlePlus}
                    type="button"
                    aria-label="Increase adults"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="h-full flex items-center">
              <button
                type="submit"
                className="w-full h-full min-h-[52px] rounded-xl bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#D97706] hover:from-[#C2410C] hover:to-[#EA580C] text-white flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-[20px]">explore</span>
                <span>Check Live Rates</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
