import React from 'react';

interface AboutExperienceSectionProps {
  onLearnMore?: () => void;
  onOpenBooking?: () => void;
}

export const AboutExperienceSection: React.FC<AboutExperienceSectionProps> = ({
  onLearnMore,
  onOpenBooking,
}) => {
  return (
    <section id="about-experience" className="w-full py-20 bg-white border-b border-stone-200/60 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Traveler Lifestyle Photo */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-stone-100 max-w-md mx-auto lg:max-w-none">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&auto=format&fit=crop&q=80"
                alt="Traveler exploring Arabian desert landscape"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E33]/60 via-transparent to-transparent"></div>

              {/* Floating Badge on Image */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-stone-200/60 shadow-lg flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#0284C7]/15 text-[#0284C7] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Direct Operator Guarantee</div>
                  <div className="text-[11px] text-stone-500 font-medium">100% Pay on Arrival • Zero Upfront Risk</div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Story & Narrative */}
          <div className="lg:col-span-4 space-y-5">
            <span className="text-xs font-bold text-[#0284C7] uppercase tracking-widest block">
              ABOUT PHOENIX TOURS
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0F172A] tracking-tight leading-[1.18]">
              More Than Just a Trip, <br />
              It&apos;s a Lifetime Experience
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              At The Phoenix Tours, we believe travel is not just about visiting places — it&apos;s about creating
              unforgettable memories, experiencing authentic Arabian heritage, and discovering the desert in your own
              way.
            </p>
            <p className="text-sm text-stone-600 leading-relaxed">
              We specialize in customized red dune safaris, Can-Am buggy expeditions, and luxury travel experiences
              across Dubai and beyond with our own private vehicle fleet and camp.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onLearnMore || onOpenBooking}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-500/25 hover:shadow-sky-500/40 transition-all cursor-pointer active:scale-98"
              >
                <span>Learn More About Us</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Right Column: 4 Icon Benefit Cards (Matches reference) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Feature 1 */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-[#0284C7] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">flight_takeoff</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A]">Customized Travel Packages</h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Tailor-made trips to fit your schedule, group size, and budget.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-[#059669] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">explore</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A]">Professional Tour Guides</h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Local licensed desert captains for a richer, safer adventure.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-[#D97706] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">favorite</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A]">Best Direct Travel Deals</h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Unbeatable fleet rates with zero middleman markup.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-[#4F46E5] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">public</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A]">Complete Dubai Excursions</h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Red dunes, city skylines, and premier attractions all in one.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
