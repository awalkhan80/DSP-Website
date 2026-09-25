import React, { useState, useEffect } from 'react';
import { Currency, Experience } from '../types';
import { CURRENCY_RATES, EXPERIENCES } from '../data/safaris';

interface BookingModalProps {
  initialExperienceId?: string;
  initialDate?: string;
  initialAdults?: number;
  initialChildren?: number;
  initialDuration?: '30m' | '60m';
  initialMachine?: string;
  initialTimeSlot?: string;
  currency: Currency;
  onClose: () => void;
  experiences?: Experience[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  initialExperienceId,
  initialDate,
  initialAdults = 2,
  initialChildren = 0,
  initialDuration = '30m',
  initialMachine,
  initialTimeSlot,
  currency,
  onClose,
  experiences,
}) => {
  const allExperiences = experiences && experiences.length > 0 ? experiences : EXPERIENCES;

  const [selectedExperienceId, setSelectedExperienceId] = useState<string>(
    initialExperienceId || allExperiences[0]?.id || 'evening-desert-safari'
  );
  const [safariDate, setSafariDate] = useState<string>(
    initialDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [adults, setAdults] = useState<number>(initialAdults);
  const [children, setChildren] = useState<number>(initialChildren);
  const [timeSlot, setTimeSlot] = useState<string>(
    initialTimeSlot || '03:30 PM (Golden Sunset)'
  );
  const [transferType, setTransferType] = useState<'shared' | 'private_4x4'>('shared');

  // Adrenaline/Off-Road Specific Customization
  const [duration, setDuration] = useState<'30m' | '60m'>(initialDuration);
  const [quadEngine, setQuadEngine] = useState<'220cc' | '350cc' | '700cc'>('220cc');
  const [buggySeater, setBuggySeater] = useState<'2-seater' | '4-seater'>('2-seater');

  // Popular Add-ons (for standard safaris)
  const [addOnQuad, setAddOnQuad] = useState<boolean>(false);
  const [addOnQuadDuration, setAddOnQuadDuration] = useState<'30m' | '60m'>('30m');
  const [addOnFalcon, setAddOnFalcon] = useState<boolean>(false);
  const [addOnVipTable, setAddOnVipTable] = useState<boolean>(false);

  // Guest Details & Home/Hotel Doorstep Pickup
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [pickupAddressType, setPickupAddressType] = useState<'hotel' | 'home'>('hotel');
  const [hotelOrHomeAddress, setHotelOrHomeAddress] = useState<string>('');
  const [roomOrVillaNumber, setRoomOrVillaNumber] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  const [step, setStep] = useState<'customize' | 'details' | 'confirmation'>('customize');
  const [bookingRef, setBookingRef] = useState<string>('');

  // Sync initial machine props if provided
  useEffect(() => {
    if (initialMachine) {
      if (initialMachine.includes('350cc')) setQuadEngine('350cc');
      else if (initialMachine.includes('700cc')) setQuadEngine('700cc');
      else if (initialMachine.includes('220cc')) setQuadEngine('220cc');

      if (initialMachine.includes('4-seater') || initialMachine.includes('4-Seater')) {
        setBuggySeater('4-seater');
      } else if (initialMachine.includes('2-seater') || initialMachine.includes('2-Seater')) {
        setBuggySeater('2-seater');
      }
    }
  }, [initialMachine]);

  const currentExperience: Experience =
    allExperiences.find((e) => e.id === selectedExperienceId) || allExperiences[0] || EXPERIENCES[0];

  const isQuadTour =
    currentExperience.id === 'quad-bike-atv' ||
    currentExperience.id === 'quad-bike-atv-rental' ||
    currentExperience.title.toLowerCase().includes('quad');

  const isBuggyTour =
    currentExperience.id === 'can-am-buggy-safari' ||
    currentExperience.id === 'can-am-dune-buggy' ||
    currentExperience.title.toLowerCase().includes('buggy');

  // Dynamic Price Calculation
  let basePricePerAdult = currentExperience.priceAED;

  if (isQuadTour) {
    if (duration === '30m') {
      if (quadEngine === '220cc') basePricePerAdult = currentExperience.priceAED;
      else if (quadEngine === '350cc') basePricePerAdult = currentExperience.priceAED + 70;
      else if (quadEngine === '700cc') basePricePerAdult = currentExperience.priceAED + 200;
    } else {
      // 1 Hour (60 Mins)
      const oneHrBase = Math.round(currentExperience.priceAED * 1.67);
      if (quadEngine === '220cc') basePricePerAdult = oneHrBase;
      else if (quadEngine === '350cc') basePricePerAdult = oneHrBase + 100;
      else if (quadEngine === '700cc') basePricePerAdult = oneHrBase + 300;
    }
  } else if (isBuggyTour) {
    if (duration === '30m') {
      const halfHrBase = Math.round(currentExperience.priceAED * 0.7);
      basePricePerAdult = buggySeater === '2-seater' ? halfHrBase : halfHrBase + 350;
    } else {
      // 1 Hour (60 Mins)
      basePricePerAdult =
        buggySeater === '2-seater' ? currentExperience.priceAED : currentExperience.priceAED + 500;
    }
  }

  const basePricePerChild =
    isQuadTour || isBuggyTour
      ? basePricePerAdult
      : Math.round(currentExperience.priceAED * 0.7); // 30% discount for regular safaris

  let totalAED = isBuggyTour
    ? basePricePerAdult // Charged per buggy unit
    : adults * basePricePerAdult + children * basePricePerChild;

  // Private 4x4 surcharge if selected (AED 350 flat)
  if (
    transferType === 'private_4x4' &&
    currentExperience.id !== 'private-vip-safari' &&
    !isBuggyTour
  ) {
    totalAED += 350;
  }

  // Add-ons calculation
  if (addOnQuad) {
    const quadAddonRate = addOnQuadDuration === '30m' ? 150 : 250;
    totalAED += quadAddonRate * adults;
  }
  if (addOnFalcon) totalAED += 50 * (adults + children);
  if (addOnVipTable) totalAED += 200;

  const rateInfo = CURRENCY_RATES[currency];
  const convertedTotal = Math.round(totalAED * rateInfo.rate);

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const randomRef = 'PHX-' + Math.floor(100000 + Math.random() * 900000);
    setBookingRef(randomRef);
    setStep('confirmation');
  };

  const handleSendToWhatsApp = () => {
    const durationText = isQuadTour
      ? `• Duration: ${duration === '30m' ? '30 Minutes' : '1 Hour (60 Mins)'} (${quadEngine} Raptor ATV)\n`
      : isBuggyTour
      ? `• Duration: ${duration === '30m' ? '30 Minutes' : '1 Hour (60 Mins)'} (Can-Am ${buggySeater})\n`
      : addOnQuad
      ? `• Add-On Quad: ${addOnQuadDuration === '30m' ? '30 Mins' : '1 Hour'}\n`
      : '';

    const text = encodeURIComponent(
      `Hello Phoenix Desert Safari Concierge!\n\nI have confirmed booking *${bookingRef}* for:\n• Experience: ${currentExperience.title}\n• Date: ${safariDate}\n• Time Slot: ${timeSlot}\n${durationText}• Guests: ${adults} Adults${children > 0 ? `, ${children} Children` : ''}\n• Doorstep Pickup: ${pickupAddressType === 'home' ? 'Home Residence' : 'Hotel'}: ${hotelOrHomeAddress || 'Pending Address'} ${roomOrVillaNumber ? `(${roomOrVillaNumber})` : ''}\n• Guest Name: ${guestName || 'VIP Traveler'}\n• Mobile: ${guestPhone}\n• Total Amount: AED ${totalAED} (${currency} ${convertedTotal})\n\nPlease send me the driver pickup confirmation.`
    );
    window.open(`https://wa.me/971561505270?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] rounded-2xl sm:rounded-3xl border border-amber-200/80 shadow-2xl max-w-2xl w-full overflow-hidden text-stone-900 relative">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#D97706] via-[#EA580C] to-[#C2410C] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">explore</span>
            <div>
              <h3 className="font-serif font-bold text-lg leading-tight">
                {step === 'confirmation' ? 'Booking Confirmed!' : 'Book Desert Expedition'}
              </h3>
              <span className="text-[11px] text-amber-200 uppercase tracking-widest font-semibold flex items-center gap-1">
                <span>Free Home &amp; Hotel Doorstep Pickup</span>
                <span>•</span>
                <span>DTCM Licensed</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* STEP 1: CUSTOMIZE */}
        {step === 'customize' && (
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Experience Selector Card */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-amber-100 shadow-xs">
              <img
                src={currentExperience.image}
                alt={currentExperience.title}
                className="w-full sm:w-28 h-24 object-cover rounded-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <label className="text-[10px] text-[#C2410C] font-bold uppercase tracking-wider block">
                  Select Experience
                </label>
                <select
                  value={selectedExperienceId}
                  onChange={(e) => setSelectedExperienceId(e.target.value)}
                  className="w-full text-base font-bold text-stone-900 bg-transparent border-b border-amber-200 py-1 outline-none cursor-pointer focus:border-[#EA580C]"
                >
                  {allExperiences.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.title} - AED {exp.priceAED} ({exp.duration})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                  {currentExperience.description}
                </p>
              </div>
            </div>

            {/* OFF-ROAD DURATION & MACHINE OPTIONS (For Quad & Buggy) */}
            {(isQuadTour || isBuggyTour) && (
              <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#EA580C]">
                      timer
                    </span>
                    Select Riding Duration
                  </span>
                  <span className="text-xs text-[#EA580C] font-bold">
                    {duration === '30m' ? '30 Minutes Session' : '1 Hour (60 Minutes) Session'}
                  </span>
                </div>

                {/* 30m vs 1hr Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDuration('30m')}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                      duration === '30m'
                        ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-md'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    <span className="text-sm">30 Minutes</span>
                    <span className={`text-[10px] ${duration === '30m' ? 'text-amber-100' : 'text-stone-500'}`}>
                      Standard Desert Sprint
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuration('60m')}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                      duration === '60m'
                        ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-md'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    <span className="text-sm">1 Hour (60 Mins)</span>
                    <span className={`text-[10px] ${duration === '60m' ? 'text-amber-100' : 'text-stone-500'}`}>
                      Deep Red Dune Expedition
                    </span>
                  </button>
                </div>

                {/* Machine Configuration Tier */}
                {isQuadTour && (
                  <div className="pt-2 border-t border-amber-200/70">
                    <label className="text-[11px] font-bold text-stone-700 block mb-1.5">
                      Quad Engine Capacity (Raptor ATV):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['220cc', '350cc', '700cc'] as const).map((cc) => (
                        <button
                          key={cc}
                          type="button"
                          onClick={() => setQuadEngine(cc)}
                          className={`py-2 px-2 text-xs rounded-lg font-bold transition-all cursor-pointer border ${
                            quadEngine === cc
                              ? 'bg-[#8D4B00] text-white border-[#8D4B00] shadow-xs'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-amber-50'
                          }`}
                        >
                          {cc} {cc === '700cc' ? 'Raptor' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isBuggyTour && (
                  <div className="pt-2 border-t border-amber-200/70">
                    <label className="text-[11px] font-bold text-stone-700 block mb-1.5">
                      Can-Am Buggy Configuration:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['2-seater', '4-seater'] as const).map((seat) => (
                        <button
                          key={seat}
                          type="button"
                          onClick={() => setBuggySeater(seat)}
                          className={`py-2 px-2 text-xs rounded-lg font-bold transition-all cursor-pointer border ${
                            buggySeater === seat
                              ? 'bg-[#8D4B00] text-white border-[#8D4B00] shadow-xs'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-amber-50'
                          }`}
                        >
                          Can-Am {seat.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <label className="text-xs font-bold text-stone-700 block mb-1">Safari Date</label>
                <input
                  type="date"
                  value={safariDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSafariDate(e.target.value)}
                  className="w-full text-sm font-semibold text-stone-900 outline-none cursor-pointer"
                />
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <label className="text-xs font-bold text-stone-700 block mb-1">Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-stone-900 outline-none bg-transparent cursor-pointer"
                >
                  {isQuadTour || isBuggyTour ? (
                    <>
                      <option value="07:30 AM (Sunrise Desert Run)">07:30 AM (Sunrise Desert Run)</option>
                      <option value="09:00 AM (Cool Morning)">09:00 AM (Cool Morning)</option>
                      <option value="10:30 AM (Mid-Morning Track)">10:30 AM (Mid-Morning Track)</option>
                      <option value="03:30 PM (Afternoon Dunes)">03:30 PM (Afternoon Dunes)</option>
                      <option value="04:30 PM (Golden Sunset Slot)">04:30 PM (Golden Sunset Slot)</option>
                      <option value="05:30 PM (Twilight &amp; Stargazing)">05:30 PM (Twilight &amp; Stargazing)</option>
                    </>
                  ) : (
                    <>
                      <option value="03:00 PM (Afternoon / Golden Sunset)">
                        03:00 PM (Afternoon / Golden Sunset)
                      </option>
                      <option value="05:00 AM (Crisp Sunrise Run)">
                        05:00 AM (Crisp Sunrise Run)
                      </option>
                      <option value="08:30 AM (Morning City / Safari Excursion)">
                        08:30 AM (Morning City / Safari Excursion)
                      </option>
                      <option value="VIP Custom Convoy Timing">VIP Custom Convoy Timing</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Guests Counter */}
            {!isBuggyTour && (
              <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-stone-800 block">Party Size</span>
                  <span className="text-xs text-stone-500">
                    {isQuadTour
                      ? 'Each rider gets their own dedicated quad bike machine.'
                      : 'Children under 3 ride free. Children 3-10 receive 30% discount.'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {/* Adults */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-700">
                      {isQuadTour ? 'Riders:' : 'Adults:'}
                    </span>
                    <div className="flex items-center border border-amber-200 rounded-lg overflow-hidden bg-amber-50/50">
                      <button
                        type="button"
                        onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                        className="px-2.5 py-1 hover:bg-amber-100 text-stone-800 font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-bold text-xs">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults((prev) => prev + 1)}
                        className="px-2.5 py-1 hover:bg-amber-100 text-stone-800 font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Kids (for standard tours) */}
                  {!isQuadTour && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-700">Kids:</span>
                      <div className="flex items-center border border-amber-200 rounded-lg overflow-hidden bg-amber-50/50">
                        <button
                          type="button"
                          onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                          className="px-2.5 py-1 hover:bg-amber-100 text-stone-800 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-bold text-xs">{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren((prev) => prev + 1)}
                          className="px-2.5 py-1 hover:bg-amber-100 text-stone-800 font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transfer Mode - Doorstep Home or Hotel Pickup */}
            {currentExperience.id !== 'private-vip-safari' && !isBuggyTour && (
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 block">
                    Doorstep Pickup Mode (Home or Hotel)
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Direct Pickup from any Home / Hotel
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransferType('shared')}
                    className={`p-3 rounded-lg border text-left flex items-start gap-2 cursor-pointer transition-colors ${
                      transferType === 'shared'
                        ? 'border-[#EA580C] bg-orange-50/40 text-stone-900'
                        : 'border-stone-200 hover:border-stone-300 text-stone-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#EA580C]">
                      directions_car
                    </span>
                    <div>
                      <span className="text-xs font-bold block">Shared 4x4 Home/Hotel Pickup</span>
                      <span className="text-[11px] text-stone-500">
                        Included in package (Door-to-door)
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransferType('private_4x4')}
                    className={`p-3 rounded-lg border text-left flex items-start gap-2 cursor-pointer transition-colors ${
                      transferType === 'private_4x4'
                        ? 'border-[#EA580C] bg-orange-50/40 text-stone-900'
                        : 'border-stone-200 hover:border-stone-300 text-stone-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#EA580C]">
                      workspace_premium
                    </span>
                    <div>
                      <span className="text-xs font-bold block">Private 4x4 Exclusive Car</span>
                      <span className="text-[11px] text-stone-500">+AED 350 (Sole Use for Your Party)</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Optional Add-ons for standard safaris */}
            {!isQuadTour && !isBuggyTour && (
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                <span className="text-xs font-bold text-stone-800 block">Popular Add-Ons</span>
                <div className="space-y-2.5">
                  {/* Quad Bike Addon with Duration Selector */}
                  <div className="p-2.5 rounded-lg border border-stone-100 hover:bg-stone-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addOnQuad}
                          onChange={(e) => setAddOnQuad(e.target.checked)}
                          className="accent-[#EA580C] w-4 h-4 rounded cursor-pointer"
                        />
                        <span className="text-xs font-bold text-stone-800">
                          Self-Drive Quad Bike ATV ({addOnQuadDuration === '30m' ? '30 Mins' : '1 Hour'})
                        </span>
                      </label>
                      <span className="text-xs font-bold text-[#EA580C]">
                        +{addOnQuadDuration === '30m' ? 'AED 150' : 'AED 250'} / person
                      </span>
                    </div>
                    {addOnQuad && (
                      <div className="mt-2 pl-6 flex items-center gap-2">
                        <span className="text-[11px] text-stone-500 font-semibold">Slot:</span>
                        <button
                          type="button"
                          onClick={() => setAddOnQuadDuration('30m')}
                          className={`px-2.5 py-1 text-[11px] rounded font-bold cursor-pointer ${
                            addOnQuadDuration === '30m'
                              ? 'bg-[#EA580C] text-white'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          30 Minutes (AED 150)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddOnQuadDuration('60m')}
                          className={`px-2.5 py-1 text-[11px] rounded font-bold cursor-pointer ${
                            addOnQuadDuration === '60m'
                              ? 'bg-[#EA580C] text-white'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          1 Hour (AED 250)
                        </button>
                      </div>
                    )}
                  </div>

                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addOnFalcon}
                        onChange={(e) => setAddOnFalcon(e.target.checked)}
                        className="accent-[#EA580C] w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-stone-800">
                        VIP Hunting Falcon Photo Shoot
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#EA580C]">+AED 50 / person</span>
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addOnVipTable}
                        onChange={(e) => setAddOnVipTable(e.target.checked)}
                        className="accent-[#EA580C] w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-stone-800">
                        Reserved VIP Majlis Table &amp; Table-Side BBQ Service
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#EA580C]">+AED 200 / table</span>
                  </label>
                </div>
              </div>
            )}

            {/* Total Price Bar & Next Button */}
            <div className="pt-2 flex items-center justify-between border-t border-amber-200">
              <div>
                <span className="text-xs text-stone-500 uppercase tracking-wider block font-bold">
                  Estimated Total
                </span>
                <span className="text-2xl font-bold font-serif text-[#EA580C]">
                  {currency} {convertedTotal.toLocaleString()}{' '}
                  <span className="text-xs text-stone-500 font-sans font-normal">
                    (AED {totalAED})
                  </span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#D97706] hover:from-[#C2410C] hover:to-[#EA580C] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 cursor-pointer transition-all active:scale-98"
              >
                Continue to Pickup Details →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GUEST & DOORSTEP PICKUP DETAILS */}
        {step === 'details' && (
          <form onSubmit={handleConfirmBooking} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Summary Bar */}
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-900 block">
                  {currentExperience.title}
                </span>
                <span className="text-[11px] text-stone-600">
                  {safariDate} • {timeSlot}
                  {isQuadTour && ` • ${duration === '30m' ? '30 Min' : '1 Hr'} ${quadEngine}`}
                  {isBuggyTour && ` • ${duration === '30m' ? '30 Min' : '1 Hr'} ${buggySeater}`}
                  {' • '}
                  Total: AED {totalAED} ({currency} {convertedTotal})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep('customize')}
                className="text-xs text-[#EA580C] font-bold underline cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#EA580C] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  WhatsApp Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +971 50 123 4567"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#EA580C] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. traveler@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#EA580C] outline-none"
                />
              </div>

              {/* Pickup Type: Hotel or Home */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Pickup Location Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPickupAddressType('hotel')}
                    className={`py-2 px-2 text-xs rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer border ${
                      pickupAddressType === 'hotel'
                        ? 'bg-[#EA580C] text-white border-[#EA580C]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">apartment</span>
                    <span>Hotel / Resort</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickupAddressType('home')}
                    className={`py-2 px-2 text-xs rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer border ${
                      pickupAddressType === 'home'
                        ? 'bg-[#EA580C] text-white border-[#EA580C]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">home</span>
                    <span>Home / Villa</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Doorstep Address Input */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  {pickupAddressType === 'hotel'
                    ? 'Hotel / Resort Name in Dubai or Sharjah'
                    : 'Home / Villa / Residence Address in Dubai or Sharjah'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    pickupAddressType === 'hotel'
                      ? 'e.g. Atlantis The Palm / Address Downtown'
                      : 'e.g. Villa 24, Arabian Ranches / Downtown Dubai Apt'
                  }
                  value={hotelOrHomeAddress}
                  onChange={(e) => setHotelOrHomeAddress(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#EA580C] outline-none"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  ✓ Doorstep pickup &amp; drop directly from your home address or hotel lobby.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  {pickupAddressType === 'hotel' ? 'Room / Suite #' : 'Villa / Flat #'} (Optional)
                </label>
                <input
                  type="text"
                  placeholder={pickupAddressType === 'hotel' ? 'e.g. Rm 1402' : 'e.g. Villa 12B'}
                  value={roomOrVillaNumber}
                  onChange={(e) => setRoomOrVillaNumber(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#EA580C] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Dietary / Special Requests (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Vegetarian meal preference, baby booster seat, birthday cake surprise"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full text-sm p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#EA580C] outline-none"
              />
            </div>

            {/* Zero Advance Payment Guarantee */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">
                verified_user
              </span>
              <div className="text-xs text-emerald-950">
                <span className="font-bold block">Zero Upfront Deposit Required</span>
                <span>
                  Pay on pickup via Cash (AED, USD, EUR, GBP) or Credit/Debit Card directly to your safari captain.
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-amber-200">
              <button
                type="button"
                onClick={() => setStep('customize')}
                className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#D97706] hover:brightness-105 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 cursor-pointer transition-all active:scale-98 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Confirm &amp; Generate Voucher</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: CONFIRMATION & VOUCHER */}
        {step === 'confirmation' && (
          <div className="p-6 space-y-5 text-center max-h-[80vh] overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-bold">
                Booking Reference: {bookingRef}
              </span>
              <h4 className="text-2xl font-serif font-bold text-stone-900 mt-2">
                Your Safari is Reserved!
              </h4>
              <p className="text-xs text-stone-600 max-w-md mx-auto mt-1">
                A confirmation has been logged. Our operations captain will reach out via WhatsApp 2
                hours prior to pickup with the exact driver name and vehicle license plate.
              </p>
            </div>

            {/* Voucher Details Card */}
            <div className="bg-white p-4 rounded-xl border border-amber-200 text-left text-xs space-y-2 font-medium">
              <div className="flex justify-between border-b border-stone-100 pb-1.5">
                <span className="text-stone-500">Experience:</span>
                <span className="font-bold text-stone-900">{currentExperience.title}</span>
              </div>
              {(isQuadTour || isBuggyTour) && (
                <div className="flex justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-stone-500">Duration &amp; Machine:</span>
                  <span className="font-bold text-[#EA580C]">
                    {duration === '30m' ? '30 Minutes' : '1 Hour (60 Mins)'}{' '}
                    {isQuadTour ? `(${quadEngine} Raptor)` : `(Can-Am ${buggySeater})`}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-b border-stone-100 pb-1.5">
                <span className="text-stone-500">Date &amp; Time:</span>
                <span className="font-bold text-stone-900">
                  {safariDate} • {timeSlot}
                </span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-1.5">
                <span className="text-stone-500">Doorstep Pickup:</span>
                <span className="font-bold text-stone-900">
                  {pickupAddressType === 'home' ? 'Home' : 'Hotel'}: {hotelOrHomeAddress || 'Pending Address'}{' '}
                  {roomOrVillaNumber ? `(${roomOrVillaNumber})` : ''}
                </span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-1.5">
                <span className="text-stone-500">Guest Name:</span>
                <span className="font-bold text-stone-900">{guestName || 'VIP Traveler'}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold">
                <span className="text-stone-900">Total Due on Pickup:</span>
                <span className="text-[#EA580C]">
                  {currency} {convertedTotal.toLocaleString()} (AED {totalAED})
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSendToWhatsApp}
                className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span>Send Booking to WhatsApp Concierge</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Close &amp; Return to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
