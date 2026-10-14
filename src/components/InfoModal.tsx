import React, { useEffect } from 'react';

interface InfoModalProps {
  topic: 'privacy' | 'terms' | 'safety';
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ topic, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  const content = {
    privacy: {
      title: 'Privacy Policy & Guest Data Protection',
      subtitle: 'The Phoenix Desert Safari Dubai - Data Governance',
      body: (
        <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
          <p>
            At The Phoenix Desert Safari Dubai, we take the confidentiality of your personal and
            travel information with utmost seriousness in compliance with UAE Data Protection Laws
            and Department of Economy &amp; Tourism (DET) regulatory standards.
          </p>
          <h5 className="font-bold text-stone-900 text-sm">1. Information We Collect</h5>
          <p>
            We collect guest contact details (Name, WhatsApp number, hotel address, room number)
            solely to coordinate luxury hotel pick-up and drop-off, verify booking vouchers, and
            provide direct updates regarding desert weather and pickup timings.
          </p>
          <h5 className="font-bold text-stone-900 text-sm">2. Zero Third-Party Sharing</h5>
          <p>
            We never sell, rent, or lease guest information to third-party telemarketers or external
            brokers. Your information is shared only with your designated safari captain and convoy
            lead for safe transportation.
          </p>
          <h5 className="font-bold text-stone-900 text-sm">3. Payment Security</h5>
          <p>
            No credit card details are retained on unencrypted servers. Bookings can be paid directly
            to your licensed marshal at pickup via contactless POS or cash.
          </p>
        </div>
      ),
    },
    terms: {
      title: 'Terms of Service & Booking Conditions',
      subtitle: 'Standard Operating Guidelines',
      body: (
        <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
          <p>
            By booking a desert safari, quad bike rental, or city tour with The Phoenix Desert Safari
            Dubai, you agree to our standard tour operator terms and conditions.
          </p>
          <h5 className="font-bold text-stone-900 text-sm">1. Cancellation &amp; Rescheduling</h5>
          <p>
            We offer 100% free cancellation or rescheduling up to 12 hours before your scheduled hotel
            pickup. Cancellations within 12 hours may be subject to vehicle dispatch operational fees.
          </p>
          <h5 className="font-bold text-stone-900 text-sm">2. Hotel Pick-up Coordination</h5>
          <p>
            Guests must be present in their hotel lobby at the scheduled pickup window. Our marshals
            will notify you via WhatsApp or phone call 15 minutes before arrival.
          </p>
          <h5 className="font-bold text-stone-900 text-sm">3. Severe Weather &amp; Force Majeure</h5>
          <p>
            In the rare event of severe sandstorms, heavy rain, or government weather advisories,
            expeditions will be rescheduled to your preferred backup date or fully refunded.
          </p>
        </div>
      ),
    },
    safety: {
      title: 'Desert Safety & Marshal Guidelines',
      subtitle: 'DTCM Licensed Professional Standards',
      body: (
        <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
          <p>
            Your safety is our paramount priority. All Phoenix safaris are conducted under strict
            protocols established by the Dubai Department of Economy and Tourism.
          </p>
          <h5 className="font-bold text-stone-900 text-sm">1. Vehicles &amp; Equipment</h5>
          <p>
            Our fleet consists of recent model Toyota Land Cruisers fitted with internal roll cages,
            first aid trauma kits, GPS satellite emergency beacons, and fire suppression systems.
            Tires are deflated to precise pressure curves prior to entering high dunes.
          </p>
          <h5 className="font-bold text-stone-900 text-sm">2. Certified Safari Marshals</h5>
          <p>
            Every driver holds a DTCM Desert Driving Permit, extensive off-road safety certification,
            and advanced first aid training.
          </p>
          <h5 className="font-bold text-stone-900 text-sm">3. Health Recommendations</h5>
          <p>
            High-adrenaline dune bashing is not recommended for pregnant women or individuals with
            severe spinal or heart conditions. Please notify our concierge in advance so we can arrange
            a gentle panoramic scenic route or direct camp transfer.
          </p>
        </div>
      ),
    },
  }[topic];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div role="dialog" aria-modal="true" aria-labelledby="info-modal-title" className="bg-[#FAF6F0] rounded-2xl sm:rounded-3xl border border-amber-200/80 shadow-2xl max-w-lg w-full overflow-hidden text-stone-900 relative">
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 id="info-modal-title" className="font-serif font-bold text-lg leading-tight">{content.title}</h3>
            <span className="text-[11px] text-amber-200 uppercase tracking-widest font-semibold">
              {content.subtitle}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close information modal"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">{content.body}</div>

        <div className="p-4 bg-white border-t border-amber-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-[#EA580C] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
