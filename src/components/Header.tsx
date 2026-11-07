import React, { useState } from 'react';
import { Currency } from '../types';
import { CURRENCY_RATES } from '../data/safaris';
import { WhatsAppLogo } from './icons/WhatsAppLogo';
import { PhoenixLogo } from './icons/PhoenixLogo';

interface HeaderProps {
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onOpenBooking: (experienceId?: string) => void;
  onOpenWhatsApp: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin?: () => void;
  isAdminLoggedIn?: boolean;
  announcementText?: string;
  showAnnouncement?: boolean;
  phone?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currency,
  onCurrencyChange,
  onOpenBooking,
  onOpenWhatsApp,
  activeSection,
  onNavigate,
  onOpenAdmin,
  isAdminLoggedIn = false,
  announcementText,
  showAnnouncement = true,
  phone = '+971 56 150 5270',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [destinationsOpen, setDestinationsOpen] = useState(false);

  // Clean announcement ticker to ensure no DTCM licensed wording appears
  const cleanAnnouncement = (announcementText || '')
    .replace(/DTCM\s*(?:-|\s*Licensed\s*)?Operator\s*•?\s*/gi, 'Direct Tour Operator • ')
    .replace(/DTCM\s*Licensed\s*/gi, '')
    .trim();

  const navItems = [
    { id: 'home', label: 'Home', isDropdown: false },
    { id: 'destinations', label: 'Destinations', isDropdown: true },
    { id: 'quad-and-buggy-rentals', label: 'Tours', isDropdown: true },
    { id: 'about-experience', label: 'About Us', isDropdown: false },
    { id: 'services', label: 'Services', isDropdown: false },
    { id: 'reviews', label: 'Reviews', isDropdown: false },
    { id: 'faqs', label: 'Contact Us', isDropdown: false },
  ];

