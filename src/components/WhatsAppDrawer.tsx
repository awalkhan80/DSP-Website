import React, { useState } from 'react';

interface WhatsAppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const WhatsAppDrawer: React.FC<WhatsAppDrawerProps> = ({ isOpen, onClose, onOpen }) => {
  const [customQuery, setCustomQuery] = useState('');

  const quickQueries = [
    'Check today\'s Evening Desert Safari availability',
    'Quote for Private Land Cruiser VIP Safari (up to 6 guests)',
    'Book Can-Am Buggy Maverick 1000cc for tomorrow',
    'Question about hotel pickup timings in Dubai Marina',
  ];

  const handleSend = (textToSend: string) => {
    const message = encodeURIComponent(
      `Hello Phoenix Desert Safari Concierge!\n\n${textToSend}`
    );
    window.open(`https://wa.me/971561505270?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Floating Action Button at Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-200 shadow-lg text-xs font-semibold text-stone-800 animate-bounce duration-1000">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>24/7 VIP Concierge Online</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => (isOpen ? onClose() : onOpen())}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer relative"
          aria-label="WhatsApp VIP Concierge"
        >
          <span className="material-symbols-outlined text-[28px]">chat</span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EA580C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            1
          </span>
        </button>
      </div>

      {/* Concierge Chat Popup Box */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
                  <span className="material-symbols-outlined text-[22px]">support_agent</span>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-300 border-2 border-emerald-700"></div>
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Phoenix VIP Concierge</h4>
                <span className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  Replies in &lt; 2 minutes
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 bg-[#FAF6F0] max-h-96 overflow-y-auto">
            {/* Operator greeting bubble */}
            <div className="bg-white p-3 rounded-2xl rounded-tl-xs border border-stone-200 text-xs text-stone-800 space-y-1 shadow-2xs">
              <p className="font-semibold text-stone-900">
                Marhaba! Welcome to The Phoenix Desert Safari Dubai.
              </p>
              <p className="text-stone-600">
                I am your direct safari marshal and guest coordinator at our Business Bay office. How
                may I assist your Arabian adventure today?
              </p>
              <span className="text-[10px] text-stone-400 block text-right">Just now</span>
            </div>

            {/* Quick action buttons */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Frequent Inquiries:
              </span>
              {quickQueries.map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(query)}
                  className="w-full text-left text-xs bg-white hover:bg-amber-50 p-2.5 rounded-xl border border-stone-200 text-stone-800 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate pr-2">{query}</span>
                  <span className="material-symbols-outlined text-[16px] text-stone-400 group-hover:text-emerald-600 shrink-0">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="pt-2">
              <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-1 shadow-2xs">
                <input
                  type="text"
                  placeholder="Type inquiry here..."
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customQuery.trim()) {
                      handleSend(customQuery);
                    }
                  }}
                  className="w-full text-xs px-2 py-1.5 outline-none text-stone-800"
                />
                <button
                  type="button"
                  onClick={() => customQuery.trim() && handleSend(customQuery)}
                  className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </div>
            </div>

            {/* Direct Call Alternative */}
            <div className="text-center pt-1">
              <a
                href="tel:0561505270"
                className="text-[11px] font-bold text-[#EA580C] hover:underline flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">call</span>
                <span>Prefer a quick phone call? 056 150 5270</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
