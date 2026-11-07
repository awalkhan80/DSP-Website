import React from 'react';

export const GalleryStrip: React.FC = () => {
  const photos = [
    {
      id: 'g-1',
      title: 'Golden Sunset Dunes',
      url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'g-2',
      title: 'Dubai Skyline & Marina',
      url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'g-3',
      title: 'Dune Buggy Convoy',
      url: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'g-4',
      title: 'Airplane Over Sunset',
      url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'g-5',
      title: 'Desert Oasis Palms',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'g-6',
      title: 'Arabian Heritage Coast',
      url: 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=500&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <section className="w-full py-10 bg-white border-b border-stone-200/60 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* 6 Thumbnail Row (Matches reference design) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 flex-1 w-full">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative h-24 rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md hover:scale-105 transition-all duration-300 group"
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
            </div>
          ))}
        </div>

        {/* Script Accent: Travel More ✈️ */}
        <div className="shrink-0 flex items-center justify-center md:pl-4">
          <div className="flex flex-col items-center select-none text-stone-800">
            <span
              className="text-2xl sm:text-3xl font-serif italic text-[#0B1E33] tracking-wide flex items-center gap-1.5"
              style={{ fontFamily: "'Playfair Display', Georgia, cursive" }}
            >
              Travel More
              <span className="material-symbols-outlined text-[20px] text-[#0284C7] not-italic rotate-45">
                flight
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
