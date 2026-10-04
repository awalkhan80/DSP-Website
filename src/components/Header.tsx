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
  const cleanPhone = phone.replace(/\s+/g, '');

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
                    Open 24 Hours • Free Home &amp; Hotel Pickup Across Dubai • Located at DAMAC XL Tower, Business Bay, Dubai
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
                  className="flex items-center gap-1.5 bg-black/25 hover:bg-black/40 px-2.5 py-0.5 rounded text-[11px] font-bold text-amber-200 hover:text-white transition-colors cursor-pointer border border-amber-300/30 shadow-xs"
                  title={isAdminLoggedIn ? "Operator Admin Dashboard (Logged In)" : "Secure Operator Admin Login"}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isAdminLoggedIn ? 'admin_panel_settings' : 'lock'}
                  </span>
                  <span>{isAdminLoggedIn ? 'Admin Portal' : 'Admin Login'}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${isAdminLoggedIn ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></span>
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
            className="flex items-center group cursor-pointer"
          >
            <PhoenixLogo className="h-10 sm:h-11 w-auto" />
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
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Admin Portal Quick Button (Desktop / Tablet) */}
          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 hover:text-amber-200 text-xs font-semibold border border-amber-500/30 transition-all cursor-pointer shadow-xs"
              title={isAdminLoggedIn ? 'Operator Dashboard (Logged In)' : 'Admin Login (Password: Sunball##12)'}
            >
              <span className="material-symbols-outlined text-[16px] text-amber-400">
                {isAdminLoggedIn ? 'admin_panel_settings' : 'lock'}
              </span>
              <span>{isAdminLoggedIn ? 'Dashboard' : 'Admin'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isAdminLoggedIn ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></span>
            </button>
          )}

          {/* Book Adventure CTA */}
          <button
            type="button"
            onClick={() => onOpenBooking()}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#D97706] hover:from-[#C2410C] hover:to-[#EA580C] text-white text-[11px] sm:text-[12px] uppercase tracking-wider font-bold shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 transition-all cursor-pointer active:scale-98"
          >
            Book Adventure
          </button>

          {/* Concierge WhatsApp Trigger */}
          <button
            type="button"
            onClick={onOpenWhatsApp}
            title="Chat with VIP Concierge on WhatsApp"
            className="w-9 h-9 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 p-1.5 shadow-xs hover:scale-105 transition-all cursor-pointer"
          >
            <WhatsAppLogo className="w-6 h-6" />
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
            <button
              onClick={() => {
                onOpenWhatsApp();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              <WhatsAppLogo className="w-5 h-5" />
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
                <span className="material-symbols-outlined text-[18px]">
                  {isAdminLoggedIn ? 'admin_panel_settings' : 'lock'}
                </span>
                <span>{isAdminLoggedIn ? 'Operator Admin Portal' : 'Secure Admin Login'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
