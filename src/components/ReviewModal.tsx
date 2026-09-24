import React, { useState } from 'react';
import { Review } from '../types';

interface ReviewModalProps {
  onClose: () => void;
  onSubmitReview: (review: Review) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ onClose, onSubmitReview }) => {
  const [author, setAuthor] = useState('');
  const [location, setLocation] = useState('');
  const [experienceType, setExperienceType] = useState('Evening Desert Safari');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    const initial = author.trim().charAt(0).toUpperCase();
    const newRev: Review = {
      id: 'rev-' + Date.now(),
      author: author.trim(),
      location: location.trim() || 'Dubai Visitor',
      experienceType,
      rating,
      date: 'Just now',
      content: `"${content.trim()}"`,
      avatarInitial: initial,
      avatarBg: 'bg-amber-100 text-[#EA580C]',
      verified: true,
    };

    onSubmitReview(newRev);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] rounded-2xl sm:rounded-3xl border border-amber-200/80 shadow-2xl max-w-lg w-full overflow-hidden text-stone-900 relative">
        <div className="bg-gradient-to-r from-[#D97706] to-[#EA580C] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">reviews</span>
            <div>
              <h3 className="font-serif font-bold text-lg">Write a Google Review</h3>
              <span className="text-[11px] text-amber-200 uppercase tracking-widest font-semibold">
                Desert Safari Dubai - The Phoenix
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Star Rating</label>
            <div className="flex items-center gap-1 text-[#F59E0B]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <span
                    className="material-symbols-outlined text-[30px]"
                    style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                </button>
              ))}
              <span className="text-sm font-bold text-stone-700 ml-2">{rating}.0 / 5.0</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah Jenkins"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full text-sm p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#EA580C] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Origin / Country
              </label>
              <input
                type="text"
                placeholder="e.g. Sydney, Australia"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-sm p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#EA580C] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Safari Experience</label>
            <select
              value={experienceType}
              onChange={(e) => setExperienceType(e.target.value)}
              className="w-full text-sm p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#EA580C] outline-none"
            >
              <option value="Evening Desert Safari">Evening Desert Safari</option>
              <option value="Morning Desert Safari">Morning Desert Safari</option>
              <option value="Private VIP Safari">Private Desert Safari VIP</option>
              <option value="Can-Am Dune Buggy">Can-Am Dune Buggy 1000cc</option>
              <option value="Quad Bike ATV Rental">Quad Bike ATV Rental</option>
              <option value="Dubai Half-Day City Tour">Dubai Half-Day City Tour</option>
              <option value="Abu Dhabi City Tour">Abu Dhabi City Tour</option>
              <option value="Marina Luxury Dhow Cruise">Marina Luxury Dhow Cruise</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Your Review / Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Tell other travelers about your dune bashing marshal, camp dinner quality, and overall service..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-sm p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#EA580C] outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-amber-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#D97706] hover:from-[#C2410C] hover:to-[#EA580C] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 cursor-pointer"
            >
              Post Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
