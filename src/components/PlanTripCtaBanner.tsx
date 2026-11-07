import React from 'react';

interface PlanTripCtaBannerProps {
  onPlanTrip: () => void;
  onOpenWhatsApp?: () => void;
}

export const PlanTripCtaBanner: React.FC<PlanTripCtaBannerProps> = ({
  onPlanTrip,
  onOpenWhatsApp,
}) => {
  return (
    <section className="w-full py-12 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0C325B] via-[#082342] to-[#041427] text-white p-8 sm:p-12 lg:p-16 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Background Scenic Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1400&auto=format&fit=crop&q=80')`,
            }}
          ></div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#0284C7]/30 rounded-full blur-3xl pointer-events-none"></div>

          {/* Text Content */}
          <div className="relative z-10 max-w-2xl space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-[#38BDF8] uppercase tracking-widest block">
              READY FOR YOUR NEXT ADVENTURE?
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
              Let&apos;s Plan Your Dream Trip Today!
            </h2>
            <p className="text-sm sm:text-base text-stone-200 pt-1 leading-relaxed">
              Get in touch with our travel experts and start exploring the untamed golden dunes and sights of Dubai.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onPlanTrip}
              className="px-8 py-4 rounded-full bg-[#0084FF] hover:bg-[#0070db] text-white text-sm font-bold shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Plan Your Trip</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            {onOpenWhatsApp && (
              <button
                type="button"
                onClick={onOpenWhatsApp}
                className="px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold backdrop-blur-md transition-all cursor-pointer flex items-center gap-2"
              >
                <span>WhatsApp VIP</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
