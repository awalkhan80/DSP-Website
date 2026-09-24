import React from 'react';

interface DirectOperatorSectionProps {
  onOpenWhatsApp: () => void;
}

export const DirectOperatorSection: React.FC<DirectOperatorSectionProps> = ({ onOpenWhatsApp }) => {
  return (
    <section id="direct-advantage" className="w-full py-16 bg-[#FAF6F0] scroll-mt-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF3EA] to-[#F5ECE1] border border-amber-200/80 rounded-3xl p-6 sm:p-10 shadow-[0_12px_40px_rgba(217,119,6,0.08)] relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Value Proposition */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[11px] uppercase tracking-widest text-[#C2410C] font-bold">
                Direct Operator Advantage
              </span>
              <h2 className="text-3xl sm:text-4xl text-stone-900 font-semibold font-serif">
                Why Book Directly With The Phoenix
              </h2>
              <p className="text-base text-stone-600">
                Skip intermediary platform commissions and enjoy guaranteed best rates, flexible
                rescheduling, and direct access to your designated safari convoy marshal.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#EA580C] text-[24px]">
                    price_check
                  </span>
                  <div>
                    <h4 className="text-sm text-stone-900 font-bold">Best Rate Guarantee</h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Direct local pricing with zero hidden convenience fees.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#059669] text-[24px]">
                    published_with_changes
                  </span>
                  <div>
                    <h4 className="text-sm text-stone-900 font-bold">Free Date Modification</h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Easily reschedule your safari up to 12 hours prior.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#0284C7] text-[24px]">
                    headset_mic
                  </span>
                  <div>
                    <h4 className="text-sm text-stone-900 font-bold">24/7 Dedicated Concierge</h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Immediate WhatsApp response for hotel pickup coordination.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#EA580C] text-[24px]">
                    verified
                  </span>
                  <div>
                    <h4 className="text-sm text-stone-900 font-bold">Government Approved</h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Fully licensed by Dubai Economy and Tourism (DET).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Office Information & Quick Actions */}
            <div className="lg:col-span-5 bg-white/90 backdrop-blur-xl border border-amber-200/90 p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#C2410C] font-bold">
                  Headquarters &amp; Dispatch
                </span>
                <h3 className="text-xl sm:text-2xl text-stone-900 font-bold mt-1 font-serif">
                  Desert Safari Dubai - The Phoenix
                </h3>
              </div>

              <div className="space-y-2.5 text-xs text-stone-700">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#EA580C] shrink-0 text-[20px]">
                    apartment
                  </span>
                  <span className="leading-snug">
                    DAMAC XL Tower, Business Bay, Dubai, United Arab Emirates
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 shrink-0 text-[20px]">
                    schedule
                  </span>
                  <span className="text-stone-900 font-bold">Open 24 Hours • 7 Days a Week</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#EA580C] shrink-0 text-[20px]">
                    call
                  </span>
                  <a
                    href="tel:0561505270"
                    className="text-[#EA580C] font-extrabold text-sm hover:underline"
                  >
                    Direct Line: 056 150 5270
                  </a>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#D97706] text-white text-xs uppercase tracking-wider font-bold text-center flex items-center justify-center gap-2 hover:brightness-105 shadow-md shadow-orange-500/20 transition-all"
                  href="tel:0561505270"
                >
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  <span>Call Concierge</span>
                </a>
                <button
                  type="button"
                  onClick={onOpenWhatsApp}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-wider font-bold text-center flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>WhatsApp Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
