import React, { useState, useEffect } from 'react';
import { Experience, B2BTourRaw, B2BBookingRecord } from '../../types';

interface B2BIntegrationManagerProps {
  experiences: Experience[];
  onAddExperience: (exp: Experience) => void;
  onUpdateExperience: (exp: Experience) => void;
  onDeleteExperience: (id: string) => void;
  showToast: (msg: string) => void;
}

// Helper to extract official CDN images from B2B.Tickets API
export function extractB2BTourImage(
  tour: any,
  fallback = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80'
): string {
  if (!tour) return fallback;

  // 1. Try heroImage srcSet
  if (tour.heroImage?.srcSet && Array.isArray(tour.heroImage.srcSet)) {
    for (const set of tour.heroImage.srcSet) {
      if (set.sizes && Array.isArray(set.sizes) && set.sizes.length > 0) {
        const bestSize =
          set.sizes.find((s: any) => s.width >= 1280) ||
          set.sizes.find((s: any) => s.width >= 640) ||
          set.sizes[0];
        if (bestSize?.src) return bestSize.src;
      }
    }
  }

  // 2. Try photos array
  if (tour.photos && Array.isArray(tour.photos) && tour.photos.length > 0) {
    for (const photo of tour.photos) {
      if (photo.srcSet && Array.isArray(photo.srcSet)) {
        for (const set of photo.srcSet) {
          if (set.sizes && Array.isArray(set.sizes) && set.sizes.length > 0) {
            const bestSize =
              set.sizes.find((s: any) => s.width >= 1280) ||
              set.sizes.find((s: any) => s.width >= 640) ||
              set.sizes[0];
            if (bestSize?.src) return bestSize.src;
          }
        }
      }
    }
  }

  return fallback;
}

