import React from 'react';

interface TestimonialsSectionProps {
  onOpenWriteReview?: () => void;
  onSeeMoreReviews?: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  onOpenWriteReview,
  onSeeMoreReviews,
}) => {
  const reviews = [
    {
      id: 'rev-1',
      stars: 5,
      quote:
        'The Phoenix Tours made our Dubai trip absolutely unforgettable. Everything from the red dune bashing to the live camp BBQ was perfectly planned!',
      author: 'Sarah M.',
      country: 'USA',
      flag: '🇺🇸',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'rev-2',
      stars: 5,
      quote:
        'Amazing service, great communication, and the best direct travel deals. Zero deposit required — we paid directly on arrival. Highly recommended!',
      author: 'James T.',
      country: 'California, USA',
      flag: '🇺🇸',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'rev-3',
      stars: 5,
      quote:
        'From start to finish, our experience was flawless. The driver was so polite and the Can-Am buggies were incredible. The team truly cares about their customers.',
      author: 'Emily R.',
      country: 'London, UK',
      flag: '🇬🇧',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <section id="reviews" className="w-full py-20 bg-[#F8FAFC] border-b border-stone-200/60 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-[#0284C7] uppercase tracking-widest block mb-1">
              TESTIMONIALS
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0F172A] tracking-tight">
              What Our Travelers Say
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-xl">
              Real feedback from guests who explored Dubai with our direct fleet and guides.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {onOpenWriteReview && (
              <button
                type="button"
                onClick={onOpenWriteReview}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-300 hover:border-[#0284C7] bg-white text-xs font-bold text-stone-700 hover:text-[#0284C7] transition-all cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-500">rate_review</span>
                <span>Write a Review</span>
              </button>
            )}
            <button
              type="button"
              onClick={onSeeMoreReviews}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0284C7] hover:text-[#0369A1] transition-colors cursor-pointer group"
            >
              <span>See More Reviews</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </div>

        {/* 3 Review Cards (Matches reference design) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* 5 Gold Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(rev.stars)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic mb-6">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              {/* Reviewer Info Row */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-stone-100">
                <img
                  src={rev.avatar}
                  alt={rev.author}
                  className="w-11 h-11 rounded-full object-cover border-2 border-stone-100 shrink-0"
                  loading="lazy"
                />
                <div>
                  <div className="text-sm font-bold text-[#0F172A] leading-tight">{rev.author}</div>
                  <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                    <span>{rev.flag}</span>
                    <span>{rev.country}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
