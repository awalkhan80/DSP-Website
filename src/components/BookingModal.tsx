import React, { useState, useEffect } from 'react';
import { Currency, Experience, OffRoadPricingConfig } from '../types';
import {
  CURRENCY_RATES,
  DEFAULT_OFF_ROAD_PRICING,
  EXPERIENCES,
  calculatePrivateVehiclePrice,
  getBuggyPrice,
  getQuadBikePrice,
} from '../data/safaris';
import { WhatsAppLogo } from './icons/WhatsAppLogo';

interface BookingModalProps {
  initialExperienceId?: string;
  initialDate?: string;
  initialAdults?: number;
  initialChildren?: number;
  initialDuration?: '30m' | '60m';
  initialMachine?: string;
  initialTimeSlot?: string;
  initialQuadRider?: 'single' | 'double';
  initialQuadTerrain?: 'inside_circle' | 'open_desert';
  initialQuadEngine?: '220cc' | '350cc';
  initialBuggyModel?: 'polaris' | 'canam';
  initialBuggySeater?: '2-seater' | '4-seater';
  currency: Currency;
  onClose: () => void;
  experiences?: Experience[];
  offRoadPricing?: OffRoadPricingConfig;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  initialExperienceId,
  initialDate,
  initialAdults = 2,
  initialChildren = 0,
  initialDuration = '30m',
  initialMachine,
  initialTimeSlot,
  initialQuadRider = 'single',
  initialQuadTerrain = 'open_desert',
  initialQuadEngine = '220cc',
  initialBuggyModel = 'canam',
  initialBuggySeater = '2-seater',
  currency,
  onClose,
  experiences,
  offRoadPricing = DEFAULT_OFF_ROAD_PRICING,
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
  const [transferType, setTransferType] = useState<'shared' | 'private_4x4' | 'meeting_point'>('shared');

  // Adrenaline / Off-Road Vehicle Configuration
  const [duration, setDuration] = useState<'30m' | '60m'>(initialDuration);
  
  // Quad Bike Specific States (Whole Vehicle)
  const [quadEngine, setQuadEngine] = useState<'220cc' | '350cc'>(initialQuadEngine);
  const [quadRider, setQuadRider] = useState<'single' | 'double'>(initialQuadRider);
  const [quadTerrain, setQuadTerrain] = useState<'inside_circle' | 'open_desert'>(initialQuadTerrain);
  const [quadQuantity, setQuadQuantity] = useState<number>(1);

  // Buggy Specific States (Whole Vehicle)
  const [buggyModel, setBuggyModel] = useState<'polaris' | 'canam'>(initialBuggyModel);
  const [buggySeater, setBuggySeater] = useState<'2-seater' | '4-seater'>(initialBuggySeater);
  const [buggyQuantity, setBuggyQuantity] = useState<number>(1);

  // Popular Add-ons (Exclusively for Desert Safaris)
  const [addOnQuad, setAddOnQuad] = useState<boolean>(false);
  const [addOnQuadDuration, setAddOnQuadDuration] = useState<'30m' | '60m'>('30m');
  const [addOnQuadTerrain, setAddOnQuadTerrain] = useState<'inside_circle' | 'open_desert'>('open_desert');
  
  const [addOnBuggy, setAddOnBuggy] = useState<boolean>(false);
  const [addOnBuggyDuration, setAddOnBuggyDuration] = useState<'30m' | '60m'>('30m');

  const [addOnFalcon, setAddOnFalcon] = useState<boolean>(false);
  const [addOnVipTable, setAddOnVipTable] = useState<boolean>(false);

  // Guest Details & Doorstep Pickup / Meeting Point
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [pickupAddressType, setPickupAddressType] = useState<'hotel' | 'home'>('hotel');
  const [hotelOrHomeAddress, setHotelOrHomeAddress] = useState<string>('');
  const [roomOrVillaNumber, setRoomOrVillaNumber] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  const [step, setStep] = useState<'customize' | 'details' | 'confirmation'>('customize');
  const [bookingRef, setBookingRef] = useState<string>('');

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

  const isDesertSafariTour =
    (currentExperience.category === 'desert-safaris' ||
      currentExperience.id.includes('desert-safari') ||
      currentExperience.id === 'evening-desert-safari' ||
      currentExperience.id === 'morning-desert-safari' ||
      currentExperience.id === 'overnight-desert-safari' ||
      currentExperience.id === 'private-desert-safari' ||
      currentExperience.id === 'private-vip-safari') &&
    !isQuadTour &&
    !isBuggyTour &&
    currentExperience.category !== 'city-tours';

