import React, { useState, useEffect, useRef } from 'react';
import { Currency, Experience } from '../types';
import { WhatsAppLogo } from './icons/WhatsAppLogo';

interface AiBookingAgentWidgetProps {
  currency: Currency;
  onOpenBooking: (experienceId?: string) => void;
  onOpenWhatsApp: () => void;
  experiences?: Experience[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  actionCard?: {
    type: 'price_quote' | 'voucher' | 'quick_booking' | 'faq';
    data: any;
  };
}

export const AiBookingAgentWidget: React.FC<AiBookingAgentWidgetProps> = ({
  currency,
  onOpenBooking,
  onOpenWhatsApp,
  experiences,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: "Marhaban! 🐪 I am your **Phoenix AI Desert Concierge**.\n\nI can help with tour information and prices. Use Book Now to request a booking, or contact our team to confirm availability and pickup details.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: '💰 Evening Safari Price', query: 'Calculate price for 2 Adults and 1 Child (age 5) on Evening Desert Safari' },
    { label: '🏎️ Can-Am 2-Seater Buggy', query: 'What is the price for Can-Am 2-Seater dune buggy for 30 mins?' },
    { label: '👶 Safety & Pregnancy', query: 'Is dune bashing safe for pregnant women and small toddlers?' },
    { label: '📅 Availability Tomorrow', query: 'Check availability for Evening Desert Safari for tomorrow' },
    { label: '🍽️ Buffet Dinner Menu', query: 'What is included in the 5-star desert safari camp dinner menu?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-8).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      if (!response.ok) throw new Error(`Chat request failed: ${response.status}`);
      const data = await response.json();
      if (data.ok !== true || typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error('Invalid chat response');
      }

      let replyText = data.reply || "I'm here to assist you! You can ask about our safaris, Can-Am buggies, quad biking, or book directly with 100% pay on arrival.";
      let actionCard = data.actionCard;

      const agentMsg: ChatMessage = {
        id: 'agent-' + Date.now(),
        sender: 'agent',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionCard: actionCard,
      };

      setMessages((prev) => [...prev, agentMsg]);
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      const fallbackText = "I couldn't reach our chat service just now. Please try again, or tap WhatsApp to contact our team at +971 56 150 5270 for current prices and confirmed availability.";

      const agentMsg: ChatMessage = {
        id: 'agent-' + Date.now(),
        sender: 'agent',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-4 sm:left-8 z-40 font-sans">
      {/* Expanded Agent Chat Window */}
      {isOpen && (
        <div
          className={`w-[92vw] sm:w-[420px] bg-[#181514] text-[#FAF6F0] rounded-2xl shadow-2xl border border-amber-500/40 overflow-hidden flex flex-col transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[580px] max-h-[85vh]'
          }`}
          role="dialog"
          aria-label="Phoenix AI Safari Booking Agent"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 px-4 py-3 border-b border-amber-500/30 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 flex items-center justify-center shadow-inner">
                  <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-amber-400">smart_toy</span>
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-stone-950 animate-pulse"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white font-serif">Phoenix AI Concierge</h3>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.2 rounded border border-amber-500/40">
                    24/7 Agent
                  </span>
                </div>
                <p className="text-[10px] text-stone-400">Instant Quotes • Availability • Vouchers</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-stone-400 hover:text-white p-1 rounded hover:bg-stone-800 transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isMinimized ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded hover:bg-stone-800 transition-colors cursor-pointer"
                title="Close Agent"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#12100F] text-xs scrollbar-thin scrollbar-thumb-stone-800">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 font-medium rounded-br-none'
                          : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-bl-none'
                      }`}
                    >
                      <div className="whitespace-pre-line prose prose-invert prose-xs">
                        {msg.text}
                      </div>

                      {/* Optional Action Card */}
                      {msg.actionCard && msg.actionCard.type === 'price_quote' && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-stone-950/80 border border-amber-500/40 space-y-1.5 text-stone-200 text-[11px]">
                          <div className="flex items-center justify-between text-amber-300 font-bold">
                            <span>{msg.actionCard.data.tour || 'Quote'}</span>
                            <span className="text-sm text-emerald-400">AED {msg.actionCard.data.total_aed}</span>
                          </div>
                          {msg.actionCard.data.breakdown && (
                            <p className="text-stone-400 text-[10px]">{msg.actionCard.data.breakdown}</p>
                          )}
                          <div className="flex items-center justify-between pt-1 text-[10px] text-stone-400 border-t border-stone-800">
                            {msg.actionCard.data?.payment_policy === 'advance_only' ||
                            (msg.actionCard.data?.tour || '').toLowerCase().includes('burj') ||
                            (msg.actionCard.data?.tour || '').toLowerCase().includes('skydive') ||
                            (msg.actionCard.data?.tour || '').toLowerCase().includes('miracle') ? (
                              <span className="text-amber-400 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                Advance Payment (E-Ticket)
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                100% Pay on Arrival
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setIsOpen(false);
                                const tourTitleLower = (msg.actionCard?.data?.tour || '').toLowerCase();
                                const expId = tourTitleLower.includes('burj')
                                  ? 'burj-khalifa-124-125'
                                  : tourTitleLower.includes('buggy') || tourTitleLower.includes('can-am')
                                  ? 'can-am-buggy-safari'
                                  : tourTitleLower.includes('quad')
                                  ? 'quad-bike-atv-rental'
                                  : 'evening-desert-safari';
                                onOpenBooking(expId);
                              }}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded cursor-pointer transition-colors"
                            >
                              Book This
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-stone-500 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-stone-400 text-xs bg-stone-900/80 p-2.5 rounded-xl w-fit border border-stone-800">
                    <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></span>
                    <span className="italic text-[11px]">Phoenix AI is calculating...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="px-3 py-2 bg-stone-950 border-t border-stone-800 overflow-x-auto scrollbar-none flex items-center gap-1.5">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(p.query)}
                    className="shrink-0 px-2.5 py-1 rounded-full bg-stone-900 hover:bg-stone-800 border border-amber-500/20 text-stone-300 hover:text-amber-300 text-[10px] font-medium transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-2.5 bg-stone-900 border-t border-stone-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask a question or request a booking..."
                  className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="w-9 h-9 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md shrink-0"
                  aria-label="Send message to AI Agent"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>

              {/* UltraMsg WhatsApp Direct Link */}
              <div className="bg-[#0f0d0c] px-3 py-1.5 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Grounded in Live DTCM Fleet
                </span>
                <button
                  type="button"
                  onClick={onOpenWhatsApp}
                  className="text-stone-400 hover:text-[#25D366] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <WhatsAppLogo className="w-3.5 h-3.5" />
                  <span>WhatsApp VIP Desk</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Trigger Pill */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-gradient-to-r from-stone-950 via-[#1e1713] to-stone-950 hover:from-black hover:to-stone-900 text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-2xl border border-amber-500/40 hover:border-amber-400 transition-all duration-300 hover:scale-105 cursor-pointer"
          aria-label="Open Phoenix AI Safari Booking Agent"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center">
                <span className="material-symbols-outlined text-[17px] text-amber-400">smart_toy</span>
              </div>
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-stone-950 animate-ping"></span>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-stone-950"></span>
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-300 tracking-wide font-serif">
                Phoenix AI Agent
              </span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-1 rounded border border-emerald-500/30">
                LIVE
              </span>
            </div>
            <span className="text-[10px] text-stone-400">Ask quotes &amp; book instantly</span>
          </div>

          <span className="material-symbols-outlined text-[16px] text-amber-400/80 group-hover:translate-x-0.5 transition-transform ml-1">
            chat
          </span>
        </button>
      )}
    </div>
  );
};

