import React from 'react';
import { Experience } from '../types';
import { PhoenixLogo } from './icons/PhoenixLogo';

interface FooterProps {
  onSelectExperience: (experienceId: string) => void;
  onOpenPrivacy: (topic: string) => void;
  onOpenAdmin?: () => void;
  cmsConfig?: {
    directPhone?: string;
    headquarters?: string;
  };
  experiences?: Experience[];
}

export const Footer: React.FC<FooterProps> = ({
  onSelectExperience,
  onOpenPrivacy,
  onOpenAdmin,
  cmsConfig,
  experiences,
}) => {
  const phone = cmsConfig?.directPhone || '+971 56 150 5270';
  const cleanPhone = phone.replace(/\s+/g, '');
  const address =
    cmsConfig?.headquarters || 'DAMAC XL Tower, Business Bay, Dubai, United Arab Emirates';

  const toursList = experiences && experiences.length > 0 ? experiences.slice(0, 5) : [];
  return (
    <footer className="w-full bg-[#EDE3D2] border-t border-amber-200/80 text-stone-700 pt-16 pb-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12">
          {/* Column 1: Brand & Licenses */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <a href="#" className="cursor-pointer">
                <PhoenixLogo className="h-10 w-auto" />
              </a>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              The Phoenix Desert Safari Dubai redefines ultra-luxury Arabian dune expeditions. From
              bespoke VIP camp dining to high-octane dune buggies and VIP private convoys in Business
              Bay.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-white/80 border border-amber-200 flex items-center gap-1.5 shadow-xs">
                <span
                  className="material-symbols-outlined text-[#F59E0B] text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="text-[11px] text-stone-800 font-bold">
                  5.0 / 5.0 Google Reviews
                </span>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/80 border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                <span className="material-symbols-outlined text-[#059669] text-[16px]">
                  verified
                </span>
                <span className="text-[11px] text-stone-800 font-bold">DTCM Licensed</span>
              </div>
            </div>
          </div>

          {/* Column 2: Experiences */}
          <div className="space-y-4">
            <h3 className="text-lg text-stone-900 font-bold font-serif">Experiences</h3>
            <ul className="space-y-2 text-xs text-stone-700">
              {toursList.length > 0 ? (
                toursList.map((tour) => (
                  <li key={tour.id}>
                    <button
                      type="button"
                      onClick={() => onSelectExperience(tour.id)}
                      className="hover:text-[#EA580C] transition-colors cursor-pointer text-left truncate max-w-full"
                    >
                      {tour.title}
                    </button>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => onSelectExperience('evening-desert-safari')}
                      className="hover:text-[#EA580C] transition-colors cursor-pointer text-left"
                    >
                      VIP Evening Desert Safari
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onSelectExperience('morning-desert-safari')}
                      className="hover:text-[#EA580C] transition-colors cursor-pointer text-left"
                    >
                      Private Royal Sunrise Dune Tour
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onSelectExperience('quad-bike-atv-rental')}
                      className="hover:text-[#EA580C] transition-colors cursor-pointer text-left"
                    >
                      Quad Biking &amp; Dune Buggy 1000cc
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onSelectExperience('private-desert-safari')}
                      className="hover:text-[#EA580C] transition-colors cursor-pointer text-left"
                    >
                      Overnight Bedouin Stargazing
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Column 3: Direct Contact */}
          <div className="space-y-4">
            <h3 className="text-lg text-stone-900 font-bold font-serif">Direct Contact</h3>
            <div className="space-y-2.5 text-xs text-stone-700">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#EA580C] shrink-0 text-[18px]">
                  location_on
                </span>
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#EA580C] shrink-0 text-[18px]">
                  call
                </span>
                <a href={`tel:${cleanPhone}`} className="text-stone-900 font-bold hover:text-[#EA580C]">
                  {phone} (Call &amp; WhatsApp)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 shrink-0 text-[18px]">
                  schedule
                </span>
                <span>Open 24 Hours • 7 Days a Week</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#EA580C] shrink-0 text-[18px]">
                  mail
                </span>
                <a
                  href="mailto:concierge@phoenixdesertsafari.com"
                  className="hover:text-[#EA580C] transition-colors"
                >
                  concierge@phoenixdesertsafari.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Follow & Verification */}
          <div className="space-y-4">
            <h3 className="text-lg text-stone-900 font-bold font-serif">Follow &amp; Verification</h3>
            <p className="text-xs text-stone-600">
              Connect with our VIP guest concierges across verified social media and travel community
              platforms:
            </p>
            <div className="flex items-center gap-3">
              <a
                className="w-10 h-10 rounded-full bg-white border border-amber-200 shadow-xs flex items-center justify-center text-[#EA580C] hover:bg-[#EA580C] hover:text-white transition-colors"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
              >
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-white border border-amber-200 shadow-xs flex items-center justify-center text-[#EA580C] hover:bg-[#EA580C] hover:text-white transition-colors"
                href="https://tripadvisor.com"
                target="_blank"
                rel="noopener noreferrer"
                title="TripAdvisor"
              >
                <span className="material-symbols-outlined text-[20px]">public</span>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-white border border-amber-200 shadow-xs flex items-center justify-center text-[#EA580C] hover:bg-[#EA580C] hover:text-white transition-colors"
                href="https://google.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Google Reviews"
              >
                <span className="material-symbols-outlined text-[20px]">reviews</span>
              </a>
            </div>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="pt-6 border-t border-amber-200/80 flex flex-col md:flex-row items-center justify-between text-xs text-stone-600 gap-2">
          <p>© 2025 Desert Safari Dubai - The Phoenix. All rights reserved. DAMAC XL Tower, Business Bay.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onOpenPrivacy('privacy')}
              className="hover:text-[#EA580C] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenPrivacy('terms')}
              className="hover:text-[#EA580C] transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onOpenPrivacy('safety')}
              className="hover:text-[#EA580C] transition-colors cursor-pointer"
            >
              Safety Guidelines
            </button>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-[#8D4B00] font-bold hover:text-[#EA580C] transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                <span>Admin Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
