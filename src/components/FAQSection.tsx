import React, { useState } from 'react';

export interface FAQItem {
  question: string;
  answer: string;
  category: 'booking' | 'desert-safari' | 'dune-buggy' | 'dress-code' | 'safety';
}

export const FAQ_DATA: FAQItem[] = [
  {
    category: 'desert-safari',
    question: 'What is the best desert safari in Dubai: Morning or Evening?',
    answer:
      'The Evening Desert Safari is the most popular choice for first-time visitors because it includes the complete Arabian experience: 45-minute dune bashing on high Red Lahbab dunes, sunset photography stops, camel rides, sandboarding, and an authentic Bedouin desert camp with live BBQ dinner buffet, Tanoura dancing, fire shows, and belly dancing. In contrast, the Morning Desert Safari (05:00 AM) is ideal if you have limited time, want to capture crisp golden sunrise light over untouched dunes, or wish to avoid evening entertainment.',
  },
  {
    category: 'booking',
    question: 'How much does a Dubai desert safari cost in 2025?',
    answer:
      'Desert safari prices in Dubai vary by package tier. At The Phoenix Desert Safari (direct DTCM licensed operator), standard Evening Desert Safaris start at AED 120 per adult (approx. $32 USD) including 4x4 hotel pickup and dinner buffet. Morning Desert Safaris start from AED 450 per vehicle, while exclusive Private VIP Desert Safaris in a dedicated Land Cruiser 300 Series start at AED 850 per vehicle (up to 6 guests). We do not require upfront deposits—you can pay directly upon hotel pickup via cash or card.',
  },
  {
    category: 'dune-buggy',
    question: 'Do I need an international driving license to drive a dune buggy or quad bike in Dubai?',
    answer:
      'No driving license is required. Self-drive dune buggies (such as our 1000cc Can-Am Maverick X3 Turbo) and quad bikes (220cc to 700cc Raptor ATVs) are operated off-road in designated desert tracks and open dunes. Our DTCM-certified marshals provide a comprehensive 15-minute safety briefing, helmets, and goggles, and an escort marshal car leads your convoy to ensure safe, thrilling navigation across the Lahbab red dunes.',
  },
  {
    category: 'dress-code',
    question: 'What should I wear for a desert safari in Dubai?',
    answer:
      'We recommend comfortable, loose-fitting cotton clothing such as t-shirts, light trousers, or Bermuda shorts. Bring sunglasses, sunscreen, and open sandals, flip-flops, or sneakers that are easy to empty of sand. During winter months (November through March), desert temperatures drop sharply after sunset, so packing a light jacket, hoodie, or shawl is strongly recommended for the evening camp.',
  },
  {
    category: 'safety',
    question: 'Is dune bashing safe for children and pregnant women?',
    answer:
      'All our Toyota Land Cruisers are equipped with reinforced roll cages, first-aid trauma kits, and GPS tracking, driven by DTCM-certified desert marshals. However, vigorous dune bashing is not recommended for pregnant women, infants under 3 years old, or guests with severe spinal or cardiac conditions. For these guests, we gladly arrange a gentle panoramic scenic drive or direct luxury transfer straight to the Bedouin desert camp.',
  },
  {
    category: 'dune-buggy',
    question: 'What is the difference between a quad bike (ATV) and a Can-Am dune buggy?',
    answer:
      'A quad bike (ATV) is an open-air 4-wheel motorcycle (single-rider or tandem) steered with handlebars where you shift your body weight into turns. A dune buggy (like our Can-Am Maverick X3 Turbo) features a roll cage, racing bucket seats with 4-point harnesses, a steering wheel, and a turbo-charged 1000cc engine capable of conquering the highest 300-foot dunes with supreme stability and safety.',
  },
  {
    category: 'booking',
    question: 'What is the cancellation and rescheduling policy?',
    answer:
      'We offer 100% free cancellation and date rescheduling up to 12 hours before your scheduled hotel pickup time. If flight schedules change or weather conditions warrant an adjustment, our 24/7 WhatsApp concierge (+971 56 150 5270) will rebook your expedition immediately with zero penalty fees.',
  },
  {
    category: 'booking',
    question: 'Where does the tour pick up and what areas are covered?',
    answer:
      'We provide complimentary door-to-door hotel and residence pickup in air-conditioned 4x4 vehicles across all central Dubai locations, including Downtown Dubai, Business Bay, Dubai Marina, Palm Jumeirah, JBR, Deira, Bur Dubai, Al Barsha, and Dubai Hills.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredFaqs =
    selectedCategory === 'all'
      ? FAQ_DATA
      : FAQ_DATA.filter((item) => item.category === selectedCategory);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="w-full py-16 bg-[#FAF6F0] scroll-mt-24 border-t border-amber-200/60">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 space-y-2">
          <span className="text-[11px] uppercase tracking-widest text-[#C2410C] font-bold">
            Frequently Asked Questions • Dubai Tourism Guide
          </span>
          <h2 className="text-3xl sm:text-4xl text-stone-900 font-semibold font-serif">
            Dubai Desert Safari &amp; Dune Buggy FAQs
          </h2>
          <p className="text-base text-stone-600">
            Clear, honest answers to essential questions regarding safari timings, dune buggy safety,
            dress codes, pickup logistics, and payment options.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {[
            { id: 'all', label: 'All FAQs' },
            { id: 'desert-safari', label: 'Desert Safari' },
            { id: 'dune-buggy', label: 'Dune Buggy & ATVs' },
            { id: 'booking', label: 'Pricing & Bookings' },
            { id: 'dress-code', label: 'Dress Code & Tips' },
            { id: 'safety', label: 'Safety Guidelines' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:border-amber-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3 max-w-4xl">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-amber-100 overflow-hidden shadow-xs hover:border-amber-300 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <h3 className="text-base sm:text-lg font-serif font-semibold text-stone-900 leading-snug">
                    {faq.question}
                  </h3>
                  <span
                    className={`material-symbols-outlined text-[#EA580C] text-[24px] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-stone-700 leading-relaxed border-t border-amber-50 pt-3">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Additional Concierge Callout */}
        <div className="mt-8 p-5 rounded-2xl bg-amber-50/80 border border-amber-200 max-w-4xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#EA580C] text-[28px]">
              contact_support
            </span>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Have a custom inquiry or large group?</h4>
              <p className="text-xs text-stone-600">
                Our local safari dispatch team in Business Bay is online 24/7 on WhatsApp.
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/971561505270?text=Hello%20Phoenix%20Safari%2C%20I%20have%20a%20question%20about%20booking"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span>WhatsApp Concierge</span>
          </a>
        </div>
      </div>
    </section>
  );
};