export const B2BIntegrationManager: React.FC<B2BIntegrationManagerProps> = ({
  experiences,
  onAddExperience,
  onUpdateExperience,
  onDeleteExperience,
  showToast,
}) => {
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [b2bStatus, setB2bStatus] = useState<{
    connected: boolean;
    agencyId?: number;
    balance?: number;
    creditFacility?: number;
    payableBalance?: number;
    error?: string;
  }>({ connected: false });

  const [b2bTours, setB2bTours] = useState<B2BTourRaw[]>([]);
  const [loadingTours, setLoadingTours] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [defaultMarkupPercent, setDefaultMarkupPercent] = useState<number>(20);
  const [selectedTourDetail, setSelectedTourDetail] = useState<any>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);

  const [b2bBookings, setB2bBookings] = useState<B2BBookingRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'imported' | 'bookings'>('catalog');

  // Fetch B2B API Status
  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/b2b/status');
      const data = await res.json();
      setB2bStatus(data);
      if (data.connected) {
        showToast(`🟢 B2B.Tickets API connected! Agency ID: #${data.agencyId}`);
      }
    } catch (err: any) {
      setB2bStatus({ connected: false, error: err.message });
      showToast(`❌ Failed to connect to B2B API: ${err.message}`);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Fetch live B2B catalog
  const fetchTours = async () => {
    setLoadingTours(true);
    try {
      const res = await fetch('/api/b2b/tours');
      const data = await res.json();
      if (Array.isArray(data)) {
        setB2bTours(data);
      } else {
        showToast('Notice: Could not load tour catalog from supplier');
      }
    } catch (err: any) {
      showToast(`❌ Error loading B2B tours: ${err.message}`);
    } finally {
      setLoadingTours(false);
    }
  };

  // Fetch B2B Booking logs
  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/b2b/bookings');
      const data = await res.json();
      if (data?.records) {
        setB2bBookings(data.records);
      }
    } catch (err) {
      console.warn('Error fetching B2B bookings', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchTours();
    fetchBookings();
  }, []);

  // Inspect tour detail
  const handleInspectTour = async (tourId: number) => {
    setLoadingDetailId(tourId);
    try {
      const res = await fetch(`/api/b2b/tours/${tourId}`);
      const data = await res.json();
      setSelectedTourDetail(data);
    } catch (err: any) {
      showToast(`Failed to load details for tour #${tourId}`);
    } finally {
      setLoadingDetailId(null);
    }
  };

  // 1-Click Import B2B Tour into Phoenix Catalog
  const handleImportTour = async (tour: B2BTourRaw, customMarkup = defaultMarkupPercent) => {
    try {
      let detail = selectedTourDetail?.id === tour.id ? selectedTourDetail : null;
      if (!detail) {
        const res = await fetch(`/api/b2b/tours/${tour.id}`);
        detail = await res.json();
      }

      const primaryOffer = detail?.offers?.[0];
      const supplierBasePrice = primaryOffer?.pricingPeriods?.[0]?.pricePerAdult || 100;
      const calculatedSellingPrice = Math.round(supplierBasePrice * (1 + customMarkup / 100));

      // Extract high-res image directly from API
      const imageUrl = extractB2BTourImage(detail || tour);

      const newExperience: Experience = {
        id: `b2b-${tour.id}-${Date.now().toString().slice(-4)}`,
        category: 'city-tours',
        categoryLabel: 'B2B Partner Tours & Attractions',
        title: tour.name,
        subtitle: primaryOffer?.name || 'Live B2B Reseller Inventory',
        badge: 'Partner Attraction',
        badgeColor: 'from-blue-600 to-indigo-600',
        duration: primaryOffer?.numberOfHours ? `${primaryOffer.numberOfHours} Hours` : 'Flexible',
        priceAED: calculatedSellingPrice,
        priceUnit: 'From / Person',
        description: detail?.salesDescription?.replace(/<[^>]*>?/gm, '').slice(0, 240) || 'Official B2B supplier tour with instant voucher and guaranteed entry.',
        image: imageUrl,
        altText: tour.name,
        highlights: [
          'Instant Official E-Ticket / Voucher',
          'Free Date Rescheduling Support',
          `Supplier Base Cost: AED ${supplierBasePrice}`,
          `Estimated Profit Margin: AED ${calculatedSellingPrice - supplierBasePrice} (${customMarkup}%)`,
        ],
        hotelPickup: !primaryOffer?.isDirectReporting,
        featured: false,
        inventorySource: 'b2b_tickets',
        b2bTourId: tour.id,
        b2bOfferId: primaryOffer?.id,
        b2bSupplierPriceAED: supplierBasePrice,
        b2bMarkupPercent: customMarkup,
        b2bStatus: 'active',
      };

      onAddExperience(newExperience);
      showToast(`🎉 Imported "${tour.name}" to Phoenix Catalog at AED ${calculatedSellingPrice}!`);
    } catch (err: any) {
      showToast(`❌ Failed to import tour: ${err.message}`);
    }
  };

  const currentlyImported = experiences.filter(e => e.inventorySource === 'b2b_tickets');

  const filteredB2bTours = b2bTours.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Supplier Live Connection Card */}
      <div className="bg-gradient-to-r from-stone-900 via-[#2A1B18] to-stone-900 rounded-2xl p-6 border border-amber-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-stone-950 flex items-center justify-center font-bold text-2xl shrink-0 shadow-lg shadow-amber-500/20">
            <span className="material-symbols-outlined text-[32px]">hub</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-xl font-bold font-serif">B2B.Tickets Supplier Gateway</h3>
              {b2bStatus.connected ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Connected (Agency #{b2bStatus.agencyId || 1650})
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
                  Checking Connection...
                </span>
              )}
            </div>
            <p className="text-xs text-stone-300 mt-1 max-w-xl">
              Resell live Dubai excursions, dhow cruises, theme park tickets, and luxury tours directly through your Phoenix website with automated markups and supplier synchronization.
            </p>
          </div>
        </div>

        {/* Agency Balance & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-stone-800">
          <div className="bg-stone-950/80 px-4 py-2.5 rounded-xl border border-stone-800 text-right">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Supplier Wallet Balance</span>
            <span className="text-lg font-bold text-amber-400">
              AED {b2bStatus.balance !== undefined ? b2bStatus.balance.toFixed(2) : '0.00'}
            </span>
          </div>
          <button
            type="button"
            disabled={loadingStatus}
            onClick={() => {
              fetchStatus();
              fetchTours();
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <span className={`material-symbols-outlined text-[16px] ${loadingStatus ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Sync Supplier</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'bg-stone-900 text-white shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">travel_explore</span>
          <span>Supplier Catalog ({b2bTours.length} Available)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('imported')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'imported'
              ? 'bg-stone-900 text-white shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">storefront</span>
          <span>Active Imported Tours ({currentlyImported.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-stone-900 text-white shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">receipt_long</span>
          <span>Supplier Bookings &amp; Logs ({b2bBookings.length})</span>
        </button>
      </div>

      {/* TAB 1: B2B CATALOG EXPLORER */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-stone-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search 78+ B2B supplier tours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <label className="text-xs font-bold text-stone-700 whitespace-nowrap">
                Default Markup Margin:
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={defaultMarkupPercent}
                  onChange={(e) => setDefaultMarkupPercent(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-center outline-none focus:border-amber-500"
                />
                <span className="text-xs font-bold text-stone-600">%</span>
              </div>
            </div>
          </div>

          {/* Tours Grid */}
          {loadingTours ? (
            <div className="py-20 text-center text-stone-500 text-sm flex flex-col items-center gap-2">
              <span className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>
              <span>Fetching live B2B.Tickets catalog from supplier gateway...</span>
            </div>
          ) : filteredB2bTours.length === 0 ? (
            <div className="p-12 text-center text-stone-500 bg-white rounded-xl border border-stone-200 text-xs">
              No tours found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredB2bTours.map((tour) => {
                const isAlreadyImported = experiences.some(e => e.b2bTourId === tour.id);
                const tourImg = extractB2BTourImage(tour);

                return (
                  <div
                    key={tour.id}
                    className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    {/* Tour Photo from API */}
                    <div className="relative h-36 w-full bg-stone-100 overflow-hidden">
                      <img
                        src={tourImg}
                        alt={tour.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                        Supplier ID: #{tour.id}
                      </div>
                      {isAlreadyImported && (
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                          <span className="material-symbols-outlined text-[12px]">check</span>
                          Imported
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider block">
                          {tour.categories?.map(c => c.name).join(', ') || 'Attraction / Excursion'}
                        </span>
                        <h4 className="font-bold text-stone-900 text-sm line-clamp-2 leading-snug mt-0.5">
                          {tour.name}
                        </h4>
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleInspectTour(tour.id)}
                        className="text-xs font-bold text-stone-600 hover:text-stone-900 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        <span>{loadingDetailId === tour.id ? 'Loading...' : 'View Offers'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleImportTour(tour)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          isAlreadyImported
                            ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                            : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isAlreadyImported ? 'sync' : 'add'}
                        </span>
                        <span>{isAlreadyImported ? 'Re-Sync' : `Import (+${defaultMarkupPercent}%)`}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE IMPORTED B2B TOURS */}
      {activeTab === 'imported' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 flex items-center justify-between">
            <div>
              <strong className="block font-bold">Hybrid Inventory Manager</strong>
              <span>
                These tours are live on your storefront as B2B reseller products. You can edit selling prices or disable them without affecting your direct desert fleet.
              </span>
            </div>
            <span className="px-3 py-1 bg-amber-200 font-bold rounded-lg text-amber-900 text-xs shrink-0">
              {currentlyImported.length} Active Products
            </span>
          </div>

          {currentlyImported.length === 0 ? (
            <div className="p-12 text-center text-stone-500 bg-white rounded-xl border border-stone-200 text-xs space-y-2">
              <span className="material-symbols-outlined text-[36px] text-stone-300 block">inventory_2</span>
              <p>No B2B supplier tours have been imported yet.</p>
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className="px-4 py-2 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs cursor-pointer hover:bg-amber-400"
              >
                Browse Supplier Catalog to Import
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Tour Name</th>
                    <th className="p-3">Supplier Cost</th>
                    <th className="p-3">Your Selling Price</th>
                    <th className="p-3">Profit Margin</th>
                    <th className="p-3">Inventory Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {currentlyImported.map((exp) => {
                    const profit = (exp.priceAED || 0) - (exp.b2bSupplierPriceAED || 0);

                    return (
                      <tr key={exp.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3 font-semibold">
                          <div className="font-bold text-stone-900">{exp.title}</div>
                          <span className="text-[10px] text-stone-400">Supplier ID: #{exp.b2bTourId}</span>
                        </td>
                        <td className="p-3 font-mono text-stone-500">
                          AED {exp.b2bSupplierPriceAED || 'N/A'}
                        </td>
                        <td className="p-3 font-bold text-amber-700">
                          AED {exp.priceAED}
                        </td>
                        <td className="p-3 font-bold text-emerald-700">
                          +AED {profit} ({Math.round((profit / (exp.b2bSupplierPriceAED || 1)) * 100)}%)
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Live on Website
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newPrice = prompt(`Enter new selling price for ${exp.title}:`, String(exp.priceAED));
                              if (newPrice && !isNaN(Number(newPrice))) {
                                onUpdateExperience({ ...exp, priceAED: Number(newPrice) });
                                showToast(`Updated price for ${exp.title} to AED ${newPrice}`);
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] cursor-pointer"
                          >
                            Edit Price
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove "${exp.title}" from your storefront?`)) {
                                onDeleteExperience(exp.id);
                                showToast(`Removed ${exp.title} from storefront.`);
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUPPLIER BOOKINGS LOG */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <h4 className="font-bold text-stone-900 text-sm">Automated Supplier Booking Dispatches</h4>
              <button
                type="button"
                onClick={fetchBookings}
                className="text-xs font-bold text-amber-700 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>Refresh Log</span>
              </button>
            </div>

            {b2bBookings.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                No B2B supplier bookings logged yet. When customers book imported tours, records will appear here with both Phoenix Ref and Supplier Ref.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Phoenix Ref</th>
                    <th className="p-3">Supplier Ref</th>
                    <th className="p-3">Tour</th>
                    <th className="p-3">Guest</th>
                    <th className="p-3">Date &amp; Pax</th>
                    <th className="p-3">Revenue / Cost</th>
                    <th className="p-3">Profit Margin</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {b2bBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-50">
                      <td className="p-3 font-mono font-bold text-[#EA580C]">{b.phoenixRef}</td>
                      <td className="p-3 font-mono text-blue-700">{b.b2bBookingId}</td>
                      <td className="p-3 font-semibold">{b.tourName}</td>
                      <td className="p-3">{b.guestName}</td>
                      <td className="p-3">{b.tourDate} ({b.pax} Pax)</td>
                      <td className="p-3 font-bold">AED {b.totalAED} (Cost: AED {b.supplierCostAED})</td>
                      <td className="p-3 font-bold text-emerald-700">+AED {b.profitMarginAED}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tour Detail Modal Inspection */}
      {selectedTourDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">
                  B2B Supplier Tour #{selectedTourDetail.id}
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-1">{selectedTourDetail.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTourDetail(null)}
                className="text-stone-400 hover:text-stone-900 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* API Hero Image Banner */}
            <div className="relative h-48 sm:h-60 w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
              <img
                src={extractB2BTourImage(selectedTourDetail)}
                alt={selectedTourDetail.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-stone-950 font-bold text-[10px] uppercase">
                  Official API Live Image
                </span>
                <div className="text-xs text-stone-200 mt-1 line-clamp-2">
                  {selectedTourDetail.salesDescription?.replace(/<[^>]*>?/gm, '').slice(0, 140)}...
                </div>
              </div>
            </div>

            {/* Additional API Photos Gallery Strip */}
            {selectedTourDetail.photos && selectedTourDetail.photos.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  API Photo Gallery ({selectedTourDetail.photos.length} Photos):
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {selectedTourDetail.photos.map((photo: any, idx: number) => {
                    const photoSrc =
                      photo.srcSet?.[0]?.sizes?.find((s: any) => s.width >= 640)?.src ||
                      photo.srcSet?.[0]?.sizes?.[0]?.src;
                    if (!photoSrc) return null;
                    return (
                      <img
                        key={idx}
                        src={photoSrc}
                        alt={`Photo ${idx + 1}`}
                        className="h-16 w-24 object-cover rounded-lg border border-stone-200 shrink-0 hover:opacity-90 cursor-pointer"
                        onClick={() => window.open(photoSrc, '_blank')}
                        title="Click to view full photo"
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-t border-stone-100 pt-3 space-y-3">
              <h4 className="text-xs font-bold uppercase text-stone-500">Available Supplier Offers &amp; Rates:</h4>
              <div className="space-y-2">
                {selectedTourDetail.offers?.map((offer: any) => {
                  const pricing = offer.pricingPeriods?.[0];
                  return (
                    <div key={offer.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>{offer.name}</span>
                        <span className="text-emerald-700 font-mono">
                          Supplier Cost: AED {pricing?.pricePerAdult || 'N/A'} (RRP: AED {pricing?.recPricePerAdult || 'N/A'})
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">{offer.code}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTourDetail(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs cursor-pointer hover:bg-stone-200"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleImportTour(selectedTourDetail);
                  setSelectedTourDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs cursor-pointer hover:bg-amber-400 shadow-md"
              >
                Import to Phoenix (+{defaultMarkupPercent}% Markup)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