  const destinationDropdownItems = [
    { id: 'evening-desert-safari', label: 'Lahbab Red Dunes', desc: 'Dune Bashing & 5-Star Camp' },
    { id: 'can-am-buggy-safari', label: 'Dune Buggy Arena', desc: '1000cc Can-Am Maverick Rentals' },
    { id: 'quad-bike-atv', label: 'Quad Biking Dunes', desc: 'Yamaha 250cc & 350cc ATVs' },
    { id: 'dubai-half-day-city-tour', label: 'Dubai City & Marina', desc: 'Burj Khalifa, Souks & Creek' },
    { id: 'abu-dhabi-tour-from-dubai', label: 'Abu Dhabi Grand Mosque', desc: 'Palace & Ferrari World' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-300">
      {/* Top Announcement Ticker Bar */}
      {showAnnouncement && (
        <div className="bg-[#071727] text-stone-300 text-[11px] font-semibold py-1.5 px-4 sm:px-8 lg:px-16 border-b border-sky-950/80 hidden md:block">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="tracking-wide">
                {cleanAnnouncement ||
                  'Direct Tour Operator • Free Home & Hotel Pickup Across Dubai • Located at DAMAC XL Tower, Business Bay'}
              </span>
            </div>
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5 text-stone-300">
                <span className="material-symbols-outlined text-[15px] text-[#38BDF8]">verified</span>
                Official Luxury Operator
              </span>
              <span className="flex items-center gap-1.5 text-stone-300">
                <span className="material-symbols-outlined text-[15px] text-amber-400">schedule</span>
                24/7 Concierge: {phone}
              </span>

              {onOpenAdmin && (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1 text-stone-300 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                  title="Direct Admin Portal"
                >
                  <span className="material-symbols-outlined text-[12px] text-amber-300">lock</span>
                  <span>{isAdminLoggedIn ? 'Dashboard' : 'Admin'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar (Deep Navy matching reference design) */}
      <div className="bg-[#0B1E33]/95 backdrop-blur-xl border-b border-sky-900/40 shadow-xl">
        <div className="h-20 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center group cursor-pointer"
            >
              <PhoenixLogo className="h-10 sm:h-11 w-auto" />
            </a>
          </div>

          {/* Desktop Navigation Links (Matches reference design) */}
          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              if (item.isDropdown && item.id === 'destinations') {
                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setDestinationsOpen(true)}
                    onMouseLeave={() => setDestinationsOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => onNavigate('destinations')}
                      className={`flex items-center gap-1 text-sm font-semibold transition-colors py-2 cursor-pointer ${
                        isActive ? 'text-[#38BDF8]' : 'text-stone-200 hover:text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="material-symbols-outlined text-[16px] text-stone-400">keyboard_arrow_down</span>
                    </button>

                    {/* Dropdown Menu */}
                    {destinationsOpen && (
                      <div className="absolute left-0 top-full pt-1 w-64 z-50">
                        <div className="bg-[#0B1E33] border border-sky-900/60 rounded-2xl shadow-2xl p-2 space-y-1">
                          {destinationDropdownItems.map((dest) => (
                            <button
                              key={dest.id}
                              type="button"
                              onClick={() => {
                                onOpenBooking(dest.id);
                                setDestinationsOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 transition-colors flex flex-col group cursor-pointer"
                            >
                              <span className="text-xs font-bold text-white group-hover:text-[#38BDF8]">
                                {dest.label}
                              </span>
                              <span className="text-[10px] text-stone-400">{dest.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'home') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      onNavigate(item.id);
                    }
                  }}
                  className={`flex items-center gap-1 text-sm font-semibold transition-colors cursor-pointer ${
                    isActive ? 'text-[#38BDF8] font-bold' : 'text-stone-200 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.isDropdown && (
                    <span className="material-symbols-outlined text-[16px] text-stone-400">keyboard_arrow_down</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster (Matches reference design) */}
          <div className="flex items-center gap-3">
            {/* Currency Selector (e.g. 🇺🇸 USD ▾) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full text-xs font-bold text-white transition-all cursor-pointer"
              >
                <span>{currency === 'USD' ? '🇺🇸' : currency === 'AED' ? '🇦🇪' : currency === 'GBP' ? '🇬🇧' : currency === 'EUR' ? '🇪🇺' : '🌐'}</span>
                <span>{currency}</span>
                <span className="material-symbols-outlined text-[16px] text-stone-400">keyboard_arrow_down</span>
              </button>
              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-28 bg-[#0B1E33] border border-sky-900/60 rounded-xl shadow-2xl py-1 z-50">
                  {(Object.keys(CURRENCY_RATES) as Currency[]).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => {
                        onCurrencyChange(curr);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/10 ${
                        currency === curr ? 'font-bold text-[#38BDF8] bg-white/5' : 'text-stone-200'
                      }`}
                    >
                      <span>{curr}</span>
                      <span className="text-[10px] text-stone-400">{CURRENCY_RATES[curr].symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Search / Inquiry Icon */}
            <button
              type="button"
              onClick={onOpenWhatsApp}
              title="Search & Quick Inquiry"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
            </button>

            {/* Plan Your Trip Button (Signature Blue Pill from reference design) */}
            <button
              type="button"
              onClick={() => onOpenBooking()}
              className="px-5 py-2.5 rounded-full bg-[#0084FF] hover:bg-[#0070db] text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-102 active:scale-98 transition-all cursor-pointer whitespace-nowrap"
            >
              Plan Your Trip
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-200 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B1E33] border-b border-sky-900/60 px-6 py-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200 text-white">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Navigation</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400">Currency:</span>
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as Currency)}
                className="text-xs font-bold bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white"
              >
                {(Object.keys(CURRENCY_RATES) as Currency[]).map((curr) => (
                  <option key={curr} value={curr} className="bg-[#0B1E33] text-white">
                    {curr} ({CURRENCY_RATES[curr].symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'home') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  onNavigate(item.id);
                }
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-stone-200 hover:text-[#38BDF8] font-semibold text-sm transition-colors"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <button
              onClick={() => {
                onOpenBooking();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-full bg-[#0084FF] hover:bg-[#0070db] text-white font-bold text-sm text-center shadow-md transition-all cursor-pointer"
            >
              Plan Your Trip Now
            </button>
            <button
              onClick={() => {
                onOpenWhatsApp();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              <WhatsAppLogo className="w-5 h-5" />
              <span>WhatsApp VIP Concierge</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
