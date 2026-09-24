import React from 'react';
import { Currency, Experience } from '../types';
import { CURRENCY_RATES } from '../data/safaris';

interface SignatureExpeditionsProps {
  currency: Currency;
  onBookExperience: (experienceId: string) => void;
  onViewItinerary: (experienceId: string) => void;
  experiences?: Experience[];
}

export const SignatureExpeditions: React.FC<SignatureExpeditionsProps> = ({
  currency,
  onBookExperience,
  onViewItinerary,
  experiences,
}) => {
  const formatPrice = (aedAmount: number) => {
    const rateInfo = CURRENCY_RATES[currency];
    const converted = Math.round(aedAmount * rateInfo.rate);
    return `${currency} ${converted.toLocaleString()}`;
  };

  const eveningPrice = experiences?.find((e) => e.id === 'evening-desert-safari')?.priceAED ?? 120;
  const morningPrice = experiences?.find((e) => e.id === 'morning-desert-safari')?.priceAED ?? 450;
  const privatePrice = experiences?.find((e) => e.id === 'private-desert-safari')?.priceAED ?? 850;

  return (
    <section id="desert-safaris" className="w-full py-16 bg-[#FAF6F0] scroll-mt-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div className="space-y-1 max-w-2xl">
            <span className="text-[11px] uppercase tracking-widest text-[#C2410C] font-bold">
              Signature Red Dune Expeditions • DTCM Licensed
            </span>
            <h2 className="text-3xl sm:text-4xl text-stone-900 font-semibold font-serif">
              Dubai Desert Safari Tours &amp; VIP Expeditions
            </h2>
            <p className="text-base text-stone-600">
              Selected by over 40,000 global travelers for pristine Red Lahbab dunes, licensed English-speaking
              safari captains, 45-minute 4x4 dune bashing, and 5-star desert camp hospitality.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full self-start md:self-auto">
            <span className="text-[11px] text-amber-900 uppercase tracking-wider font-bold">
              Complimentary Hotel Pickup &amp; Drop Included
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C] animate-pulse"></div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Package 1: Evening Desert Safari (Best Seller) */}
          <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-amber-100 shadow-[0_6px_24px_rgba(217,119,6,0.08)] transition-all duration-300 hover:shadow-[0_12px_36px_rgba(217,119,6,0.16)] hover:-translate-y-1">
            {/* Image Container */}
            <div className="relative h-64 w-full overflow-hidden cursor-pointer" onClick={() => onViewItinerary('evening-desert-safari')}>
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnHfQ_xD50mSdKpb_AX87krGRMEnUDwIXco_BEGwEs4j-EpVpiuGkmIUB5RwaW2iC42DL2UjCqzYVjEnvSEtZA-pMdChCLUsegIFFlflTsUd2y3BvsvfP5Q2Qunr7sWjRY9BCYTi9ANBMbBZ2SZ2Ps4ve8rYtJGe19JPv4az0YV1li5eXxA6Qd7PkZWZ3hpkfjU0G-jePPYEo66vWaKMQgeOdgBW4H_xBquYIVqQu8oHMDw6l00wWd8g')`,
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30"></div>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#EA580C] to-[#D97706] text-white text-[11px] uppercase tracking-wider font-extrabold shadow-sm">
                  Best Seller
                </span>
                <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-stone-900 text-[11px] font-semibold">
                  7 Hours
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold drop-shadow">
                    Full Evening Experience
                  </span>
                  <h3 className="text-xl sm:text-2xl text-white drop-shadow font-serif font-semibold">
                    Evening Desert Safari
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-amber-200 block uppercase font-bold drop-shadow">
                    From
                  </span>
                  <span className="text-2xl sm:text-3xl text-white font-bold leading-none drop-shadow">
                    {formatPrice(eveningPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-stone-600 leading-relaxed">
                  The quintessential Dubai safari. Thrilling dune bashing in Red Lahbab sands, traditional
                  Bedouin camp hospitality, live BBQ dinner buffet, and captivating cultural shows.
                </p>
                {/* Inclusions Chips */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-3 pt-1 text-xs text-stone-800">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                      check_circle
                    </span>
                    45-min Dune Bashing
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                      check_circle
                    </span>
                    Sunset Photo Stop
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                      check_circle
                    </span>
                    Camel Trek Experience
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                      check_circle
                    </span>
                    Sandboarding Thrill
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                      check_circle
                    </span>
                    BBQ Buffet &amp; Drinks
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                      check_circle
                    </span>
                    Fire &amp; Belly Dancing
                  </span>
                </div>
              </div>

              {/* Booking Action */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-stone-600 text-xs font-medium">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                    done_all
                  </span>
                  <span>Hotel Transfer Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onViewItinerary('evening-desert-safari')}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:text-[#EA580C] transition-colors"
                  >
                    Itinerary
                  </button>
                  <button
                    type="button"
                    onClick={() => onBookExperience('evening-desert-safari')}
                    className="px-4 py-2.5 rounded-lg bg-stone-900 hover:bg-[#EA580C] text-white text-xs uppercase tracking-wider font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Book Online
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Package 2: Morning Desert Safari */}
          <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-sky-100 shadow-[0_6px_24px_rgba(2,132,199,0.08)] transition-all duration-300 hover:shadow-[0_12px_36px_rgba(2,132,199,0.16)] hover:-translate-y-1">
            {/* Image Container */}
            <div className="relative h-64 w-full overflow-hidden cursor-pointer" onClick={() => onViewItinerary('morning-desert-safari')}>
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDhLKdZSpsI-THhAJCLrcsZPNj-gOSpy8oKdNCLk_Zbr7pJwpG0jCxyp74F-3k7VZkmFRWFZbnaUpoPIH789ox6geGZguTZMFP8P0kNyi2i-PY8OU5uSU2q5W64R-ZCeVSYZ9fkU-5ow2gcgYY9c06-rE3xXfSpfRXLh6fhnP4-y4kRs2vLFL-8TPusZfPXu8neq_IKYLv0jhNER6PQK0Ng-Ijnzn4LL0IgWfLjrxBHGnr51csBfKnYPg')`,
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30"></div>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white text-[11px] uppercase tracking-wider font-extrabold shadow-sm">
                  Morning Escape
                </span>
                <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-stone-900 text-[11px] font-semibold">
                  3 Hours
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-sky-300 font-bold drop-shadow">
                    Crisp Sunrise Vibes
                  </span>
                  <h3 className="text-xl sm:text-2xl text-white drop-shadow font-serif font-semibold">
                    Morning Desert Safari
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-sky-200 block uppercase font-bold drop-shadow">
                    From
                  </span>
                  <span className="text-2xl sm:text-3xl text-white font-bold leading-none drop-shadow">
                    {formatPrice(morningPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-stone-600 leading-relaxed">
                  Ideal for travelers tight on schedule or those wishing to beat the midday warmth.
                  Witness magical first light over pristine windswept crests with coffee and dates.
                </p>
                {/* Inclusions Chips */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-3 pt-1 text-xs text-stone-800">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#0284C7] text-[18px]">
                      check_circle
                    </span>
                    Sunrise Golden Dune Run
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#0284C7] text-[18px]">
                      check_circle
                    </span>
                    Camel Ride Experience
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#0284C7] text-[18px]">
                      check_circle
                    </span>
                    High Dune Sandboarding
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#0284C7] text-[18px]">
                      check_circle
                    </span>
                    Arabic Coffee &amp; Dates
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#0284C7] text-[18px]">
                      check_circle
                    </span>
                    Chilled Refreshments
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#0284C7] text-[18px]">
                      check_circle
                    </span>
                    Pickup 05:00 - 05:30 AM
                  </span>
                </div>
              </div>

              {/* Booking Action */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-stone-600 text-xs font-medium">
                  <span className="material-symbols-outlined text-[#0284C7] text-[18px]">schedule</span>
                  <span>Returns before noon</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onViewItinerary('morning-desert-safari')}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:text-[#0284C7] transition-colors"
                  >
                    Itinerary
                  </button>
                  <button
                    type="button"
                    onClick={() => onBookExperience('morning-desert-safari')}
                    className="px-4 py-2.5 rounded-lg bg-stone-900 hover:bg-[#0284C7] text-white text-xs uppercase tracking-wider font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Book Online
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Package 3: Private Desert Safari VIP */}
          <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-purple-100 shadow-[0_6px_24px_rgba(147,51,234,0.08)] transition-all duration-300 hover:shadow-[0_12px_36px_rgba(147,51,234,0.16)] hover:-translate-y-1">
            {/* Image Container */}
            <div className="relative h-64 w-full overflow-hidden cursor-pointer" onClick={() => onViewItinerary('private-vip-safari')}>
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCx_MJlPnOvvZCL_s2zXsDSpcSN6vCQpxufteJb1bM_5-NVXfaords45N_89yoBdvN9ELQdxN1lG50G0JsJz15rDhvgko9ZnSSFWHFLz3VdIhPKnIo5JIhnAfc740WHCXOxbZNwRfu3CDgTLn1aBsVqF83pWND5oLGG4dooQb8M72CEGZbFObEhwNxsx2ztAsP4DyPYRlOhy_BgPer9UBdAhphRmdqxfei8IwYL5LcIisMgN4wJrtrePw')`,
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30"></div>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-700 to-amber-600 text-white text-[11px] uppercase tracking-wider font-extrabold shadow-sm">
                  VIP Private
                </span>
                <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-stone-900 text-[11px] font-semibold">
                  Bespoke
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold drop-shadow">
                    Royal White Glove Treatment
                  </span>
                  <h3 className="text-xl sm:text-2xl text-white drop-shadow font-serif font-semibold">
                    Private Desert Safari VIP
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-amber-200 block uppercase font-bold drop-shadow">
                    Car Price
                  </span>
                  <span className="text-2xl sm:text-3xl text-white font-bold leading-none drop-shadow">
                    {formatPrice(privatePrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-stone-600 leading-relaxed">
                  An exclusive private Land Cruiser solely reserved for your family or group. Includes
                  dedicated desert guide, custom pickup schedules, VIP camp seating and table-side service.
                </p>
                {/* Inclusions Chips */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-3 pt-1 text-xs text-stone-800">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                      check_circle
                    </span>
                    Dedicated Private 4x4
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                      check_circle
                    </span>
                    Custom Pick-up Timing
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                      check_circle
                    </span>
                    VIP Table Dining Service
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                      check_circle
                    </span>
                    Falcon Photography
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                      check_circle
                    </span>
                    Shisha on Table Included
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                      check_circle
                    </span>
                    Up to 6 Guests Total
                  </span>
                </div>
              </div>

              {/* Booking Action */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-stone-600 text-xs font-medium">
                  <span className="material-symbols-outlined text-purple-600 text-[18px]">
                    hotel_class
                  </span>
                  <span>Elite VIP Category</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onViewItinerary('private-vip-safari')}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:text-purple-700 transition-colors"
                  >
                    Itinerary
                  </button>
                  <button
                    type="button"
                    onClick={() => onBookExperience('private-vip-safari')}
                    className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-stone-900 to-stone-800 hover:from-[#EA580C] hover:to-[#D97706] text-white text-xs uppercase tracking-wider font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Reserve Car
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