  // Enforce meeting point vs private transfer for quad & buggy, and cap add-on durations on shared safari
  useEffect(() => {
    if (isQuadTour || isBuggyTour) {
      if (transferType === 'shared') {
        setTransferType('meeting_point');
      }
    } else {
      if (transferType === 'meeting_point') {
        setTransferType('shared');
      }
    }

    // When sharing desert safari is selected, remove 1-hour quad/buggy options
    if (transferType === 'shared') {
      if (addOnQuadDuration === '60m') setAddOnQuadDuration('30m');
      if (addOnBuggyDuration === '60m') setAddOnBuggyDuration('30m');
    }
  }, [selectedExperienceId, isQuadTour, isBuggyTour, transferType, addOnQuadDuration, addOnBuggyDuration]);

  // Sync initial machine props if provided
  useEffect(() => {
    if (initialMachine) {
      if (initialMachine.includes('350cc')) setQuadEngine('350cc');
      else if (initialMachine.includes('220cc')) setQuadEngine('220cc');

      if (initialMachine.toLowerCase().includes('double')) setQuadRider('double');
      else if (initialMachine.toLowerCase().includes('single')) setQuadRider('single');

      if (initialMachine.toLowerCase().includes('circle')) setQuadTerrain('inside_circle');
      else if (initialMachine.toLowerCase().includes('open')) setQuadTerrain('open_desert');

      if (initialMachine.toLowerCase().includes('polaris')) setBuggyModel('polaris');
      else if (initialMachine.toLowerCase().includes('can-am') || initialMachine.toLowerCase().includes('canam')) setBuggyModel('canam');

      if (initialMachine.includes('4-seater') || initialMachine.includes('4-Seater')) {
        setBuggySeater('4-seater');
      } else if (initialMachine.includes('2-seater') || initialMachine.includes('2-Seater')) {
        setBuggySeater('2-seater');
      }
    }
  }, [initialMachine]);

  // Passenger count for private vehicle calculation
  const totalPax = isQuadTour
    ? Math.max(1, quadQuantity * (quadRider === 'single' ? 1 : 2))
    : isBuggyTour
    ? Math.max(1, buggyQuantity * (buggySeater === '2-seater' ? 2 : 4))
    : Math.max(1, adults + children);

  const privateVehicleCost = calculatePrivateVehiclePrice(totalPax);

  // Dynamic Price Calculation (Per Whole Vehicle for Quad & Buggy)
  let totalAED = 0;
  let vehicleUnitPrice = 0;

  if (isQuadTour) {
    vehicleUnitPrice = getQuadBikePrice(
      offRoadPricing,
      quadEngine,
      quadRider,
      quadTerrain,
      duration
    );
    totalAED = vehicleUnitPrice * quadQuantity;
  } else if (isBuggyTour) {
    vehicleUnitPrice = getBuggyPrice(
      offRoadPricing,
      buggyModel,
      buggySeater,
      duration
    );
    totalAED = vehicleUnitPrice * buggyQuantity;
  } else if (currentExperience.id === 'miracle-garden-global-village-combo') {
    // Miracle Garden + Global Village: 500 AED Private Car for 1-2 pax (+50 AED/pax after 2) + 130 AED/Person Combo Tickets
    const totalGuests = Math.max(1, adults + children);
    const privateCarBase = calculatePrivateVehiclePrice(totalGuests);
    const ticketsTotal = totalGuests * 130;
    totalAED = privateCarBase + ticketsTotal;
  } else {
    // Regular Safari or City Excursion
    const basePricePerAdult = currentExperience.priceAED;
    const basePricePerChild = Math.round(currentExperience.priceAED * 0.7);
    totalAED = adults * basePricePerAdult + children * basePricePerChild;
  }

  // Private 4x4 surcharge if selected (AED 500 for 1-2 pax, +AED 50 per extra pax after 2 pax)
  if (
    transferType === 'private_4x4' &&
    currentExperience.id !== 'private-vip-safari' &&
    currentExperience.id !== 'miracle-garden-global-village-combo'
  ) {
    totalAED += privateVehicleCost;
  }

  // Add-ons calculation (Only applies to desert safari tours)
  if (isDesertSafariTour) {
    if (addOnQuad) {
      const quadAddonRate =
        addOnQuadTerrain === 'inside_circle'
          ? 120
          : addOnQuadDuration === '30m'
          ? 150
          : 250;
      totalAED += quadAddonRate * adults;
    }
    if (addOnBuggy) {
      const buggyAddonRate = addOnBuggyDuration === '30m' ? 350 : 600;
      totalAED += buggyAddonRate;
    }
    if (addOnFalcon) totalAED += 50 * (adults + children);
    if (addOnVipTable) totalAED += 200;
  }

