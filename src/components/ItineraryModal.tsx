import React from 'react';
import { Currency, Experience } from '../types';
import { CURRENCY_RATES, EXPERIENCES } from '../data/safaris';

interface ItineraryModalProps {
  experienceId: string;
  currency: Currency;
  onClose: () => void;
  onBookNow: (experienceId: string) => void;
  experiences?: Experience[];
}

export const ItineraryModal: React.FC<ItineraryModalProps> = ({
  experienceId,
  currency,
  onClose,
  onBookNow,
  experiences,
}) => {
  const allExperiences = experiences && experiences.length > 0 ? experiences : EXPERIENCES;
  const experience: Experience =
    allExperiences.find((e) => e.id === experienceId) || allExperiences[0] || EXPERIENCES[0];

  const rateInfo = CURRENCY_RATES[currency];
  const converted = Math.round(experience.priceAED * rateInfo.rate);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] rounded-2xl sm:rounded-3xl border border-amber-200/80 shadow-2xl max-w-2xl w-full overflow-hidden text-stone-900 relative">
        {/* Banner with Image */}
        <div className="relative h-60 w-full overflow-hidden">
          <img
            src={experience.image}
            alt={experience.altText}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          {/* Title info */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-300 font-bold drop-shadow">
                {experience.subtitle}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white drop-shadow">
                {experience.title}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-amber-200 block drop-shadow">
                Rate From
              </span>
              <span className="text-xl sm:text-2xl font-bold text-white drop-shadow">
                {currency} {converted.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Quick Specs Pill Row */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 bg-white border border-stone-200 rounded-full font-semibold text-stone-800 flex items-center gap-1.5 shadow-2xs">
              <span className="material-symbols-outlined text-[16px] text-[#EA580C]">schedule</span>
              Duration: {experience.duration}
            </span>
            {experience.vehicleType && (
              <span className="px-3 py-1 bg-white border border-stone-200 rounded-full font-semibold text-stone-800 flex items-center gap-1.5 shadow-2xs">
                <span className="material-symbols-outlined text-[16px] text-[#EA580C]">
                  directions_car
                </span>
                Vehicle: {experience.vehicleType}
              </span>
            )}
            <span className="px-3 py-1 bg-white border border-stone-200 rounded-full font-semibold text-stone-800 flex items-center gap-1.5 shadow-2xs">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">done_all</span>
              {experience.hotelPickup
                ? 'Home & Hotel Pick & Drop: Included'
                : 'Direct Meeting Point (Free) • Private 4x4 Available'}
            </span>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              Overview
            </h4>
            <p className="text-sm text-stone-700 leading-relaxed">{experience.description}</p>
          </div>

          {/* Inclusions Highlights */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Key Inclusions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-800">
              {experience.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#EA580C] text-[18px]">
                    check_circle
                  </span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Timeline Steps */}
          {experience.itinerary && experience.itinerary.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                Expedition Itinerary Timeline
              </h4>
              <div className="space-y-4 border-l-2 border-amber-200 pl-4 ml-2">
                {experience.itinerary.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[#EA580C] border-2 border-[#FAF6F0]"></div>
                    <span className="text-[11px] font-bold text-[#EA580C] block">{step.time}</span>
                    <h5 className="text-sm font-bold text-stone-900">{step.title}</h5>
                    <p className="text-xs text-stone-600 mt-0.5">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Advice */}
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-stone-700 space-y-1">
            <h5 className="font-bold text-amber-950 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#EA580C]">info</span>
              Good to Know Before You Go
            </h5>
            <p>
              • <strong>Attire:</strong> Comfortable loose casual clothes, sandals or sneakers, and
              sunglasses.
            </p>
            <p>
              • <strong>Safety:</strong> Dune bashing is not recommended for pregnant women or
              guests with severe back/neck conditions (gentle cruising available upon request).
            </p>
            <p>
              • <strong>Cancellation:</strong> 100% free cancellation or rescheduling up to 12 hours
              prior to departure.
            </p>
          </div>
        </div>

        {/* Modal Bottom CTA */}
        <div className="p-4 sm:p-6 bg-white border-t border-amber-200 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Rate</span>
            <span className="text-xl font-bold font-serif text-[#EA580C]">
              {currency} {converted.toLocaleString()}{' '}
              <span className="text-xs text-stone-500 font-sans font-normal">
                (AED {experience.priceAED})
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onBookNow(experience.id);
              }}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#EA580C] to-[#D97706] hover:from-[#C2410C] hover:to-[#EA580C] text-white text-xs uppercase tracking-wider font-bold shadow-md shadow-orange-500/20 cursor-pointer"
            >
              Book This Tour Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
