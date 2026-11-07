import React from 'react';

interface TravelServicesSectionProps {
  onSelectService?: (serviceKey: string) => void;
  onOpenBooking?: () => void;
  onOpenWhatsApp?: () => void;
}

export const TravelServicesSection: React.FC<TravelServicesSectionProps> = ({
  onSelectService,
  onOpenBooking,
  onOpenWhatsApp,
}) => {
  const services = [
    {
      id: 'transfers',
      icon: 'flight',
      title: 'Doorstep 4x4 Pickup',
      subtitle: 'Free private and sharing transfers at best reliability.',
    },
    {
      id: 'safari-camp',
      icon: 'restaurant',
      title: '5-Star Camp Hospitality',
      subtitle: 'Live BBQ dinner buffet with cultural fire & dance shows.',
    },
    {
      id: 'buggy-rental',
      icon: 'directions_car',
      title: 'Can-Am Buggy & Quads',
      subtitle: '1000cc Turbo power machines with safety marshal escorts.',
    },
    {
      id: 'packages',
      icon: 'luggage',
      title: 'Tailored Tour Packages',
      subtitle: 'Group & private custom tours curated for every budget.',
    },
    {
      id: 'city-tours',
      icon: 'apartment',
      title: 'City Tours & Passes',
      subtitle: 'Burj Khalifa tickets, Abu Dhabi Mosque & Creek excursions.',
    },
    {
      id: 'support',
      icon: 'headset_mic',
      title: '24/7 VIP Support',
      subtitle: 'Direct WhatsApp booking desk ready to help anytime.',
    },
  ];

  return (
    <section id="services" className="w-full py-20 bg-[#0B1E33] text-white relative overflow-hidden scroll-mt-20">
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0284C7]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 relative z-10">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-[#38BDF8] uppercase tracking-widest block mb-1">
              — OUR SERVICES
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Travel Services We Offer
            </h2>
            <p className="text-sm text-stone-300 mt-1 max-w-xl">
              From planning to arrival, we take care of everything for your Arabian journey.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenBooking}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-semibold text-white transition-all self-start md:self-auto cursor-pointer"
          >
            <span>View All Services</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        {/* 6 Glassmorphic Services Grid (Matches reference design) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {services.map((svc) => (
            <div
              key={svc.id}
              onClick={() => {
                if (svc.id === 'support') {
                  onOpenWhatsApp?.();
                } else {
                  onOpenBooking?.();
                }
              }}
              className="group p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-400/50 backdrop-blur-md transition-all duration-300 flex flex-col items-center text-center cursor-pointer shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 group-hover:bg-[#0284C7] text-white flex items-center justify-center mb-4 transition-colors">
                <span className="material-symbols-outlined text-[26px]">{svc.icon}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5 leading-snug group-hover:text-[#38BDF8] transition-colors">
                {svc.title}
              </h3>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                {svc.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