  const rateInfo = CURRENCY_RATES[currency];
  const convertedTotal = Math.round(totalAED * rateInfo.rate);

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const randomRef = 'PHX-' + Math.floor(100000 + Math.random() * 900000);
    setBookingRef(randomRef);
    setStep('confirmation');
  };

  const handleSendToWhatsApp = () => {
    let addOnsText = '';
    if (isDesertSafariTour) {
      if (addOnQuad) {
        addOnsText += `• Add-On Quad Bike: ${addOnQuadTerrain === 'inside_circle' ? 'Circle Track' : 'Open Desert'} (${addOnQuadDuration === '30m' ? '30 Mins' : '1 Hour'})\n`;
      }
      if (addOnBuggy) {
        addOnsText += `• Add-On Dune Buggy: Can-Am Maverick (${addOnBuggyDuration === '30m' ? '30 Mins' : '1 Hour'})\n`;
      }
      if (addOnFalcon) addOnsText += `• Add-On: VIP Falcon Photography\n`;
      if (addOnVipTable) addOnsText += `• Add-On: VIP Reserved Majlis Table\n`;
    }

    const durationText = isQuadTour
      ? `• Vehicle: ${quadQuantity}x ${quadEngine === '220cc' ? '250 CC' : '350 CC'} Quad Bike (${quadRider === 'single' ? 'Single 1-Rider' : 'Double 2-Riders'}, ${quadTerrain === 'inside_circle' ? 'Circle Track' : 'Open Desert'})\n• Duration: ${duration === '30m' ? '30 Minutes' : '1 Hour (60 Mins)'}\n`
      : isBuggyTour
      ? `• Vehicle: ${buggyQuantity}x ${buggyModel === 'canam' ? 'Can-Am Maverick Turbo' : 'Polaris RZR'} (${buggySeater})\n• Duration: ${duration === '30m' ? '30 Minutes' : '1 Hour (60 Mins)'}\n`
      : addOnsText;

    const guestsText = isQuadTour
      ? `• Total Bikes: ${quadQuantity} Quad Bike(s)\n`
      : isBuggyTour
      ? `• Total Buggies: ${buggyQuantity} Buggy Unit(s)\n`
      : `• Guests: ${adults} Adults${children > 0 ? `, ${children} Children` : ''}\n`;

    const transferText =
      transferType === 'meeting_point'
        ? `• Transfer: Direct to Desert Meeting Point (Lahbab Base Camp)\n`
        : transferType === 'private_4x4'
        ? `• Transfer: Private 4x4 Luxury Transfer (+AED ${privateVehicleCost} for ${totalPax} pax)\n• Doorstep Pickup: ${pickupAddressType === 'home' ? 'Home Residence' : 'Hotel'}: ${hotelOrHomeAddress || 'Pending Address'} ${roomOrVillaNumber ? `(${roomOrVillaNumber})` : ''}\n`
        : `• Transfer: Shared 4x4 Home/Hotel Pickup (Included)\n• Doorstep Pickup: ${pickupAddressType === 'home' ? 'Home Residence' : 'Hotel'}: ${hotelOrHomeAddress || 'Pending Address'} ${roomOrVillaNumber ? `(${roomOrVillaNumber})` : ''}\n`;

    const text = encodeURIComponent(
      `Hello Phoenix Desert Safari Concierge!\n\nI have confirmed booking *${bookingRef}* for:\n• Experience: ${currentExperience.title}\n• Date: ${safariDate}\n• Time Slot: ${timeSlot}\n${durationText}${guestsText}${transferText}• Guest Name: ${guestName || 'VIP Traveler'}\n• Mobile: ${guestPhone}\n• Total Amount: AED ${totalAED} (${currency} ${convertedTotal})\n\nPlease send me the booking confirmation voucher and GPS coordinates.`
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
                {isQuadTour || isBuggyTour ? (
                  <span>Rate per Whole Vehicle • Meeting Point or Private 4x4</span>
                ) : (
                  <span>Free Home &amp; Hotel Doorstep Pickup • DTCM Licensed</span>
                )}
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

            {/* ================= QUAD BIKE OFF-ROAD CONTROLS ================= */}
            {isQuadTour && (
              <div className="bg-amber-50/90 p-4 rounded-xl border border-amber-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#EA580C]">
                      two_wheeler
                    </span>
                    Quad Bike Vehicle Options
                  </span>
                  <span className="text-xs text-[#EA580C] font-bold">
                    AED {vehicleUnitPrice} / Quad Bike
                  </span>
                </div>

                {/* 1. Duration (30m vs 60m) */}
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Duration:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDuration('30m')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                        duration === '30m'
                          ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-sm'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">schedule</span>
                      <span>30 Minutes Session</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuration('60m')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                        duration === '60m'
                          ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-sm'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">schedule</span>
                      <span>1 Hour (60 Mins)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Rider Mode: Single (1) vs Double (2) */}
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Riders per Quad Bike:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setQuadRider('single')}
                      className={`py-2 px-2 text-xs rounded-lg font-bold transition-all cursor-pointer border flex items-center justify-center gap-1 ${
                        quadRider === 'single'
                          ? 'bg-[#8D4B00] text-white border-[#8D4B00] shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-amber-50'
                      }`}
                    >
                      <span>Single (1 Rider)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuadRider('double')}
                      className={`py-2 px-2 text-xs rounded-lg font-bold transition-all cursor-pointer border flex items-center justify-center gap-1 ${
                        quadRider === 'double'
                          ? 'bg-[#8D4B00] text-white border-[#8D4B00] shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-amber-50'
                      }`}
                    >
                      <span>Double (2 Riders)</span>
                    </button>
                  </div>
                </div>

                {/* 3. Terrain: Inside the Circle vs Open Desert */}
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Track Location / Terrain:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setQuadTerrain('inside_circle')}
                      className={`py-2 px-2 text-xs rounded-lg font-bold transition-all cursor-pointer border ${
                        quadTerrain === 'inside_circle'
                          ? 'bg-[#8D4B00] text-white border-[#8D4B00] shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-amber-50'
                      }`}
                    >
                      Inside the Circle Track
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuadTerrain('open_desert')}
                      className={`py-2 px-2 text-xs rounded-lg font-bold transition-all cursor-pointer border ${
                        quadTerrain === 'open_desert'
                          ? 'bg-[#8D4B00] text-white border-[#8D4B00] shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-amber-50'
                      }`}
                    >
                      Open Desert Red Dunes
                    </button>
                  </div>
                </div>

                {/* 4. Engine Capacity */}
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Quad Bike Engine Capacity:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['220cc', '350cc'] as const).map((cc) => (
                      <button
                        key={cc}
                        type="button"
                        onClick={() => setQuadEngine(cc)}
                        className={`py-2 px-2 text-xs rounded-lg font-bold transition-all cursor-pointer border ${
                          quadEngine === cc
                            ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-amber-50'
                        }`}
                      >
                        {cc === '220cc' ? '250 CC Quad Bike' : '350 CC Quad Bike'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Quantity of Quad Bikes */}
                <div className="flex items-center justify-between pt-1 border-t border-amber-200/80">
                  <span className="text-xs font-bold text-stone-800">Number of Quad Bikes:</span>
                  <div className="flex items-center border border-amber-300 rounded-lg overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setQuadQuantity((prev) => Math.max(1, prev - 1))}
                      className="px-3 py-1 hover:bg-amber-100 text-stone-800 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 font-bold text-xs">{quadQuantity} Bike(s)</span>
                    <button
                      type="button"
                      onClick={() => setQuadQuantity((prev) => prev + 1)}
                      className="px-3 py-1 hover:bg-amber-100 text-stone-800 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= DUNE BUGGY OFF-ROAD CONTROLS ================= */}
            {isBuggyTour && (
              <div className="bg-amber-50/90 p-4 rounded-xl border border-amber-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#EA580C]">
                      speed
                    </span>
                    Buggy Vehicle Options
                  </span>
                  <span className="text-xs text-[#EA580C] font-bold">
                    AED {vehicleUnitPrice} / Buggy
                  </span>
                </div>

                {/* 1. Duration (30m vs 60m) */}
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Duration:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDuration('30m')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                        duration === '30m'
                          ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-sm'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">schedule</span>
                      <span>30 Minutes Sprint</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuration('60m')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                        duration === '60m'
                          ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-sm'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">schedule</span>
                      <span>1 Hour (60 Mins)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Buggy Model: Polaris RZR vs Can-Am Maverick */}
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Buggy Model:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBuggyModel('polaris')}
                      className={`py-2 px-2 text-xs rounded-lg font-bold transition-all cursor-pointer border ${
                        buggyModel === 'polaris'
                          ? 'bg-[#8D4B00] text-white border-[#8D4B00] shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-amber-50'
                      }`}
                    >
                      Polaris RZR
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuggyModel('canam')}
                      className={`py-2 px-2 text-xs rounded-lg font-bold transition-all cursor-pointer border ${
                        buggyModel === 'canam'
                          ? 'bg-[#8D4B00] text-white border-[#8D4B00] shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-amber-50'
                      }`}
                    >
                      Can-Am Maverick Turbo
                    </button>
                  </div>
                </div>

                {/* 3. Seater Configuration: 2-Seater vs 4-Seater */}
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Seating Configuration:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['2-seater', '4-seater'] as const).map((seat) => (
                      <button
                        key={seat}
                        type="button"
                        onClick={() => setBuggySeater(seat)}
                        className={`py-2 px-2 text-xs rounded-lg font-bold transition-all cursor-pointer border ${
                          buggySeater === seat
                            ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-amber-50'
                        }`}
                      >
                        {seat.toUpperCase()} ({seat === '2-seater' ? '2 Passengers' : '4 Passengers'})
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Quantity of Buggies */}
                <div className="flex items-center justify-between pt-1 border-t border-amber-200/80">
                  <span className="text-xs font-bold text-stone-800">Number of Buggies:</span>
                  <div className="flex items-center border border-amber-300 rounded-lg overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setBuggyQuantity((prev) => Math.max(1, prev - 1))}
                      className="px-3 py-1 hover:bg-amber-100 text-stone-800 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 font-bold text-xs">{buggyQuantity} Buggy</span>
                    <button
                      type="button"
                      onClick={() => setBuggyQuantity((prev) => prev + 1)}
                      className="px-3 py-1 hover:bg-amber-100 text-stone-800 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <label className="text-xs font-bold text-stone-700 block mb-1">Expedition Date</label>
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
                  ) : currentExperience.id === 'burj-khalifa-124-125' ? (
                    <>
                      <option value="10:00 AM (Morning Panorama)">10:00 AM (Morning Panorama)</option>
                      <option value="02:00 PM (Afternoon Clear View)">02:00 PM (Afternoon Clear View)</option>
                      <option value="04:30 PM (Prime Sunset - High Demand)">04:30 PM (Prime Sunset - High Demand)</option>
                      <option value="06:30 PM (Evening Skyline & City Lights)">06:30 PM (Evening Skyline & City Lights)</option>
                      <option value="08:30 PM (Night Panorama)">08:30 PM (Night Panorama)</option>
                    </>
                  ) : currentExperience.id === 'burj-khalifa-fountain-lake-ride' ? (
                    <>
                      <option value="06:00 PM (Sunset Fountain Show)">06:00 PM (Sunset Fountain Show)</option>
                      <option value="07:00 PM (Evening Fountain Display)">07:00 PM (Evening Fountain Display)</option>
                      <option value="08:00 PM (Prime Gala Fountain Show)">08:00 PM (Prime Gala Fountain Show)</option>
                      <option value="09:00 PM (Night Lake Abra Cruise)">09:00 PM (Night Lake Abra Cruise)</option>
                      <option value="10:00 PM (Late Night Water Dance)">10:00 PM (Late Night Water Dance)</option>
                    </>
                  ) : currentExperience.id === 'skydive-dubai-tandem-palm' ? (
                    <>
                      <option value="07:30 AM (Sunrise Early Jump DZ)">07:30 AM (Sunrise Early Jump DZ)</option>
                      <option value="09:00 AM (Morning Clear Skies)">09:00 AM (Morning Clear Skies)</option>
                      <option value="10:30 AM (Mid-Morning Tandem)">10:30 AM (Mid-Morning Tandem)</option>
                      <option value="12:00 PM (Noon Sky Dive Session)">12:00 PM (Noon Sky Dive Session)</option>
                    </>
                  ) : currentExperience.id === 'miracle-garden-global-village-combo' ? (
                    <>
                      <option value="02:30 PM (Recommended Dual Itinerary)">02:30 PM (Recommended Dual Itinerary)</option>
                      <option value="03:00 PM (Afternoon Departure)">03:00 PM (Afternoon Departure)</option>
                      <option value="03:30 PM (Evening-Focused Tour)">03:30 PM (Evening-Focused Tour)</option>
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

            {/* Guests Counter (For regular safaris & city excursions) */}
            {!isQuadTour && !isBuggyTour && (
              <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-stone-800 block">Party Size</span>
                  <span className="text-xs text-stone-500">
                    {currentExperience.id === 'miracle-garden-global-village-combo'
                      ? 'Private vehicle included. Tickets priced per guest.'
                      : currentExperience.id === 'burj-khalifa-124-125' || currentExperience.id === 'burj-khalifa-fountain-lake-ride' || currentExperience.id === 'skydive-dubai-tandem-palm'
                      ? 'Official direct admission per participant.'
                      : 'Children under 3 ride free. Children 3-10 receive 30% discount.'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {/* Adults */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-700">Adults:</span>
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

                  {/* Kids */}
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
                </div>
              </div>
            )}

            {/* Special Pricing Breakdown for Miracle Garden + Global Village */}
            {currentExperience.id === 'miracle-garden-global-village-combo' && (
              <div className="bg-gradient-to-r from-purple-50 to-amber-50 p-3.5 rounded-xl border border-purple-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-950 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#8D4B00]">directions_car</span>
                    Private Dedicated Vehicle (Door-to-Door Chauffeur)
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-purple-900 block">
                      AED {calculatePrivateVehiclePrice(adults + children)}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      AED 500 for 1-2 pax{adults + children > 2 ? ` (+AED ${(adults + children - 2) * 50} for ${adults + children - 2} extra pax)` : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-950 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">confirmation_number</span>
                    Combo Entry Tickets ({adults + children} Guests × AED 130)
                  </span>
                  <span className="font-bold text-emerald-800">AED {(adults + children) * 130}</span>
                </div>
                <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between text-xs font-bold text-[#8D4B00]">
                  <span>Total Package Price:</span>
                  <span className="text-sm">AED {calculatePrivateVehiclePrice(adults + children) + (adults + children) * 130}</span>
                </div>
              </div>
            )}

            {/* Transfer Mode - Quad & Buggy (Direct Camp Meeting vs Private 4x4 Only) */}
            {isQuadTour || isBuggyTour ? (
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 block">
                    Transportation / Arrival Mode
                  </span>
                  <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                    No Shared Pickup for Quad/Buggy
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransferType('meeting_point')}
                    className={`p-3 rounded-lg border text-left flex items-start gap-2 cursor-pointer transition-colors ${
                      transferType === 'meeting_point'
                        ? 'border-[#EA580C] bg-orange-50/40 text-stone-900'
                        : 'border-stone-200 hover:border-stone-300 text-stone-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#EA580C]">
                      location_on
                    </span>
                    <div>
                      <span className="text-xs font-bold block">Direct to Desert Meeting Point</span>
                      <span className="text-[11px] text-stone-500">
                        Self-Drive / Taxi to Camp (Free / Included)
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
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold block">Private 4x4 Luxury Transfer</span>
                        <span className="text-xs font-bold text-[#EA580C]">+AED {privateVehicleCost}</span>
                      </div>
                      <span className="text-[11px] text-stone-500 block">
                        AED 500 for 1-2 pax{totalPax > 2 ? ` (+AED ${(totalPax - 2) * 50} for ${totalPax - 2} extra pax)` : ''} &bull; {totalPax} pax
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            ) : currentExperience.id !== 'private-vip-safari' ? (
              /* Regular Safari Doorstep Pickup */
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
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold block">Private 4x4 Exclusive Car</span>
                        <span className="text-xs font-bold text-[#EA580C]">+AED {privateVehicleCost}</span>
                      </div>
                      <span className="text-[11px] text-stone-500 block">
                        AED 500 for 1-2 pax{totalPax > 2 ? ` (+AED ${(totalPax - 2) * 50} for ${totalPax - 2} extra pax)` : ''} &bull; {totalPax} pax
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            ) : null}

            {/* Optional Add-ons for desert safari tours only */}
            {isDesertSafariTour && (
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 block">Desert Safari Add-Ons</span>
                  {transferType === 'shared' && (
                    <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                      Sharing Safari limited to 30-min quad/buggy add-ons
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* 1. Self-Drive Quad Bike Addon */}
                  <div className="p-3 rounded-lg border border-amber-200/80 bg-amber-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addOnQuad}
                          onChange={(e) => setAddOnQuad(e.target.checked)}
                          className="accent-[#EA580C] w-4 h-4 rounded cursor-pointer"
                        />
                        <span className="text-xs font-bold text-stone-900">
                          Add 250 CC Quad Bike ATV
                        </span>
                      </label>
                      <span className="text-xs font-bold text-[#EA580C]">
                        +{addOnQuadTerrain === 'inside_circle' ? 'AED 120' : addOnQuadDuration === '30m' ? 'AED 150' : 'AED 250'} / person
                      </span>
                    </div>

                    {addOnQuad && (
                      <div className="mt-2 space-y-2 pl-6">
                        {/* Terrain Choice: Inside Circle vs Open Desert */}
                        <div>
                          <span className="text-[11px] text-stone-600 font-bold block mb-1">Track &amp; Location:</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setAddOnQuadTerrain('inside_circle')}
                              className={`py-1.5 px-2 text-[11px] rounded-lg font-bold border cursor-pointer transition-colors ${
                                addOnQuadTerrain === 'inside_circle'
                                  ? 'bg-[#8D4B00] text-white border-[#8D4B00]'
                                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                              }`}
                            >
                              Inside Circle Track (AED 120)
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddOnQuadTerrain('open_desert')}
                              className={`py-1.5 px-2 text-[11px] rounded-lg font-bold border cursor-pointer transition-colors ${
                                addOnQuadTerrain === 'open_desert'
                                  ? 'bg-[#8D4B00] text-white border-[#8D4B00]'
                                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                              }`}
                            >
                              Open Desert Red Dunes
                            </button>
                          </div>
                        </div>

                        {/* Duration Choice (Hidden 1-hour if sharing) */}
                        {addOnQuadTerrain === 'open_desert' && (
                          <div>
                            <span className="text-[11px] text-stone-600 font-bold block mb-1">Session Duration:</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setAddOnQuadDuration('30m')}
                                className={`px-3 py-1 text-[11px] rounded-lg font-bold border cursor-pointer ${
                                  addOnQuadDuration === '30m'
                                    ? 'bg-[#EA580C] text-white border-[#EA580C]'
                                    : 'bg-white text-stone-700 border-stone-200'
                                }`}
                              >
                                30 Minutes (AED 150)
                              </button>
                              
                              {transferType === 'private_4x4' ? (
                                <button
                                  type="button"
                                  onClick={() => setAddOnQuadDuration('60m')}
                                  className={`px-3 py-1 text-[11px] rounded-lg font-bold border cursor-pointer ${
                                    addOnQuadDuration === '60m'
                                      ? 'bg-[#EA580C] text-white border-[#EA580C]'
                                      : 'bg-white text-stone-700 border-stone-200'
                                  }`}
                                >
                                  1 Hour (AED 250)
                                </button>
                              ) : (
                                <span className="text-[10px] text-stone-500 italic">
                                  (1-Hour quad only available on Private Safari transfer)
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 2. Self-Drive Dune Buggy Addon */}
                  <div className="p-3 rounded-lg border border-amber-200/80 bg-amber-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addOnBuggy}
                          onChange={(e) => setAddOnBuggy(e.target.checked)}
                          className="accent-[#EA580C] w-4 h-4 rounded cursor-pointer"
                        />
                        <span className="text-xs font-bold text-stone-900">
                          Add Can-Am Dune Buggy
                        </span>
                      </label>
                      <span className="text-xs font-bold text-[#EA580C]">
                        +{addOnBuggyDuration === '30m' ? 'AED 350' : 'AED 600'} / buggy
                      </span>
                    </div>

                    {addOnBuggy && (
                      <div className="mt-2 pl-6 space-y-2">
                        <span className="text-[11px] text-stone-600 font-bold block">Buggy Session Duration:</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setAddOnBuggyDuration('30m')}
                            className={`px-3 py-1 text-[11px] rounded-lg font-bold border cursor-pointer ${
                              addOnBuggyDuration === '30m'
                                ? 'bg-[#EA580C] text-white border-[#EA580C]'
                                : 'bg-white text-stone-700 border-stone-200'
                            }`}
                          >
                            30 Minutes (AED 350)
                          </button>

                          {transferType === 'private_4x4' ? (
                            <button
                              type="button"
                              onClick={() => setAddOnBuggyDuration('60m')}
                              className={`px-3 py-1 text-[11px] rounded-lg font-bold border cursor-pointer ${
                                addOnBuggyDuration === '60m'
                                  ? 'bg-[#EA580C] text-white border-[#EA580C]'
                                  : 'bg-white text-stone-700 border-stone-200'
                              }`}
                            >
                              1 Hour (AED 600)
                            </button>
                          ) : (
                            <span className="text-[10px] text-stone-500 italic">
                              (1-Hour buggy session only available on Private Safari)
                            </span>
                          )}
                        </div>
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
                  Estimated Total {isQuadTour ? `(${quadQuantity} Quad Bike${quadQuantity > 1 ? 's' : ''})` : isBuggyTour ? `(${buggyQuantity} Buggy Unit${buggyQuantity > 1 ? 's' : ''})` : ''}
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
                Continue to Contact Details →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GUEST & DOORSTEP PICKUP / MEETING POINT DETAILS */}
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
                  {isQuadTour && ` • ${quadQuantity}x ${quadEngine} (${quadRider === 'single' ? 'Single' : 'Double'}, ${quadTerrain === 'inside_circle' ? 'Circle Track' : 'Open Desert'}, ${duration === '30m' ? '30 Min' : '1 Hr'})`}
                  {isBuggyTour && ` • ${buggyQuantity}x ${buggyModel === 'canam' ? 'Can-Am' : 'Polaris'} ${buggySeater} (${duration === '30m' ? '30 Min' : '1 Hr'})`}
                  {' • '}
                  {transferType === 'meeting_point'
                    ? 'Direct Meeting Point'
                    : transferType === 'private_4x4'
                    ? `Private 4x4 Transfer (+AED ${privateVehicleCost})`
                    : 'Shared Transfer'}
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

            {/* DIRECT MEETING POINT INFO (If selected) */}
            {transferType === 'meeting_point' && (
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 space-y-1 text-xs text-blue-950">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <span className="material-symbols-outlined text-[18px] text-[#0284C7]">location_on</span>
                  <span>Direct Desert Meeting Point Location:</span>
                </div>
                <p className="text-stone-700 leading-relaxed">
                  <strong>Phoenix Desert Base Camp, Lahbab Red Dunes, Dubai</strong> (Approx. 45-min drive from Downtown Dubai). Free customer parking on site. Exact Google Maps pin &amp; directions sent immediately to your WhatsApp.
                </p>
              </div>
            )}

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

              {/* Pickup Type: Hotel or Home (Only required if chauffeur transfer is selected) */}
              {transferType !== 'meeting_point' ? (
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
              ) : (
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Preferred Contact Language
                  </label>
                  <div className="p-2.5 rounded-lg border border-stone-200 bg-stone-50 text-xs font-semibold text-stone-700">
                    English / Arabic / Russian / French / Hindi
                  </div>
                </div>
              )}
            </div>

            {/* Doorstep Address Input (Only if Private 4x4 or Shared Pickup) */}
            {transferType !== 'meeting_point' && (
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
            )}

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Special Requests or Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. GoPro chest harness request, vegetarian meal, birthday group surprise"
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
                  Pay on pickup/arrival via Cash (AED, USD, EUR, GBP) or Credit/Debit Card directly to your safari captain.
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
                A confirmation has been logged. Our operations captain will reach out via WhatsApp with your booking details and driver/meeting information.
              </p>
            </div>

            {/* Voucher Details Card */}
            <div className="bg-white p-4 rounded-xl border border-amber-200 text-left text-xs space-y-2 font-medium">
              <div className="flex justify-between border-b border-stone-100 pb-1.5">
                <span className="text-stone-500">Experience:</span>
                <span className="font-bold text-stone-900">{currentExperience.title}</span>
              </div>
              {isQuadTour && (
                <div className="flex justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-stone-500">Machine &amp; Duration:</span>
                  <span className="font-bold text-[#EA580C]">
                    {quadQuantity}x {quadEngine === '220cc' ? '250 CC' : '350 CC'} Quad Bike ({quadRider === 'single' ? 'Single' : 'Double'}, {quadTerrain === 'inside_circle' ? 'Circle Track' : 'Open Dunes'}) • {duration === '30m' ? '30 Mins' : '1 Hour'}
                  </span>
                </div>
              )}
              {isBuggyTour && (
                <div className="flex justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-stone-500">Buggy Model &amp; Seater:</span>
                  <span className="font-bold text-[#EA580C]">
                    {buggyQuantity}x {buggyModel === 'canam' ? 'Can-Am Maverick' : 'Polaris RZR'} ({buggySeater}) • {duration === '30m' ? '30 Mins' : '1 Hour'}
                  </span>
                </div>
              )}
              {isDesertSafariTour && (addOnQuad || addOnBuggy || addOnFalcon || addOnVipTable) && (
                <div className="flex justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-stone-500">Add-Ons Selected:</span>
                  <span className="font-bold text-[#EA580C] text-right">
                    {addOnQuad && `250 CC Quad (${addOnQuadTerrain === 'inside_circle' ? 'Circle' : 'Open Dunes'} ${addOnQuadDuration}) `}
                    {addOnBuggy && `Can-Am Buggy (${addOnBuggyDuration}) `}
                    {addOnFalcon && `Falcon Photo `}
                    {addOnVipTable && `VIP Table `}
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
                <span className="text-stone-500">Transportation / Pickup:</span>
                <span className="font-bold text-stone-900">
                  {transferType === 'meeting_point'
                    ? 'Direct to Desert Camp (Lahbab Red Dunes GPS Pin)'
                    : transferType === 'private_4x4'
                    ? `Private 4x4 Luxury Pickup: ${hotelOrHomeAddress || 'Pending Address'}`
                    : `Shared 4x4 Pickup: ${hotelOrHomeAddress || 'Pending Address'}`}
                </span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-1.5">
                <span className="text-stone-500">Guest Name:</span>
                <span className="font-bold text-stone-900">{guestName || 'VIP Traveler'}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold">
                <span className="text-stone-900">Total Due on Pickup / Arrival:</span>
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
                <WhatsAppLogo className="w-5 h-5" />
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
