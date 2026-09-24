import React, { useState } from 'react';
import { Currency, Experience } from '../types';
import { CURRENCY_RATES, EXPERIENCES } from '../data/safaris';

interface BookingModalProps {
  initialExperienceId?: string;
  initialDate?: string;
  initialAdults?: number;
  initialChildren?: number;
  currency: Currency;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  initialExperienceId,
  initialDate,
  initialAdults = 2,
  initialChildren = 0,
  currency,
  onClose,
}) => {
  const [selectedExperienceId, setSelectedExperienceId] = useState<string>(
    initialExperienceId || EXPERIENCES[0].id
  );
  const [safariDate, setSafariDate] = useState<string>(
    initialDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [adults, setAdults] = useState<number>(initialAdults);
  const [children, setChildren] = useState<number>(initialChildren);
  const [timeSlot, setTimeSlot] = useState<string>('afternoon');
  const [transferType, setTransferType] = useState<'shared' | 'private_4x4'>('shared');

  // Add-ons
  const [addOnQuad, setAddOnQuad] = useState<boolean>(false);
  const [addOnFalcon, setAddOnFalcon] = useState<boolean>(false);
  const [addOnVipTable, setAddOnVipTable] = useState<boolean>(false);

  // Guest Details
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [hotelName, setHotelName] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  const [step, setStep] = useState<'customize' | 'details' | 'confirmation'>('customize');
  const [bookingRef, setBookingRef] = useState<string>('');

  const currentExperience: Experience =
    EXPERIENCES.find((e) => e.id === selectedExperienceId) || EXPERIENCES[0];

  // Pricing calculations
  const basePricePerAdult = currentExperience.priceAED;
  const basePricePerChild = Math.round(currentExperience.priceAED * 0.7); // 30% discount for children

  let totalAED = adults * basePricePerAdult + children * basePricePerChild;

  // Private 4x4 surcharge if selected (AED 350 flat)
  if (transferType === 'private_4x4' && currentExperience.id !== 'private-vip-safari') {
    totalAED += 350;
  }

  // Add-ons
  if (addOnQuad) totalAED += 150 * adults;
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
    const text = encodeURIComponent(
      `Hello Phoenix Desert Safari Concierge!\n\nI have confirmed booking *${bookingRef}* for:\n• Experience: ${currentExperience.title}\n• Date: ${safariDate}\n• Guests: ${adults} Adults, ${children} Children\n• Pickup: ${hotelName || 'Pending Hotel'} Room ${roomNumber || 'N/A'}\n• Guest Name: ${guestName || 'VIP Traveler'}\n• Total: AED ${totalAED} (${currency} ${convertedTotal})\n\nPlease send me the driver pickup details.`
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
              <span className="text-[11px] text-amber-200 uppercase tracking-widest font-semibold">
                Official DTCM Registered Operator
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
                  {EXPERIENCES.map((exp) => (
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

            {/* Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <label className="text-xs font-bold text-stone-700 block mb-1">Safari Date</label>
                <input
                  type="date"
                  value={safariDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSafariDate(e.target.value)}
                  className="w-full text-sm font-semibold text-stone-900 outline-none"
                />
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <label className="text-xs font-bold text-stone-700 block mb-1">Time Preference</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full text-sm font-semibold text-stone-900 outline-none bg-transparent"
                >
                  <option value="afternoon">Afternoon / Golden Sunset (03:00 PM)</option>
                  <option value="morning">Crisp Sunrise Run (05:00 AM)</option>
                  <option value="private-custom">VIP Custom Convoy Timing</option>
                </select>
              </div>
            </div>

            {/* Guests Counter */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-stone-800 block">Party Size</span>
                <span className="text-xs text-stone-500">
                  Children under 3 ride complimentary. Children 3-10 receive 30% discount.
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
                      className="px-2 py-1 hover:bg-amber-100 text-stone-800 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-bold text-xs">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults((prev) => prev + 1)}
                      className="px-2 py-1 hover:bg-amber-100 text-stone-800 font-bold"
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
                      className="px-2 py-1 hover:bg-amber-100 text-stone-800 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-bold text-xs">{children}</span>
                    <button
                      type="button"
                      onClick={() => setChildren((prev) => prev + 1)}
                      className="px-2 py-1 hover:bg-amber-100 text-stone-800 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Transfer Mode */}
            {currentExperience.id !== 'private-vip-safari' && (
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                <span className="text-xs font-bold text-stone-800 block">Transfer Option</span>
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
                      <span className="text-xs font-bold block">Shared 4x4 Pickup</span>
                      <span className="text-[11px] text-stone-500">Included in package price</span>
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
                      <span className="text-xs font-bold block">Private 4x4 Upgrade</span>
                      <span className="text-[11px] text-stone-500">+AED 350 (Full Car Sole Use)</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Optional Luxury Add-ons */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
              <span className="text-xs font-bold text-stone-800 block">Popular Add-Ons</span>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addOnQuad}
                      onChange={(e) => setAddOnQuad(e.target.checked)}
                      className="accent-[#EA580C] w-4 h-4 rounded"
                    />
                    <span className="text-xs font-semibold text-stone-800">
                      30-Min Open Dune Quad Bike (220cc)
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#EA580C]">+AED 150 / adult</span>
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addOnFalcon}
                      onChange={(e) => setAddOnFalcon(e.target.checked)}
                      className="accent-[#EA580C] w-4 h-4 rounded"
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
                      className="accent-[#EA580C] w-4 h-4 rounded"
                    />
                    <span className="text-xs font-semibold text-stone-800">
                      Reserved VIP Majlis Table &amp; Table-Side BBQ Service
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#EA580C]">+AED 200 / table</span>
                </label>
              </div>
            </div>

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
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#D97706] hover:from-[#C2410C] hover:to-[#EA580C] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                Continue to Guest Details →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GUEST & HOTEL DETAILS */}
        {step === 'details' && (
          <form onSubmit={handleConfirmBooking} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-900 block">
                  {currentExperience.title}
                </span>
                <span className="text-[11px] text-stone-600">
                  {safariDate} • {adults} Adults, {children} Kids • Total: AED {totalAED} ({currency}{' '}
                  {convertedTotal})
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
                  placeholder="e.g. Elena Lindqvist"
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
                  placeholder="e.g. elena@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#EA580C] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Dubai Hotel / Residence Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Address Beach Resort JBR"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#EA580C] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Room Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1402 (or lobby meet)"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#EA580C] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Dietary / Special Requests
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vegetarian, baby booster seat"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#EA580C] outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0">
                lock
              </span>
              <span>
                <strong>No upfront deposit required:</strong> Pay directly to your safari marshal at
                pickup via Cash (AED, USD, EUR, GBP) or Credit Card. Free cancellation up to 12 hours
                prior.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-amber-200">
              <button
                type="button"
                onClick={() => setStep('customize')}
                className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#D97706] hover:from-[#C2410C] hover:to-[#EA580C] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                Confirm Booking Instantly ✓
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: INSTANT CONFIRMATION VOUCHER */}
        {step === 'confirmation' && (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>

            <div>
              <h4 className="text-2xl font-serif font-bold text-stone-900">
                Your Adventure is Confirmed!
              </h4>
              <p className="text-xs text-stone-600 mt-1">
                Your safari ticket voucher and driver tracking details have been generated.
              </p>
            </div>

            {/* Voucher Card */}
            <div className="bg-white p-5 rounded-2xl border border-amber-200 text-left space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                    Booking Reference
                  </span>
                  <span className="text-lg font-mono font-bold text-[#EA580C] block">
                    {bookingRef}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold uppercase">
                    DTCM Permit Verified
                  </span>
                  <span className="text-[10px] text-stone-500 block mt-0.5">Pay at Pickup</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">
                    Experience
                  </span>
                  <span className="font-semibold text-stone-900">{currentExperience.title}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Date</span>
                  <span className="font-semibold text-stone-900">{safariDate}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Party</span>
                  <span className="font-semibold text-stone-900">
                    {adults} Adults, {children} Kids
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">
                    Pickup Location
                  </span>
                  <span className="font-semibold text-stone-900 truncate block">
                    {hotelName || 'Dubai Hotel'} {roomNumber ? `(${roomNumber})` : ''}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-bold text-stone-600">Total Due at Pickup:</span>
                <span className="font-serif font-bold text-lg text-stone-900">
                  {currency} {convertedTotal.toLocaleString()} (AED {totalAED})
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleSendToWhatsApp}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Send Voucher to WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
