import React, { useState } from 'react';
import { Experience } from '../../types';
import { SeoAuditDashboard } from './SeoAuditDashboard';
import { AdminSession } from '../../utils/adminAuth';

export interface CMSConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  announcementTicker: string;
  showAnnouncement: boolean;
  defaultBookingExperience: string;
  directPhone: string;
  headquarters: string;
  whatsappWebhook: string;
}

export interface AdminBooking {
  id: string;
  voucherCode: string;
  guestName: string;
  phone: string;
  experienceTitle: string;
  date: string;
  timeSlot: string;
  partySize: string;
  totalAED: number;
  hotel: string;
  room: string;
  marshal: string;
  convoyNumber: string;
  status: 'Confirmed' | 'Dispatched' | 'Completed' | 'Pending';
  paymentStatus: 'Paid Online' | 'Cash on Pickup';
}

interface AdminDashboardProps {
  cmsConfig: CMSConfig;
  onUpdateCmsConfig: (updated: CMSConfig) => void;
  experiences: Experience[];
  onUpdateExperience: (updated: Experience) => void;
  onAddExperience: (newExp: Experience) => void;
  onDeleteExperience: (id: string) => void;
  onSwitchToStorefront: () => void;
  adminSession?: AdminSession | null;
  onSignOut?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  cmsConfig,
  onUpdateCmsConfig,
  experiences,
  onUpdateExperience,
  onAddExperience,
  onDeleteExperience,
  onSwitchToStorefront,
  adminSession,
  onSignOut,
}) => {
  // Navigation tabs
  const [activeNav, setActiveNav] = useState<
    'overview-analytics' | 'homepage-cms' | 'tour-catalog-pricing' | 'bookings-convoys' | 'customer-inquiries-whatsapp' | 'seo-audit' | 'settings'
  >('seo-audit');

  // Search & Filters for Tour Table
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'featured' | 'high'>('all');

  // Hero form local states
  const [heroH1, setHeroH1] = useState(cmsConfig.heroTitle);
  const [heroSub, setHeroSub] = useState(cmsConfig.heroSubtitle);
  const [announcementText, setAnnouncementText] = useState(cmsConfig.announcementTicker);
  const [announcementActive, setAnnouncementActive] = useState(cmsConfig.showAnnouncement);
  const [phoneText, setPhoneText] = useState(cmsConfig.directPhone);
  const [hqText, setHqText] = useState(cmsConfig.headquarters);
  const [editingHq, setEditingHq] = useState(false);

  // Drawer modal state for editing or creating a tour
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'edit' | 'create'>('edit');
  const [selectedTour, setSelectedTour] = useState<Experience | null>(null);

  // Drawer form fields
  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerPrice, setDrawerPrice] = useState<number>(120);
  const [drawerBadge, setDrawerBadge] = useState('');
  const [drawerCategory, setDrawerCategory] = useState<'desert-safaris' | 'city-tours' | 'buggies' | 'private-convoys'>('desert-safaris');
  const [drawerDuration, setDrawerDuration] = useState('7 Hours');
  const [drawerTiming, setDrawerTiming] = useState('02:30 PM - 09:30 PM');
  const [drawerPickup, setDrawerPickup] = useState('DAMAC XL Tower, Business Bay / Hotel Lobby');
  const [drawerFeatured, setDrawerFeatured] = useState(true);
  const [drawerVoucherAuto, setDrawerVoucherAuto] = useState(true);
  const [drawerInstantConfirm, setDrawerInstantConfirm] = useState(true);

  // Capacity stats mock data mapping
  const [capacities, setCapacities] = useState<Record<string, { booked: number; max: number }>>({
    'evening-desert-safari': { booked: 38, max: 45 },
    'morning-desert-safari': { booked: 12, max: 20 },
    'private-desert-safari': { booked: 4, max: 6 },
    'quad-bike-atv-rental': { booked: 22, max: 25 },
    'can-am-dune-buggy': { booked: 7, max: 8 },
    'dubai-city-tour': { booked: 28, max: 35 },
    'abu-dhabi-tour': { booked: 18, max: 25 },
    'marina-dhow-cruise': { booked: 32, max: 40 },
  });

  // Mock Bookings Data for "Bookings & Convoys" Tab
  const [bookings, setBookings] = useState<AdminBooking[]>([
    {
      id: 'b1',
      voucherCode: 'PHX-884901',
      guestName: 'Maximilian Sterling',
      phone: '+44 7911 123456',
      experienceTitle: 'Evening Desert Safari',
      date: 'Today',
      timeSlot: '02:30 PM',
      partySize: '4 Adults',
      totalAED: 480,
      hotel: 'Atlantis The Royal, Palm Jumeirah',
      room: 'Ste 1402',
      marshal: 'Captain Rashid (Cruiser #04)',
      convoyNumber: 'Convoy Red Dune A',
      status: 'Confirmed',
      paymentStatus: 'Paid Online',
    },
    {
      id: 'b2',
      voucherCode: 'PHX-884902',
      guestName: 'Elena Rostova',
      phone: '+971 50 987 6543',
      experienceTitle: 'Private Desert Safari VIP',
      date: 'Today',
      timeSlot: '03:00 PM',
      partySize: '2 Adults, 1 Child',
      totalAED: 850,
      hotel: 'Bulgari Resort Dubai, Jumeirah Bay',
      room: 'Villa 09',
      marshal: 'Captain Tariq (VIP Cruiser #01)',
      convoyNumber: 'Royal Oasis Convoy',
      status: 'Dispatched',
      paymentStatus: 'Paid Online',
    },
    {
      id: 'b3',
      voucherCode: 'PHX-884903',
      guestName: 'Klaus & Greta Weber',
      phone: '+49 170 5551234',
      experienceTitle: 'Can-Am Dune Buggy Safari',
      date: 'Today',
      timeSlot: '04:30 PM',
      partySize: '2 Adults',
      totalAED: 1000,
      hotel: 'Address Downtown, Business Bay',
      room: 'Rm 812',
      marshal: 'Marshal Zaid (Lead ATV Buggy)',
      convoyNumber: 'Buggy Raptor Squad',
      status: 'Confirmed',
      paymentStatus: 'Cash on Pickup',
    },
    {
      id: 'b4',
      voucherCode: 'PHX-884904',
      guestName: 'Fatima Al-Zahra',
      phone: '+966 55 432 1098',
      experienceTitle: 'Morning Desert Safari',
      date: 'Tomorrow',
      timeSlot: '06:00 AM',
      partySize: '3 Adults',
      totalAED: 1350,
      hotel: 'Jumeirah Al Naseem',
      room: 'Ocean Ste 324',
      marshal: 'Captain Omar (Cruiser #09)',
      convoyNumber: 'Sunrise Convoy',
      status: 'Confirmed',
      paymentStatus: 'Paid Online',
    },
    {
      id: 'b5',
      voucherCode: 'PHX-884905',
      guestName: 'Marcus Vance',
      phone: '+1 415 890 1200',
      experienceTitle: 'Marina Luxury Dhow Cruise',
      date: 'Tonight',
      timeSlot: '08:00 PM',
      partySize: '2 Adults',
      totalAED: 220,
      hotel: 'JW Marriott Marquis, Business Bay',
      room: 'Rm 2410',
      marshal: 'Hostess Layla (Pier 7 Marina)',
      convoyNumber: 'Dhow Ocean Convoy',
      status: 'Confirmed',
      paymentStatus: 'Cash on Pickup',
    },
  ]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Open Edit Drawer for an existing tour
  const handleOpenEdit = (tour: Experience) => {
    setSelectedTour(tour);
    setDrawerMode('edit');
    setDrawerTitle(tour.title);
    setDrawerPrice(tour.priceAED);
    setDrawerBadge(tour.badge);
    setDrawerCategory(tour.category);
    setDrawerDuration(tour.duration);
    setDrawerTiming(tour.departureTime || '02:30 PM - 09:30 PM');
    setDrawerPickup(tour.hotelPickup ? 'DAMAC XL Tower, Business Bay / Hotel Lobby' : 'Desert Base Camp Meeting Point');
    setDrawerFeatured(tour.featured ?? true);
    setIsDrawerOpen(true);
  };

  // Open Drawer to create a new tour
  const handleOpenCreate = () => {
    setSelectedTour(null);
    setDrawerMode('create');
    setDrawerTitle('');
    setDrawerPrice(250);
    setDrawerBadge('New Experience');
    setDrawerCategory('desert-safaris');
    setDrawerDuration('4 Hours');
    setDrawerTiming('03:30 PM - 07:30 PM');
    setDrawerPickup('DAMAC XL Tower, Business Bay / Hotel Lobby');
    setDrawerFeatured(true);
    setIsDrawerOpen(true);
  };

  // Save changes from drawer
  const handleSaveDrawer = () => {
    if (!drawerTitle.trim()) {
      showToast('Please enter a tour title.');
      return;
    }

    if (drawerMode === 'edit' && selectedTour) {
      const updated: Experience = {
        ...selectedTour,
        title: drawerTitle,
        priceAED: Number(drawerPrice),
        badge: drawerBadge,
        category: drawerCategory,
        duration: drawerDuration,
        departureTime: drawerTiming,
        featured: drawerFeatured,
      };
      onUpdateExperience(updated);
      showToast(`Updated "${drawerTitle}" (AED ${drawerPrice}) successfully!`);
    } else {
      const newId = 'tour-' + Date.now();
      const newExp: Experience = {
        id: newId,
        title: drawerTitle,
        subtitle: 'Curated Phoenix Dubai Experience',
        category: drawerCategory,
        categoryLabel:
          drawerCategory === 'desert-safaris'
            ? 'Desert Safaris'
            : drawerCategory === 'city-tours'
            ? 'City Tours'
            : drawerCategory === 'buggies'
            ? 'Buggies & Quad ATVs'
            : 'Private Convoys',
        badge: drawerBadge,
        duration: drawerDuration,
        priceAED: Number(drawerPrice),
        priceUnit: 'From',
        description: 'Exclusive desert adventure crafted to the highest DTCM Dubai luxury standards.',
        image:
          selectedTour?.image ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAnHfQ_xD50mSdKpb_AX87krGRMEnUDwIXco_BEGwEs4j-EpVpiuGkmIUB5RwaW2iC42DL2UjCqzYVjEnvSEtZA-pMdChCLUsegIFFlflTsUd2y3BvsvfP5Q2Qunr7sWjRY9BCYTi9ANBMbBZ2SZ2Ps4ve8rYtJGe19JPv4az0YV1li5eXxA6Qd7PkZWZ3hpkfjU0G-jePPYEo66vWaKMQgeOdgBW4H_xBquYIVqQu8oHMDw6l00wWd8g',
        altText: drawerTitle,
        highlights: ['Desert Safari Convoy', 'Hotel Chauffeur', '5-Star Hospitality'],
        departureTime: drawerTiming,
        hotelPickup: true,
        featured: drawerFeatured,
      };
      onAddExperience(newExp);
      setCapacities((prev) => ({
        ...prev,
        [newId]: { booked: 0, max: 30 },
      }));
      showToast(`Created new tour "${drawerTitle}" with live capacity!`);
    }
    setIsDrawerOpen(false);
  };

  // Duplicate Tour
  const handleDuplicateTour = (tour: Experience) => {
    const newId = tour.id + '-copy-' + Math.floor(Math.random() * 1000);
    const duplicated: Experience = {
      ...tour,
      id: newId,
      title: `${tour.title} (Duplicate)`,
      badge: 'Popular',
    };
    onAddExperience(duplicated);
    setCapacities((prev) => ({
      ...prev,
      [newId]: { booked: 5, max: 25 },
    }));
    showToast(`Duplicated "${tour.title}". Ready for editing.`);
  };

  // Toggle Featured status directly in table
  const handleToggleFeatured = (tour: Experience) => {
    const updated: Experience = {
      ...tour,
      featured: !tour.featured,
    };
    onUpdateExperience(updated);
    showToast(`"${tour.title}" featured status set to: ${!tour.featured ? 'ACTIVE' : 'OFF'}`);
  };

  // Save CMS Hero and Announcement changes
  const handlePublishCMS = () => {
    onUpdateCmsConfig({
      ...cmsConfig,
      heroTitle: heroH1,
      heroSubtitle: heroSub,
      announcementTicker: announcementText,
      showAnnouncement: announcementActive,
      directPhone: phoneText,
      headquarters: hqText,
    });
    showToast('Published CMS changes! Live Storefront now updated in real-time.');
  };

  // Filtered tours for table
  const filteredTours = experiences.filter((tour) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'safaris' && tour.category === 'desert-safaris') ||
      (selectedCategory === 'buggies' && tour.category === 'buggies') ||
      (selectedCategory === 'city' && tour.category === 'city-tours') ||
      (selectedCategory === 'vip' && (tour.category === 'private-convoys' || tour.badge?.includes('VIP')));

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      tour.title.toLowerCase().includes(query) ||
      tour.category.toLowerCase().includes(query) ||
      tour.badge?.toLowerCase().includes(query);

    let matchesStatus = true;
    if (statusFilter === 'featured') {
      matchesStatus = !!tour.featured;
    } else if (statusFilter === 'high') {
      const cap = capacities[tour.id];
      matchesStatus = !!cap && cap.booked / cap.max >= 0.8;
    }

    return matchesCategory && matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-[#FFF8F6] text-[#1E1B1A] font-sans min-h-screen flex antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[#1E1B1A] text-white shadow-2xl border border-amber-500/40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="material-symbols-outlined text-[22px] text-amber-400">check_circle</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-stone-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* FIXED SIDEBAR (W-72) */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-[#FBF2F0] border-r border-[#E9E1DF] z-50 flex flex-col justify-between py-6 px-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-3 py-2 cursor-pointer" onClick={onSwitchToStorefront} title="Click to view Storefront">
            <img
              alt="The Phoenix Desert Safari Dubai luxury brand logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WMOvN0UE4dKOt2_C2Bu_0t6NHzbp2rJE9uqBBHV2kORBDSkbxPnV1hCrfcGuBGlprkOTzW4ojdptdQ955bvogDjBpQfSwWSDgZhQS-G2RdCUY9KHTKGAsBavdkzOx5ZzWuoeqPzD--gQcwnTSQ_-uDS0DutDuPQMSR-cWsuzYU8xjSXxAR3Lk0Au4-2UzfCS9DfoA4Jx_mLcvFHnfGrnoA0OBdJmoUEpGX9OB0yF0PrZWxKaEZYmqBxrd0"
            />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-[#1E1B1A] leading-tight">The Phoenix</span>
              <span className="text-[10px] text-[#8D4B00] font-bold uppercase tracking-wider">Desert Safari Dubai</span>
            </div>
          </div>

          <div className="px-3">
            <div className="h-px w-full bg-[#DBC2B0]/40"></div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveNav('overview-analytics')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                activeNav === 'overview-analytics'
                  ? 'bg-[#8D4B00] text-white shadow-sm'
                  : 'text-[#554336] hover:bg-[#EFE6E4] hover:text-[#1E1B1A]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">analytics</span>
              Overview &amp; Analytics
            </button>

            <button
              onClick={() => setActiveNav('homepage-cms')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                activeNav === 'homepage-cms'
                  ? 'bg-[#8D4B00] text-white shadow-sm'
                  : 'text-[#554336] hover:bg-[#EFE6E4] hover:text-[#1E1B1A]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">view_quilt</span>
              Homepage CMS
            </button>

            <button
              onClick={() => setActiveNav('tour-catalog-pricing')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                activeNav === 'tour-catalog-pricing'
                  ? 'bg-[#8D4B00] text-white shadow-sm'
                  : 'text-[#554336] hover:bg-[#EFE6E4] hover:text-[#1E1B1A]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">explore</span>
              Tour Catalog &amp; Pricing
            </button>

            <button
              onClick={() => setActiveNav('bookings-convoys')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                activeNav === 'bookings-convoys'
                  ? 'bg-[#8D4B00] text-white shadow-sm'
                  : 'text-[#554336] hover:bg-[#EFE6E4] hover:text-[#1E1B1A]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">directions_car</span>
              Bookings &amp; Convoys
            </button>

            <button
              onClick={() => setActiveNav('customer-inquiries-whatsapp')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                activeNav === 'customer-inquiries-whatsapp'
                  ? 'bg-[#8D4B00] text-white shadow-sm'
                  : 'text-[#554336] hover:bg-[#EFE6E4] hover:text-[#1E1B1A]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              Customer Inquiries &amp; WhatsApp
            </button>

            <button
              onClick={() => setActiveNav('seo-audit')}
              className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                activeNav === 'seo-audit'
                  ? 'bg-[#8D4B00] text-white shadow-sm'
                  : 'text-[#554336] hover:bg-[#EFE6E4] hover:text-[#1E1B1A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">travel_explore</span>
                <span>SEO &amp; Search Audit</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeNav === 'seo-audit' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                98%
              </span>
            </button>

            <button
              onClick={() => setActiveNav('settings')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                activeNav === 'settings'
                  ? 'bg-[#8D4B00] text-white shadow-sm'
                  : 'text-[#554336] hover:bg-[#EFE6E4] hover:text-[#1E1B1A]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
              Settings
            </button>
          </nav>
        </div>

        {/* Sidebar Footer: Fleet Operations & Operator Session */}
        <div className="flex flex-col gap-3 px-3">
          {/* Authenticated Admin Operator Card */}
          <div className="p-3 rounded-xl bg-stone-900 text-white flex flex-col gap-1.5 shadow-md border border-amber-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Operator Auth
              </span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">DTCM-PRO</span>
            </div>
            <div className="text-xs font-semibold text-stone-200 truncate" title={adminSession?.email || 'awalgsm@gmail.com'}>
              {adminSession?.email || 'awalgsm@gmail.com'}
            </div>
            <div className="text-[10px] text-stone-400 flex items-center justify-between">
              <span>Super Administrator</span>
              <span className="text-emerald-400 font-medium">Verified Active</span>
            </div>
            <div className="pt-2 border-t border-stone-800 flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={onSwitchToStorefront}
                className="flex-1 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-semibold text-center transition-colors cursor-pointer"
                title="View customer storefront"
              >
                Storefront
              </button>
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex-1 py-1.5 rounded bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/40 text-[11px] font-semibold text-center transition-colors cursor-pointer flex items-center justify-center gap-1"
                  title="Lock and sign out of admin session"
                >
                  <span className="material-symbols-outlined text-[13px]">lock</span>
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F5ECEA] border border-[#E9E1DF] flex flex-col gap-1.5 shadow-xs">
            <span className="text-[10px] font-bold text-[#554336] uppercase tracking-wider">Fleet Operations</span>
            <div className="flex items-center justify-between text-[#1E1B1A] text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-[#8D4B00] animate-pulse"></span>
                18 Convoys Active
              </span>
              <span className="font-bold text-[#8D4B00]">94%</span>
            </div>
            <div className="w-full bg-[#E9E1DF] h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-gradient-to-r from-[#8D4B00] to-[#EA580C] h-full rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT CANVAS */}
      <div className="pl-72 flex-1 flex flex-col min-w-0">
        {/* FIXED TOP HEADER */}
        <header className="fixed top-0 left-72 right-0 h-20 bg-[#FFF8F6]/85 backdrop-blur-xl border-b border-[#E9E1DF] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40">
          <div className="h-20 w-full px-8 flex items-center justify-between gap-6">
            {/* Search Input */}
            <div className="flex items-center gap-4 flex-1 max-w-lg">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#554336] text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tours, guest vouchers, convoys..."
                  className="w-full pl-10 pr-4 py-2 bg-[#F5ECEA] rounded-lg text-sm text-[#1E1B1A] placeholder:text-[#554336]/80 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8D4B00] transition-all border border-transparent focus:border-[#8D4B00]"
                />
              </div>
            </div>

            {/* Header Right Cluster */}
            <div className="flex items-center gap-4 sm:gap-5">
              {/* DTCM Sync Badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFE6E4] text-[#1E1B1A] text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-[#8D4B00]"></span>
                <span className="tracking-wide">DTCM Online Sync Active</span>
              </div>

              {/* Add New Tour CTA */}
              <button
                type="button"
                onClick={handleOpenCreate}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8D4B00] hover:bg-[#B15F00] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>+ Add New Tour</span>
              </button>

              {/* Notification Bell */}
              <button
                type="button"
                onClick={() => showToast('All 18 desert convoys operating safely on schedule.')}
                className="relative p-2 rounded-lg text-[#554336] hover:bg-[#EFE6E4] hover:text-[#1E1B1A] transition-all cursor-pointer"
                title="Notifications"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EA580C]"></span>
              </button>

              {/* Profile Chip & Sign Out */}
              <div className="flex items-center gap-3 pl-2 border-l border-[#DBC2B0]/40">
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="text-xs font-bold text-[#1E1B1A]">
                    {adminSession?.name || 'Awal'}
                  </span>
                  <span className="text-[10px] text-[#8D4B00] font-semibold truncate max-w-[150px]" title={adminSession?.email || 'awalgsm@gmail.com'}>
                    {adminSession?.email || 'awalgsm@gmail.com'}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#8D4B00] text-white flex items-center justify-center shadow-xs font-bold text-xs" title="Super Admin">
                  A
                </div>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 border border-stone-200 text-xs font-semibold transition-colors cursor-pointer ml-1"
                    title="Sign Out of Admin Portal"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span className="hidden lg:inline">Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* INNER SCROLLABLE CONTENT */}
        <main className="pt-24 px-8 pb-16 w-full max-w-[1400px]">
          {/* Sub-header Breadcrumb & Direct Action Ribbon */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-[#554336] text-[11px] font-bold tracking-wider uppercase mb-1">
                <span className="hover:text-[#8D4B00] cursor-pointer transition-colors" onClick={() => setActiveNav('homepage-cms')}>
                  Admin Portal
                </span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-[#8D4B00]">
                  {activeNav === 'homepage-cms'
                    ? 'Homepage CMS & Tour Inventory'
                    : activeNav === 'tour-catalog-pricing'
                    ? 'Tour Catalog & Pricing Matrix'
                    : activeNav === 'bookings-convoys'
                    ? 'Bookings & Convoy Dispatch'
                    : activeNav === 'customer-inquiries-whatsapp'
                    ? 'WhatsApp & Inquiries Desk'
                    : activeNav === 'overview-analytics'
                    ? 'Operations & Revenue Analytics'
                    : activeNav === 'seo-audit'
                    ? 'SEO Audit & Search Engine Dominance'
                    : 'System & DTCM Settings'}
                </span>
              </div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1E1B1A] tracking-tight">
                {activeNav === 'homepage-cms'
                  ? 'Expeditions & Showcase Manager'
                  : activeNav === 'tour-catalog-pricing'
                  ? 'Tour Pricing & Capacity Matrix'
                  : activeNav === 'bookings-convoys'
                  ? 'Live Booking Vouchers & Convoys'
                  : activeNav === 'customer-inquiries-whatsapp'
                  ? 'Guest WhatsApp Concierge Desk'
                  : activeNav === 'overview-analytics'
                  ? 'Daily Revenue & Performance Metrics'
                  : activeNav === 'seo-audit'
                  ? 'Live Technical SEO Audit & Competitor Intelligence'
                  : 'Company Profile & Compliance Settings'}
              </h1>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFE6E4] shadow-xs text-xs font-semibold text-[#1E1B1A]">
                <span className="material-symbols-outlined text-[16px] text-[#8D4B00]">verified_user</span>
                <span>DTCM Permit #EXP-2024-8849</span>
              </div>

              {/* Toggle to Live Storefront */}
              <button
                type="button"
                onClick={onSwitchToStorefront}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#E9E1DF] text-[#1E1B1A] text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-[#F5ECEA] transition-all cursor-pointer"
                title="Switch to customer storefront view"
              >
                <span className="material-symbols-outlined text-[18px] text-[#006194]">open_in_new</span>
                <span>Live Storefront</span>
              </button>

              {/* Publish CMS Button */}
              <button
                type="button"
                onClick={handlePublishCMS}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#8D4B00] to-[#EA580C] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg hover:opacity-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">publish</span>
                <span>Publish CMS Updates</span>
              </button>
            </div>
          </div>

          {/* KPI BENTO GRID (4 Cards) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* Card 1: Active Inventory */}
            <div className="relative overflow-hidden rounded-xl bg-white border border-[#E9E1DF] p-5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#554336] uppercase tracking-wider">Active Inventory</span>
                  <span className="font-serif font-bold text-3xl text-[#1E1B1A] mt-1">{experiences.length} Tours</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#FFDCC3] flex items-center justify-center text-[#8D4B00]">
                  <span className="material-symbols-outlined text-[24px]">travel_explore</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EFE6E4] text-[#1E1B1A] text-[11px] font-semibold">
                  <span className="h-2 w-2 rounded-full bg-[#8D4B00]"></span>
                  100% DTCM Compliant
                </span>
                <span className="text-[11px] text-[#554336] font-medium">{experiences.length}/{experiences.length} Indexed</span>
              </div>
            </div>

            {/* Card 2: Today's Bookings */}
            <div className="relative overflow-hidden rounded-xl bg-white border border-[#E9E1DF] p-5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#554336] uppercase tracking-wider">Today's Desert Bookings</span>
                  <span className="font-serif font-bold text-3xl text-[#1E1B1A] mt-1">
                    42 <span className="text-sm font-normal text-[#554336]">Guests</span>
                  </span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#FFDBCE] flex items-center justify-center text-[#A73A00]">
                  <span className="material-symbols-outlined text-[24px]">payments</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-bold text-[#1E1B1A]">
                  AED 38,450 <span className="font-normal text-[#554336] text-xs">GMV</span>
                </span>
                <span className="inline-flex items-center text-[#8D4B00] text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span> +18.4%
                </span>
              </div>
            </div>

            {/* Card 3: Conversion Rate */}
            <div className="relative overflow-hidden rounded-xl bg-white border border-[#E9E1DF] p-5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#554336] uppercase tracking-wider">Homepage Conversion</span>
                  <span className="font-serif font-bold text-3xl text-[#1E1B1A] mt-1">4.82%</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#CCE5FF] flex items-center justify-center text-[#006194]">
                  <span className="material-symbols-outlined text-[24px]">ads_click</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[#554336] text-[11px]">
                <span className="text-[#006194] font-bold">2,180 visits</span>
                <span>•</span>
                <span>105 WhatsApp chats</span>
              </div>
            </div>

            {/* Card 4: ATV / Buggy Fleet */}
            <div className="relative overflow-hidden rounded-xl bg-white border border-[#E9E1DF] p-5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#554336] uppercase tracking-wider">ATV / Buggy Fleet</span>
                  <span className="font-serif font-bold text-3xl text-[#1E1B1A] mt-1">
                    14 / 16 <span className="text-sm font-normal text-[#554336]">Active</span>
                  </span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#EFE6E4] flex items-center justify-center text-[#1E1B1A]">
                  <span className="material-symbols-outlined text-[24px]">two_wheeler</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#EA580C]"></span>
                  <span className="text-[11px] text-[#554336]">2 in Scheduled Tune-up</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#F5ECEA] text-[#1E1B1A] font-bold">87.5% util.</span>
              </div>
            </div>
          </section>

          {/* VIEW TAB 1: HOMEPAGE CMS (Shown in Image 1.png) */}
          {activeNav === 'homepage-cms' && (
            <>
              {/* SECTION 2: HERO SHOWCASE & TRUST ARCHITECTURE (Split Panel) */}
              <section className="mb-10 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-6 rounded-full bg-[#8D4B00]"></div>
                    <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1E1B1A]">
                      Hero Showcase &amp; Trust Architecture
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#554336]">Live Experience Cache: Active</span>
                    <span className="h-2 w-2 rounded-full bg-[#8D4B00] animate-pulse"></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left 7 Cols: Hero Banner & Quick Booking Controller */}
                  <div className="lg:col-span-7 flex flex-col gap-5 bg-white rounded-xl p-6 border border-[#E9E1DF] shadow-xs">
                    <div className="flex items-center justify-between pb-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#8D4B00] text-[20px]">panorama</span>
                        <span className="text-sm font-bold text-[#1E1B1A]">Primary Storefront Hero Banner</span>
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#EFE6E4] text-[#554336]">
                        Desktop + Mobile Viewport
                      </span>
                    </div>

                    {/* Banner Media Preview */}
                    <div className="relative w-full h-56 rounded-lg overflow-hidden group shadow-inner border border-amber-200/50">
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url('${cmsConfig.heroImage}')` }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B1A]/90 via-[#1E1B1A]/30 to-transparent flex flex-col justify-end p-5">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#FFDCC3] uppercase tracking-wider">Live Background Asset</span>
                            <span className="font-serif font-bold text-lg text-white">Dune Drift Golden Hour 4K</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                showToast('Visual asset swapped with alternative high-definition sunset convoy photo.');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur text-[#1E1B1A] text-xs font-bold hover:bg-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">sync</span> Replace Visual
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                showToast('Hero contrast scrim calibrated for maximum typography legibility.');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#8D4B00] text-white text-xs font-bold hover:bg-[#B15F00] shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">tune</span> Adjust Scrim
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hero Headline & Copy Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#554336]">Hero Main Title (H1)</label>
                        <input
                          type="text"
                          value={heroH1}
                          onChange={(e) => setHeroH1(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5ECEA] text-[#1E1B1A] text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#8D4B00] focus:outline-none transition-all border border-[#E9E1DF]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#554336]">Hero Subtitle &amp; Booking CTA</label>
                        <input
                          type="text"
                          value={heroSub}
                          onChange={(e) => setHeroSub(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5ECEA] text-[#1E1B1A] text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#8D4B00] focus:outline-none transition-all border border-[#E9E1DF]"
                        />
                      </div>
                    </div>

                    {/* Announcement Ribbon & Quick Search Bar Settings */}
                    <div className="pt-2 flex flex-col gap-4">
                      <div className="p-4 rounded-lg bg-[#F5ECEA] border border-[#E9E1DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#EA580C] text-[22px]">campaign</span>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-[#1E1B1A]">Announcement Ticker</span>
                            <input
                              type="text"
                              value={announcementText}
                              onChange={(e) => setAnnouncementText(e.target.value)}
                              className="text-xs text-[#554336] bg-transparent border-b border-stone-300 focus:border-[#8D4B00] focus:outline-none py-0.5"
                            />
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer self-start sm:self-auto">
                          <input
                            type="checkbox"
                            checked={announcementActive}
                            onChange={(e) => setAnnouncementActive(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[#E9E1DF] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8D4B00]"></div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-[#FBF2F0] border border-[#E9E1DF] flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#554336] uppercase tracking-wider">Default Booking Widget Selector</span>
                            <span className="text-xs font-bold text-[#1E1B1A]">Evening Desert Safari</span>
                          </div>
                          <span className="material-symbols-outlined text-[#8D4B00] text-[20px]">tune</span>
                        </div>
                        <div className="p-3 rounded-lg bg-[#FBF2F0] border border-[#E9E1DF] flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#554336] uppercase tracking-wider">Dynamic Multi-Currency Sync</span>
                            <span className="text-xs font-bold text-[#1E1B1A]">AED, USD, EUR, GBP (Active)</span>
                          </div>
                          <span className="h-2.5 w-2.5 rounded-full bg-[#8D4B00]"></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right 5 Cols: Social Proof & Business Information Matrix */}
                  <div className="lg:col-span-5 flex flex-col gap-5">
                    <div className="bg-white rounded-xl p-6 border border-[#E9E1DF] shadow-xs flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between pb-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#8D4B00] text-[22px]">verified</span>
                            <span className="text-sm font-bold text-[#1E1B1A]">Social Proof Engine</span>
                          </div>
                          <span className="text-[11px] text-[#8D4B00] font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">autorenew</span> Synced 12m ago
                          </span>
                        </div>

                        {/* Reputation Card Preview */}
                        <div className="p-4 rounded-xl bg-[#FBF2F0] border border-[#E9E1DF] flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-xl bg-white shadow-xs border border-amber-200 flex flex-col items-center justify-center shrink-0">
                            <span className="font-serif font-bold text-xl text-[#1E1B1A] leading-none">5.0</span>
                            <div className="flex text-[#D97706] text-[12px] mt-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <span key={i} className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  star
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#1E1B1A]">Google Verified Merchant</span>
                              <span className="px-2 py-0.5 rounded bg-[#F5ECEA] text-[10px] font-bold text-[#554336]">Live</span>
                            </div>
                            <span className="text-xs text-[#554336] mt-0.5">Rated Excellent across 1,840+ verified passenger feedbacks</span>
                          </div>
                        </div>

                        {/* Business Information Matrix */}
                        <div className="flex flex-col gap-3">
                          {/* Physical HQ */}
                          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F5ECEA] border border-[#E9E1DF]">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-[#554336] text-[20px]">location_on</span>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-[#554336] uppercase tracking-wider">Physical Headquarters</span>
                                {editingHq ? (
                                  <input
                                    type="text"
                                    value={hqText}
                                    onChange={(e) => setHqText(e.target.value)}
                                    onBlur={() => setEditingHq(false)}
                                    autoFocus
                                    className="text-xs font-bold text-[#1E1B1A] bg-white px-2 py-1 rounded border border-[#8D4B00]"
                                  />
                                ) : (
                                  <span className="text-xs font-bold text-[#1E1B1A]">{hqText}</span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingHq(!editingHq)}
                              className="text-[#8D4B00] hover:text-[#B15F00] p-1 cursor-pointer"
                              title="Edit address"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                          </div>

                          {/* Direct Booking Line */}
                          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F5ECEA] border border-[#E9E1DF]">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-[#554336] text-[20px]">call</span>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-[#554336] uppercase tracking-wider">Direct Booking Line &amp; Concierge</span>
                                <input
                                  type="text"
                                  value={phoneText}
                                  onChange={(e) => setPhoneText(e.target.value)}
                                  className="text-xs font-bold text-[#1E1B1A] bg-transparent border-0 p-0 focus:outline-none focus:underline"
                                />
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFDCC3] text-[#2F1500] font-bold">24/7 Priority</span>
                          </div>

                          {/* Automated WhatsApp Bot API */}
                          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F5ECEA] border border-[#E9E1DF]">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-[#554336] text-[20px]">chat</span>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-[#554336] uppercase tracking-wider">Automated WhatsApp Bot API</span>
                                <span className="text-xs font-bold text-[#1E1B1A]">UltraMsg v2.4 (Active Webhook)</span>
                              </div>
                            </div>
                            <span className="h-2.5 w-2.5 rounded-full bg-[#8D4B00]"></span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#E9E1DF] flex items-center justify-between">
                        <span className="text-xs text-[#554336]">Instant Confirmation Engine:</span>
                        <span className="text-xs text-[#8D4B00] font-bold">Guaranteed within 45s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 3: TOUR CATALOG & SLOT INVENTORY (Full Interactive Data Table) */}
              <section className="flex flex-col gap-5 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-6 rounded-full bg-[#EA580C]"></div>
                    <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1E1B1A]">Tour Catalog &amp; Slot Inventory</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EFE6E4] text-[#554336] font-bold">
                      {experiences.length} Curated Packages
                    </span>
                  </div>

                  {/* Search & Bulk Filter Ribbon */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[240px]">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#554336] text-[18px]">
                        search
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter tours, ATVs, packages..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-[#E9E1DF] text-xs text-[#1E1B1A] placeholder:text-[#554336]/80 focus:outline-none focus:ring-1 focus:ring-[#8D4B00] shadow-xs"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as 'all' | 'featured' | 'high')}
                      className="px-3 py-2 rounded-lg bg-white border border-[#E9E1DF] text-xs font-semibold text-[#1E1B1A] focus:outline-none shadow-xs cursor-pointer"
                    >
                      <option value="all">All Operational Statuses</option>
                      <option value="featured">Featured On Homepage Only</option>
                      <option value="high">High Demand (&gt;80% booked)</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleOpenCreate}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8D4B00] hover:bg-[#B15F00] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span> Create Experience
                    </button>
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap shadow-xs transition-all cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-[#8D4B00] text-white'
                        : 'bg-white text-[#554336] hover:text-[#1E1B1A] border border-[#E9E1DF]'
                    }`}
                  >
                    All Tours ({experiences.length})
                  </button>
                  <button
                    onClick={() => setSelectedCategory('safaris')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap shadow-xs transition-all cursor-pointer ${
                      selectedCategory === 'safaris'
                        ? 'bg-[#8D4B00] text-white'
                        : 'bg-white text-[#554336] hover:text-[#1E1B1A] border border-[#E9E1DF]'
                    }`}
                  >
                    Desert Safaris (3)
                  </button>
                  <button
                    onClick={() => setSelectedCategory('buggies')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap shadow-xs transition-all cursor-pointer ${
                      selectedCategory === 'buggies'
                        ? 'bg-[#8D4B00] text-white'
                        : 'bg-white text-[#554336] hover:text-[#1E1B1A] border border-[#E9E1DF]'
                    }`}
                  >
                    Buggies &amp; Quad ATVs (2)
                  </button>
                  <button
                    onClick={() => setSelectedCategory('city')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap shadow-xs transition-all cursor-pointer ${
                      selectedCategory === 'city'
                        ? 'bg-[#8D4B00] text-white'
                        : 'bg-white text-[#554336] hover:text-[#1E1B1A] border border-[#E9E1DF]'
                    }`}
                  >
                    City Excursions (3)
                  </button>
                  <button
                    onClick={() => setSelectedCategory('vip')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap shadow-xs transition-all cursor-pointer ${
                      selectedCategory === 'vip'
                        ? 'bg-[#8D4B00] text-white'
                        : 'bg-white text-[#554336] hover:text-[#1E1B1A] border border-[#E9E1DF]'
                    }`}
                  >
                    Seasonal &amp; VIP Retreats
                  </button>
                </div>

                {/* Main Data Table Container */}
                <div className="overflow-hidden rounded-xl bg-white border border-[#E9E1DF] shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#FBF2F0] text-[11px] font-bold text-[#554336] uppercase tracking-wider border-b border-[#E9E1DF]">
                          <th className="py-3.5 px-5">Experience Title</th>
                          <th className="py-3.5 px-4">Category &amp; Duration</th>
                          <th className="py-3.5 px-4">Base Rate (AED)</th>
                          <th className="py-3.5 px-4">Departure &amp; Timing</th>
                          <th className="py-3.5 px-4">Today's Capacity</th>
                          <th className="py-3.5 px-4 text-center">CMS Featured</th>
                          <th className="py-3.5 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E9E1DF] text-xs text-[#1E1B1A]">
                        {filteredTours.map((tour) => {
                          const cap = capacities[tour.id] || { booked: 15, max: 25 };
                          const percentage = Math.round((cap.booked / cap.max) * 100);
                          const isHighDemand = percentage >= 80;

                          return (
                            <tr key={tour.id} className="hover:bg-[#FBF2F0]/60 transition-colors">
                              {/* Experience Title & Thumbnail */}
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[#F5ECEA] border border-[#E9E1DF]">
                                    <img src={tour.image} alt={tour.altText} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-sm text-[#1E1B1A]">{tour.title}</span>
                                      {tour.badge && (
                                        <span className="px-2 py-0.5 rounded-full bg-[#FFDBCE] text-[#370E00] text-[10px] font-bold">
                                          {tour.badge}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[#554336] text-xs line-clamp-1 max-w-xs">{tour.subtitle}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Category & Duration */}
                              <td className="py-4 px-4">
                                <div className="flex flex-col">
                                  <span className="font-bold text-[#1E1B1A]">{tour.categoryLabel}</span>
                                  <span className="text-[#554336] text-[11px]">{tour.duration}</span>
                                </div>
                              </td>

                              {/* Base Rate */}
                              <td className="py-4 px-4">
                                <div className="flex flex-col">
                                  <span className="font-serif font-bold text-base text-[#8D4B00]">AED {tour.priceAED}</span>
                                  <span className="text-[10px] text-[#554336]">
                                    {tour.category === 'private-convoys' ? 'Per Vehicle' : 'Per Person'}
                                  </span>
                                </div>
                              </td>

                              {/* Departure & Timing */}
                              <td className="py-4 px-4">
                                <div className="flex flex-col">
                                  <span className="font-medium text-[#1E1B1A]">{tour.departureTime || 'Daily Slot'}</span>
                                  <span className="text-[11px] text-[#8D4B00] font-semibold">
                                    {tour.hotelPickup ? 'Pickup from Hotel/Residence' : 'Base Camp Meeting'}
                                  </span>
                                </div>
                              </td>

                              {/* Today's Capacity */}
                              <td className="py-4 px-4">
                                <div className="flex flex-col gap-1 w-36">
                                  <div className="flex justify-between text-[11px]">
                                    <span className="font-bold text-[#1E1B1A]">{cap.booked} / {cap.max} booked</span>
                                    <span className={`font-bold ${isHighDemand ? 'text-[#EA580C]' : 'text-[#8D4B00]'}`}>
                                      {percentage}%
                                    </span>
                                  </div>
                                  <div className="h-2 w-full bg-[#EFE6E4] rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${isHighDemand ? 'bg-[#EA580C]' : 'bg-[#8D4B00]'}`}
                                      style={{ width: `${Math.min(percentage, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>

                              {/* CMS Featured Toggle */}
                              <td className="py-4 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={!!tour.featured}
                                  onChange={() => handleToggleFeatured(tour)}
                                  className="h-4 w-4 rounded text-[#8D4B00] focus:ring-[#8D4B00] cursor-pointer accent-[#8D4B00]"
                                />
                              </td>

                              {/* Action Buttons */}
                              <td className="py-4 px-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(tour)}
                                    className="p-1.5 rounded-lg bg-[#F5ECEA] hover:bg-[#EFE6E4] text-[#554336] hover:text-[#1E1B1A] transition-colors cursor-pointer"
                                    title="Quick Edit Parameters"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicateTour(tour)}
                                    className="p-1.5 rounded-lg bg-[#F5ECEA] hover:bg-[#EFE6E4] text-[#554336] hover:text-[#1E1B1A] transition-colors cursor-pointer"
                                    title="Duplicate Package"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                  </button>
                                  {experiences.length > 3 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Remove "${tour.title}" from catalog?`)) {
                                          onDeleteExperience(tour.id);
                                          showToast(`Deleted "${tour.title}".`);
                                        }
                                      }}
                                      className="p-1.5 rounded-lg bg-[#F5ECEA] hover:bg-red-50 text-[#554336] hover:text-red-600 transition-colors cursor-pointer"
                                      title="Delete Experience"
                                    >
                                      <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination / Inventory Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#FBF2F0] border-t border-[#E9E1DF] gap-3">
                    <span className="text-xs text-[#554336]">
                      Showing {filteredTours.length} of {experiences.length} Active Tours • All changes sync directly to the homepage &amp; WhatsApp Bot API
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled
                        className="px-3 py-1.5 rounded bg-[#EFE6E4] text-xs font-semibold text-[#554336] disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-xs px-2 text-[#1E1B1A] font-bold">Page 1 of 1</span>
                      <button
                        type="button"
                        disabled
                        className="px-3 py-1.5 rounded bg-[#EFE6E4] text-xs font-semibold text-[#554336] disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* VIEW TAB 2: TOUR CATALOG & PRICING */}
          {activeNav === 'tour-catalog-pricing' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-[#E9E1DF] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-bold text-lg text-[#1E1B1A]">Expedition Rates &amp; Multi-Tier Matrix</h3>
                  <button
                    onClick={handleOpenCreate}
                    className="px-4 py-2 rounded-lg bg-[#8D4B00] text-white text-xs font-bold cursor-pointer"
                  >
                    + Add New Rate Category
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="p-4 rounded-xl bg-[#FBF2F0] border border-[#E9E1DF] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#8D4B00] uppercase">{exp.categoryLabel}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFDCC3] text-[#2F1500]">{exp.badge}</span>
                        </div>
                        <h4 className="font-bold text-sm text-[#1E1B1A] mt-1">{exp.title}</h4>
                        <div className="my-3 flex items-baseline gap-2">
                          <span className="font-serif font-bold text-2xl text-[#8D4B00]">AED {exp.priceAED}</span>
                          <span className="text-xs text-[#554336]">{exp.priceUnit || 'Base'}</span>
                        </div>
                        <p className="text-xs text-[#554336] line-clamp-2">{exp.description}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#E9E1DF] flex items-center justify-between">
                        <span className="text-[11px] text-[#554336]">{exp.duration}</span>
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="text-xs font-bold text-[#8D4B00] hover:underline cursor-pointer"
                        >
                          Modify Rate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW TAB 3: BOOKINGS & CONVOYS */}
          {activeNav === 'bookings-convoys' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-6 rounded-full bg-[#8D4B00]"></div>
                  <h2 className="font-serif font-bold text-xl text-[#1E1B1A]">Today's Convoy Dispatch &amp; Passenger Vouchers</h2>
                </div>
                <button
                  onClick={() => showToast('Dispatch list exported to PDF & sent to Captain convoy leads.')}
                  className="px-4 py-2 rounded-lg bg-[#8D4B00] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span> Export Convoy Manifest
                </button>
              </div>

              <div className="overflow-hidden rounded-xl bg-white border border-[#E9E1DF] shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#FBF2F0] text-[11px] font-bold text-[#554336] uppercase tracking-wider border-b border-[#E9E1DF]">
                        <th className="py-3 px-4">Voucher</th>
                        <th className="py-3 px-4">Guest &amp; Hotel</th>
                        <th className="py-3 px-4">Experience</th>
                        <th className="py-3 px-4">Pickup Time</th>
                        <th className="py-3 px-4">Assigned Marshal</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9E1DF] text-xs text-[#1E1B1A]">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-[#FBF2F0]/60">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#8D4B00]">{b.voucherCode}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#1E1B1A]">{b.guestName}</span>
                              <span className="text-[11px] text-[#554336]">{b.hotel} ({b.room})</span>
                              <span className="text-[10px] text-[#006194] font-medium">{b.phone}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#1E1B1A]">{b.experienceTitle}</span>
                              <span className="text-[11px] text-[#554336]">{b.partySize} • AED {b.totalAED}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#1E1B1A]">{b.timeSlot}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#1E1B1A]">{b.marshal}</span>
                              <span className="text-[10px] text-[#554336]">{b.convoyNumber}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                b.status === 'Dispatched'
                                  ? 'bg-amber-100 text-amber-900'
                                  : b.status === 'Confirmed'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-stone-100 text-stone-800'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <a
                              href={`https://wa.me/971561505270?text=Hello%20${encodeURIComponent(
                                b.guestName
                              )},%20this%20is%20The%20Phoenix%20Dubai%20Desert%20Safari.%20Your%20marshal%20is%20${encodeURIComponent(
                                b.marshal
                              )}%20for%20today.`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 text-[11px]"
                            >
                              <span className="material-symbols-outlined text-[14px]">chat</span> WhatsApp
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW TAB 4: CUSTOMER INQUIRIES & WHATSAPP */}
          {activeNav === 'customer-inquiries-whatsapp' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-[#E9E1DF] shadow-xs flex flex-col gap-3">
                <h3 className="font-serif font-bold text-base text-[#1E1B1A]">Recent Live Chats (UltraMsg Bot)</h3>
                <div className="space-y-2">
                  {[
                    { name: 'Sarah Jenkins (UK)', time: '4m ago', msg: 'Can we book quad bike upgrade at the camp?' },
                    { name: 'Ahmed Mansoor (KSA)', time: '18m ago', msg: 'Is private Land Cruiser available for 5 guests today?' },
                    { name: 'David Lee (USA)', time: '35m ago', msg: 'What time is pickup at Marina Gate Tower 1?' },
                  ].map((chat, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#FBF2F0] hover:bg-[#F5ECEA] cursor-pointer transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-[#1E1B1A]">{chat.name}</span>
                        <span className="text-[10px] text-[#554336]">{chat.time}</span>
                      </div>
                      <p className="text-xs text-[#554336] mt-1">{chat.msg}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#E9E1DF] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#E9E1DF]">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                      <span className="font-bold text-sm text-[#1E1B1A]">Sarah Jenkins (+44 7700 900123)</span>
                    </div>
                    <span className="text-xs text-[#554336]">Evening Desert Safari Query</span>
                  </div>

                  <div className="py-4 space-y-3">
                    <div className="bg-[#F5ECEA] p-3 rounded-lg max-w-md text-xs text-[#1E1B1A]">
                      Hi! We booked the Evening Safari voucher PHX-884901 for 4 adults. Can we also add 20 minutes of quad biking once we arrive at the desert camp?
                    </div>
                    <div className="bg-[#FFDCC3] p-3 rounded-lg max-w-md ml-auto text-xs text-[#2F1500] font-medium">
                      Marhaba Sarah! Yes absolutely. We have 350cc Yamaha Raptors and Can-Am buggies ready at the base camp. You can either pay the marshal upon arrival or have us pre-reserve them for you right now.
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E9E1DF] flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type official reply or select quick response..."
                    className="flex-1 px-3 py-2 rounded-lg bg-[#F5ECEA] text-xs text-[#1E1B1A] focus:outline-none focus:ring-1 focus:ring-[#8D4B00]"
                  />
                  <button
                    onClick={() => showToast('Response sent to guest via WhatsApp API.')}
                    className="px-4 py-2 rounded-lg bg-[#8D4B00] text-white text-xs font-bold cursor-pointer"
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW TAB 5: OVERVIEW & ANALYTICS */}
          {activeNav === 'overview-analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-[#E9E1DF] shadow-xs">
                  <span className="text-xs font-bold text-[#554336] uppercase">Monthly Revenue (March)</span>
                  <div className="font-serif font-bold text-3xl text-[#8D4B00] mt-1">AED 412,800</div>
                  <span className="text-xs text-emerald-600 font-bold mt-2 block">↑ 24% vs last month</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#E9E1DF] shadow-xs">
                  <span className="text-xs font-bold text-[#554336] uppercase">Total Safaris Completed</span>
                  <div className="font-serif font-bold text-3xl text-[#1E1B1A] mt-1">1,420 Tours</div>
                  <span className="text-xs text-[#554336] mt-2 block">99.2% on-time pickup rate</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#E9E1DF] shadow-xs">
                  <span className="text-xs font-bold text-[#554336] uppercase">Customer Satisfaction</span>
                  <div className="font-serif font-bold text-3xl text-[#EA580C] mt-1">4.98 / 5.0</div>
                  <span className="text-xs text-[#554336] mt-2 block">Based on 1,840+ verified reviews</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-[#E9E1DF] shadow-xs">
                <h3 className="font-serif font-bold text-lg text-[#1E1B1A] mb-4">Tour Booking Volume by Category</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Evening Desert Safari (Standard & VIP)', pct: 58, val: 'AED 240,000' },
                    { label: 'Can-Am Maverick & ATV Quad Rentals', pct: 24, val: 'AED 99,000' },
                    { label: 'Morning Desert Safaris & Sandboarding', pct: 10, val: 'AED 41,000' },
                    { label: 'Dubai & Abu Dhabi Guided City Tours', pct: 8, val: 'AED 32,800' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#1E1B1A]">{item.label}</span>
                        <span className="text-[#8D4B00]">{item.val} ({item.pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-[#F5ECEA] rounded-full overflow-hidden">
                        <div className="h-full bg-[#8D4B00] rounded-full" style={{ width: `${item.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW TAB 6: SETTINGS */}
          {activeNav === 'settings' && (
            <div className="bg-white p-6 rounded-xl border border-[#E9E1DF] shadow-xs max-w-3xl space-y-6">
              <h3 className="font-serif font-bold text-xl text-[#1E1B1A]">Operator Credentials &amp; Regulatory Setup</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#554336]">Company Commercial Name</label>
                  <input
                    type="text"
                    defaultValue="The Phoenix Desert Safari Dubai LLC"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#F5ECEA] text-xs font-medium border border-[#E9E1DF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#554336]">DTCM Operator Permit Number</label>
                  <input
                    type="text"
                    defaultValue="EXP-2024-8849"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#F5ECEA] text-xs font-medium border border-[#E9E1DF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#554336]">Dispatch Office Address</label>
                  <input
                    type="text"
                    value={hqText}
                    onChange={(e) => setHqText(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#F5ECEA] text-xs font-medium border border-[#E9E1DF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#554336]">Primary Emergency Hot-line</label>
                  <input
                    type="text"
                    value={phoneText}
                    onChange={(e) => setPhoneText(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#F5ECEA] text-xs font-medium border border-[#E9E1DF]"
                  />
                </div>
              </div>

              {/* Admin Security & Authentication Panel */}
              <div className="mt-8 pt-6 border-t border-[#E9E1DF]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#8D4B00]">security</span>
                    <h4 className="text-sm font-bold text-[#1E1B1A]">Administrator Security &amp; Credentials</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    SSL 256-Bit Encrypted
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FBF2F0] p-4 rounded-xl border border-[#E9E1DF]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#554336]">Active Admin Account</span>
                    <div className="text-xs font-bold text-[#1E1B1A] mt-0.5">{adminSession?.email || 'awalgsm@gmail.com'}</div>
                    <div className="text-[11px] text-[#8D4B00] font-medium">Role: Super Administrator (Direct Operator)</div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#554336]">Authentication Security</span>
                    <div className="text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">verified_user</span>
                      Protected by Brute-Force Rate Limiting (5 Attempts)
                    </div>
                    <div className="text-[11px] text-stone-500">Session Token Active &bull; Remember Me Enabled</div>
                  </div>
                </div>

                {onSignOut && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-[#554336]">
                      Need to terminate your administrative session on this workstation?
                    </p>
                    <button
                      type="button"
                      onClick={onSignOut}
                      className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">lock</span>
                      <span>Lock &amp; Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-[#E9E1DF] flex justify-end">
                <button
                  onClick={() => showToast('Settings saved and synchronized with DTCM gateway.')}
                  className="px-5 py-2.5 rounded-lg bg-[#8D4B00] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* VIEW TAB 7: SEO & SEARCH DOMINANCE AUDIT */}
          {activeNav === 'seo-audit' && <SeoAuditDashboard />}
        </main>
      </div>

      {/* QUICK EDIT / CREATE SLIDE-OVER DRAWER (Matches screenshot drawer) */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-[#E9E1DF] shadow-2xl z-[100] transform transition-transform duration-300 flex flex-col justify-between ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 overflow-y-auto flex-1">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E9E1DF]">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#8D4B00] uppercase tracking-wider">Direct Tour Modifier</span>
              <h3 className="font-serif font-bold text-xl text-[#1E1B1A]">
                {drawerMode === 'edit' ? selectedTour?.title : 'Add New Tour Experience'}
              </h3>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-[#F5ECEA] text-[#554336] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Drawer Form Fields */}
          <div className="flex flex-col gap-5 pt-4">
            <div className="p-3.5 rounded-lg bg-[#FBF2F0] border border-[#E9E1DF] flex items-center justify-between">
              <span className="text-xs font-bold text-[#1E1B1A]">Today's Real-time Slots</span>
              <span className="font-serif font-bold text-lg text-[#8D4B00]">
                {selectedTour ? `${capacities[selectedTour.id]?.booked || 38} / ${capacities[selectedTour.id]?.max || 45}` : '30 / 30 Available'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#554336]">Tour Title</label>
              <input
                type="text"
                value={drawerTitle}
                onChange={(e) => setDrawerTitle(e.target.value)}
                placeholder="e.g. Evening Desert Safari"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5ECEA] text-xs font-bold text-[#1E1B1A] focus:outline-none focus:ring-2 focus:ring-[#8D4B00] border border-[#E9E1DF]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#554336]">Category</label>
              <select
                value={drawerCategory}
                onChange={(e) => setDrawerCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5ECEA] text-xs font-bold text-[#1E1B1A] focus:outline-none focus:ring-2 focus:ring-[#8D4B00] border border-[#E9E1DF]"
              >
                <option value="desert-safaris">Desert Safaris</option>
                <option value="buggies">Buggies &amp; Quad ATVs</option>
                <option value="city-tours">City Excursions</option>
                <option value="private-convoys">Private Royal Convoys</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#554336]">Headline Base Rate (AED)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#554336] font-bold text-xs">AED</span>
                <input
                  type="number"
                  value={drawerPrice}
                  onChange={(e) => setDrawerPrice(Number(e.target.value))}
                  className="w-full pl-14 pr-4 py-2.5 rounded-lg bg-[#F5ECEA] text-xs font-bold text-[#1E1B1A] focus:outline-none focus:ring-2 focus:ring-[#8D4B00] border border-[#E9E1DF]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#554336]">Promotional Badge Tag</label>
              <input
                type="text"
                value={drawerBadge}
                onChange={(e) => setDrawerBadge(e.target.value)}
                placeholder="e.g. Best Seller, VIP Private, Sunrise"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5ECEA] text-xs text-[#1E1B1A] focus:outline-none focus:ring-2 focus:ring-[#8D4B00] border border-[#E9E1DF]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#554336]">Departure &amp; Timing Window</label>
              <input
                type="text"
                value={drawerTiming}
                onChange={(e) => setDrawerTiming(e.target.value)}
                placeholder="02:30 PM - 09:30 PM"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5ECEA] text-xs text-[#1E1B1A] focus:outline-none focus:ring-2 focus:ring-[#8D4B00] border border-[#E9E1DF]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#554336]">Pickup Hub &amp; Meeting Point</label>
              <input
                type="text"
                value={drawerPickup}
                onChange={(e) => setDrawerPickup(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5ECEA] text-xs text-[#1E1B1A] focus:outline-none focus:ring-2 focus:ring-[#8D4B00] border border-[#E9E1DF]"
              />
            </div>

            {/* Display & Automation Toggles */}
            <div className="flex flex-col gap-2.5 pt-2">
              <span className="text-xs font-bold text-[#554336]">Display &amp; Automation Toggles</span>
              <div className="p-3 rounded-lg bg-[#F5ECEA] border border-[#E9E1DF] flex items-center justify-between">
                <span className="text-xs text-[#1E1B1A]">Feature on Storefront Hero Grid</span>
                <input
                  type="checkbox"
                  checked={drawerFeatured}
                  onChange={(e) => setDrawerFeatured(e.target.checked)}
                  className="h-4 w-4 rounded text-[#8D4B00] focus:ring-[#8D4B00] accent-[#8D4B00] cursor-pointer"
                />
              </div>
              <div className="p-3 rounded-lg bg-[#F5ECEA] border border-[#E9E1DF] flex items-center justify-between">
                <span className="text-xs text-[#1E1B1A]">Auto-generate PDF Voucher to WhatsApp</span>
                <input
                  type="checkbox"
                  checked={drawerVoucherAuto}
                  onChange={(e) => setDrawerVoucherAuto(e.target.checked)}
                  className="h-4 w-4 rounded text-[#8D4B00] focus:ring-[#8D4B00] accent-[#8D4B00] cursor-pointer"
                />
              </div>
              <div className="p-3 rounded-lg bg-[#F5ECEA] border border-[#E9E1DF] flex items-center justify-between">
                <span className="text-xs text-[#1E1B1A]">Instant Confirmation Badge</span>
                <input
                  type="checkbox"
                  checked={drawerInstantConfirm}
                  onChange={(e) => setDrawerInstantConfirm(e.target.checked)}
                  className="h-4 w-4 rounded text-[#8D4B00] focus:ring-[#8D4B00] accent-[#8D4B00] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-6 bg-[#FBF2F0] border-t border-[#E9E1DF] flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="flex-1 py-2.5 rounded-lg bg-[#F5ECEA] hover:bg-[#EFE6E4] text-xs font-bold uppercase tracking-wider text-[#1E1B1A] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveDrawer}
            className="flex-1 py-2.5 rounded-lg bg-[#8D4B00] hover:bg-[#B15F00] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
