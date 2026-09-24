import React, { useState } from 'react';
import { Review } from '../types';

interface ReviewsSectionProps {
  reviews: Review[];
  onOpenWriteReview: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, onOpenWriteReview }) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter((r) => r.experienceType.toLowerCase().includes(filter.toLowerCase()));

  return (
    <section id="reviews" className="w-full py-16 bg-[#F5ECE1] scroll-mt-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        {/* Review Header Badge */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="flex text-[#F59E0B]">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="text-xl text-stone-900 font-bold ml-1 font-serif">
                5.0 / 5.0 Official Rating
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl text-stone-900 font-semibold font-serif">
              Verified Google Guest Experiences
            </h2>
            <p className="text-sm text-stone-600">
              Real testimonials from tourists and VIP clients exploring Dubai with The Phoenix.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              className="px-4 py-2.5 rounded-full bg-white border border-stone-200 text-stone-800 hover:text-[#EA580C] flex items-center gap-2 text-xs font-semibold transition-colors shadow-sm"
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              <span>@phoenixdesertsafari</span>
            </a>
            <button
              type="button"
              onClick={onOpenWriteReview}
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#EA580C] to-[#D97706] text-white flex items-center gap-2 text-xs font-bold shadow-md shadow-orange-500/20 hover:brightness-105 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">reviews</span>
              <span>Write a Google Review</span>
            </button>
          </div>
        </div>

        {/* Filter tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-2 scrollbar-none">
          <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider mr-1">
            Filter:
          </span>
          {[
            { id: 'all', label: 'All Reviews' },
            { id: 'evening', label: 'Evening Safari' },
            { id: 'vip', label: 'VIP Private' },
            { id: 'buggy', label: 'Can-Am & Buggy' },
            { id: 'city', label: 'City Tours' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                filter === tab.id
                  ? 'bg-stone-900 text-white font-bold'
                  : 'bg-white/80 text-stone-700 hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reviews Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-white border border-amber-100 flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-[#F59E0B]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    Verified Google Traveler
                  </span>
                </div>
                <p className="text-sm text-stone-700 italic leading-relaxed">{rev.content}</p>
              </div>

              <div className="pt-4 flex items-center gap-3 border-t border-stone-100 mt-4">
                <div
                  className={`w-10 h-10 rounded-full font-serif font-bold text-lg flex items-center justify-center shrink-0 ${rev.avatarBg}`}
                >
                  {rev.avatarInitial}
                </div>
                <div className="min-w-0">
                  <span className="text-xs text-stone-900 block font-bold truncate">
                    {rev.author}
                  </span>
                  <span className="text-[11px] text-stone-500 truncate block">
                    {rev.location} • {rev.experienceType}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
