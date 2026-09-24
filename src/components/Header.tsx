import React, { useState } from 'react';
import { Currency } from '../types';
import { CURRENCY_RATES } from '../data/safaris';

interface HeaderProps {
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onOpenBooking: (experienceId?: string) => void;
  onOpenWhatsApp: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin?: () => void;
  announcementText?: string;
  showAnnouncement?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currency,
  onCurrencyChange,
  onOpenBooking,
  onOpenWhatsApp,
  activeSection,
  onNavigate,
  onOpenAdmin,
  announcementText,
  showAnnouncement = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const navItems = [
    { id: 'desert-safaris', label: 'Desert Safaris' },
    { id: 'quad-and-buggy-rentals', label: 'Quad & Buggy' },
    { id: 'city-tours', label: 'City Tours' },
    { id: 'travel-guides', label: 'Safari Guides' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'direct-advantage', label: 'About Us' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-amber-100/80 shadow-[0_2px_15px_rgba(217,119,6,0.06)]">
      {/* TOP ANNOUNCEMENT BAR (Warm Terracotta/Amber Gradient) */}
      {showAnnouncement && (
        <div className="bg-gradient-to-r from-[#D97706] via-[#EA580C] to-[#C2410C] text-white text-[11px] font-bold py-2 px-4 sm:px-8 lg:px-16 hidden md:block">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="tracking-wide">
                {announcementText ? (
                  announcementText
                ) : (
                  <>
                    Open 24 Hours • Call &amp; WhatsApp Direct Booking:{' '}
                    <a
                      href="tel:0561505270"
                      className="text-amber-200 font-extrabold underline underline-offset-2 hover:text-white transition-colors"
                    >
                      056 150 5270
                    </a>{' '}
                    • Located at DAMAC XL Tower, Business Bay, Dubai
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5 text-amber-100">
                <span className="material-symbols-outlined text-[16px] text-amber-300">verified</span>
                Official Luxury Operator
              </span>
              <span className="flex items-center gap-1.5 text-amber-100">
                <span className="material-symbols-outlined text-[16px] text-amber-300">schedule</span>
                24/7 Concierge
              </span>

              {/* Admin Portal Quick Toggle Button */}
              {onOpenAdmin && (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1 bg-black/25 hover:bg-black/40 px-2.5 py-0.5 rounded text-[11px] font-bold text-amber-200 hover:text-white transition-colors cursor-pointer border border-amber-300/30 shadow-xs"
                  title="Switch to Operator Admin Dashboard"
                >
                  <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                  <span>Admin Portal</span>
                </button>
              )}

              {/* Currency Switcher */}
              <div className="relative">
              <button
                type="button"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1 bg-black/20 hover:bg-black/30 px-2 py-0.5 rounded text-[11px] font-semibold text-white transition-colors"
              >
                <span>{currency}</span>
                <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
              </button>
              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-1 w-24 bg-white text-stone-900 rounded-lg shadow-xl border border-stone-200 py-1 z-50">
                  {(Object.keys(CURRENCY_RATES) as Currency[]).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => {
                        onCurrencyChange(curr);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-amber-50 ${
                        currency === curr ? 'font-bold text-[#EA580C] bg-amber-50/50' : 'text-stone-700'
                      }`}
                    >
                      <span>{curr}</span>
                      <span className="text-[10px] text-stone-400">{CURRENCY_RATES[curr].symbol}</span>
                    </button>
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="h-20 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center group"
          >
            <img
              alt="The Phoenix Desert Safari Dubai Logo"
              className="h-11 w-auto object-contain transition-transform group-hover:scale-102"
              src="https://lh3.googleusercontent.com/aida/AEtjO1UAlnx-CA70htzzvoRrCEmkQmvTfyhb6aC0CW-1w6rCjbU9LPi_1PcCFxZ-zHAO02VU2USkvo5iZNpQMZzHgaa75YOYe9zfGbE3YVAlapHQLDilHR9yROJKtW7IlDrS6gKpB-GHJxALLTh_i0A67sU-4QyT-5eE4hUsQi7e8U4Kzo3V6zXL4kzSyvGqYkkuVYu1WoOqX6u63N-ysJqZMlOoEdjK3zmJ1AEk_rWRu-OYXmwJxESOERYd6zVi"
            />
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`transition-colors text-[14px] cursor-pointer ${
                  isActive
                    ? 'text-[#EA580C] font-semibold border-b-2 border-[#EA580C] pb-0.5'
                    : 'text-stone-600 hover:text-[#EA580C] font-medium'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-4">
          {/* Direct Phone */}
          <a
            className="hidden xl:flex items-center gap-1.5 text-stone-800 hover:text-[#EA580C] transition-colors text-[13px] font-semibold"
            href="tel:0561505270"
          >
            <span className="material-symbols-outlined text-[#EA580C] text-[18px]">call</span>
            <span>056 150 5270</span>
          </a>

          {/* Book Adventure CTA */}
          <button
            type="button"
            onClick={() => onOpenBooking()}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#D97706] hover:from-[#C2410C] hover:to-[#EA580C] text-white text-[12px] uppercase tracking-wider font-bold shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 transition-all cursor-pointer active:scale-98"
          >
            Book Adventure
          </button>

          {/* Concierge Avatar / WhatsApp Trigger */}
          <button
            type="button"
            onClick={onOpenWhatsApp}
            title="Chat with VIP Concierge"
            className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 hover:border-[#EA580C] flex items-center justify-center shrink-0 text-[#C2410C] shadow-sm hover:scale-105 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-700 hover:text-[#EA580C] focus:outline-none"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-amber-100 px-6 py-4 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Navigation</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">Currency:</span>
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as Currency)}
                className="text-xs font-bold bg-amber-50 border border-amber-200 rounded px-2 py-1 text-stone-800"
              >
                {(Object.keys(CURRENCY_RATES) as Currency[]).map((curr) => (
                  <option key={curr} value={curr}>
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
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-stone-700 hover:text-[#EA580C] font-medium text-sm transition-colors"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
            <a
              href="tel:0561505270"
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-50 text-[#EA580C] font-semibold text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              <span>Call Direct: 056 150 5270</span>
            </a>
            <button
              onClick={() => {
                onOpenWhatsApp();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>WhatsApp VIP Concierge</span>
            </button>
            {onOpenAdmin && (
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#8D4B00] hover:bg-[#B15F00] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                <span>Operator Admin Portal</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
