import React, { useState, useRef, useEffect } from 'react';
import { Experience, OffRoadPricingConfig } from '../../types';
import { DEFAULT_OFF_ROAD_PRICING, EXPERIENCES, getBuggyPrice, getQuadBikePrice } from '../../data/safaris';
import { SeoAuditDashboard } from './SeoAuditDashboard';
import { AdminSession } from '../../utils/adminAuth';
import { PhoenixLogo } from '../icons/PhoenixLogo';
import { B2BIntegrationManager } from './B2BIntegrationManager';
import { KnowledgeBaseTab } from './KnowledgeBaseTab';
import { ToursAvailabilityTab } from './ToursAvailabilityTab';

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

export interface SiteBackupData {
  version: string;
  exportedAt: string;
  exportedBy: string;
  appletTitle: string;
  dtcmLicense: string;
  cmsConfig: CMSConfig;
  experiences: Experience[];
  offRoadPricing?: OffRoadPricingConfig;
  capacities?: Record<string, { booked: number; max: number }>;
  bookings?: AdminBooking[];
  metadata?: {
    platform: string;
    totalTours: number;
    headquarters: string;
  };
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  label: string;
  exportedBy: string;
  toursCount: number;
  data: SiteBackupData;
  type: 'manual' | 'auto-pre-restore' | 'baseline';
}

export interface AdminDashboardProps {
  cmsConfig: CMSConfig;
  onUpdateCmsConfig: (updated: CMSConfig) => void;
  experiences: Experience[];
  onUpdateExperience: (updated: Experience) => void;
  onAddExperience: (newExp: Experience) => void;
  onDeleteExperience: (id: string) => void;
  onSwitchToStorefront: () => void;
  adminSession?: AdminSession | null;
  onSignOut?: () => void;
  onRestoreAll?: (newCmsConfig: CMSConfig, newExperiences: Experience[], newOffRoadPricing?: OffRoadPricingConfig) => void;
  offRoadPricing?: OffRoadPricingConfig;
  onUpdateOffRoadPricing?: (updated: OffRoadPricingConfig) => void;
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
  onRestoreAll,
  offRoadPricing,
  onUpdateOffRoadPricing,
}) => {
  // Navigation tabs
  const [activeNav, setActiveNav] = useState<
    'overview-analytics' | 'homepage-cms' | 'tour-catalog-pricing' | 'tours-availability' | 'b2b-integration' | 'offroad-pricing' | 'bookings-convoys' | 'customer-inquiries-whatsapp' | 'seo-audit' | 'backup-restore' | 'ai-knowledge-base' | 'settings'
  >('tour-catalog-pricing');

  // Off-Road Pricing local state
  const [localOffRoadPricing, setLocalOffRoadPricing] = useState<OffRoadPricingConfig>(() => {
    if (offRoadPricing) return offRoadPricing;
    const saved = localStorage.getItem('phoenix_offroad_pricing');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error reading saved off-road pricing', e);
      }
    }
    return DEFAULT_OFF_ROAD_PRICING;
  });

  useEffect(() => {
    if (offRoadPricing) {
      setLocalOffRoadPricing(offRoadPricing);
    }
  }, [offRoadPricing]);

  const handleUpdateQuadTier = (
    tierKey: 'quad220cc' | 'quad350cc',
    field: keyof OffRoadPricingConfig['quad220cc'],
    value: number
  ) => {
    const updated: OffRoadPricingConfig = {
      ...localOffRoadPricing,
      [tierKey]: {
        ...localOffRoadPricing[tierKey],
        [field]: value,
      },
    };
    setLocalOffRoadPricing(updated);
    if (onUpdateOffRoadPricing) {
      onUpdateOffRoadPricing(updated);
    }
    localStorage.setItem('phoenix_offroad_pricing', JSON.stringify(updated));
  };

  const handleUpdateBuggyTier = (
    modelKey: 'buggyPolaris' | 'buggyCanAm',
    field: keyof OffRoadPricingConfig['buggyPolaris'],
    value: number
  ) => {
    const updated: OffRoadPricingConfig = {
      ...localOffRoadPricing,
      [modelKey]: {
        ...localOffRoadPricing[modelKey],
        [field]: value,
      },
    };
    setLocalOffRoadPricing(updated);
    if (onUpdateOffRoadPricing) {
      onUpdateOffRoadPricing(updated);
    }
    localStorage.setItem('phoenix_offroad_pricing', JSON.stringify(updated));
  };

  const handleResetOffRoadDefaults = () => {
    setLocalOffRoadPricing(DEFAULT_OFF_ROAD_PRICING);
    if (onUpdateOffRoadPricing) {
      onUpdateOffRoadPricing(DEFAULT_OFF_ROAD_PRICING);
    }
    localStorage.setItem('phoenix_offroad_pricing', JSON.stringify(DEFAULT_OFF_ROAD_PRICING));
    showToast('Off-road machine rates reset to factory defaults.');
  };

  // Mobile navigation drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Synchronize local states if cmsConfig prop is restored or updated externally
  useEffect(() => {
    setHeroH1(cmsConfig.heroTitle);
    setHeroSub(cmsConfig.heroSubtitle);
    setAnnouncementText(cmsConfig.announcementTicker);
    setAnnouncementActive(cmsConfig.showAnnouncement);
    setPhoneText(cmsConfig.directPhone);
    setHqText(cmsConfig.headquarters);
  }, [cmsConfig]);

  // Drawer modal state for editing or creating a tour
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'edit' | 'create'>('edit');
  const [selectedTour, setSelectedTour] = useState<Experience | null>(null);

  // Drawer form fields
  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerSubtitle, setDrawerSubtitle] = useState('');
  const [drawerDescription, setDrawerDescription] = useState('');
  const [drawerImage, setDrawerImage] = useState('');
  const [drawerPrice, setDrawerPrice] = useState<number>(120);
  const [drawerBadge, setDrawerBadge] = useState('');
  const [drawerCategory, setDrawerCategory] = useState<'desert-safaris' | 'city-tours' | 'buggies' | 'private-convoys'>('desert-safaris');
  const [drawerDuration, setDrawerDuration] = useState('7 Hours');
  const [drawerTiming, setDrawerTiming] = useState('02:30 PM - 09:30 PM');
  const [drawerPickup, setDrawerPickup] = useState('DAMAC XL Tower, Business Bay / Hotel Lobby');
  const [drawerFeatured, setDrawerFeatured] = useState(true);
  const [drawerVoucherAuto, setDrawerVoucherAuto] = useState(true);
  const [drawerInstantConfirm, setDrawerInstantConfirm] = useState(true);

  // Drawer itinerary state for timeline steps
  const [drawerItinerary, setDrawerItinerary] = useState<{ time: string; title: string; description: string }[]>([]);

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
      convoyNumber: 'Buggy Quad Squad',
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

  // Gmail SMTP Testing
  const [testingSmtp, setTestingSmtp] = useState(false);
  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminSession?.email || 'awalgsm@gmail.com' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✅ Test email dispatched successfully to ${adminSession?.email || 'awalgsm@gmail.com'}!`);
      } else {
        showToast(`❌ SMTP Error: ${data.details || data.error || 'Failed to dispatch'}`);
      }
    } catch (err: any) {
      showToast(`❌ Network Error: ${err.message}`);
    } finally {
      setTestingSmtp(false);
    }
  };

  // --- BACKUP & RESTORE RECOVERY ENGINE ---
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localSnapshots, setLocalSnapshots] = useState<BackupSnapshot[]>(() => {
    try {
      const stored = localStorage.getItem('phoenix_backup_snapshots');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored backup snapshots', e);
    }
    return [
      {
        id: 'baseline-gold-master',
        timestamp: '2026-09-24T12:00:00.000Z',
        label: 'DTCM Factory Gold Baseline Master',
        exportedBy: 'system@phoenixdesertsafari.com',
        toursCount: 8,
        type: 'baseline',
        data: {
          version: '1.0.0',
          exportedAt: '2026-09-24T12:00:00.000Z',
          exportedBy: 'system@phoenixdesertsafari.com',
          appletTitle: 'The Phoenix Desert Safari Dubai',
          dtcmLicense: 'EXP-2024-8849',
          cmsConfig: { ...cmsConfig },
          experiences: EXPERIENCES,
        },
      },
    ];
  });

  const [pendingRestore, setPendingRestore] = useState<SiteBackupData | null>(null);
  const [autoBackupBeforeRestore, setAutoBackupBeforeRestore] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [manualSnapshotName, setManualSnapshotName] = useState('');
  const [showManualSnapshotModal, setShowManualSnapshotModal] = useState(false);
  const [showFactoryResetModal, setShowFactoryResetModal] = useState(false);
  const [selectedSnapshotForDetails, setSelectedSnapshotForDetails] = useState<BackupSnapshot | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Construct current point-in-time backup object
  const createCurrentBackupPayload = (label?: string): SiteBackupData => {
    return {
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      exportedBy: adminSession?.email || 'awalgsm@gmail.com',
      appletTitle: 'The Phoenix Desert Safari Dubai',
      dtcmLicense: 'EXP-2024-8849',
      cmsConfig: {
        ...cmsConfig,
        heroTitle: heroH1,
        heroSubtitle: heroSub,
        announcementTicker: announcementText,
        showAnnouncement: announcementActive,
        directPhone: phoneText,
        headquarters: hqText,
      },
      experiences: experiences,
      capacities: capacities,
      bookings: bookings,
      metadata: {
        platform: 'Vite React AI Studio SPA',
        totalTours: experiences.length,
        headquarters: hqText,
      },
    };
  };

  // Save snapshot to browser local storage
  const saveLocalSnapshot = (
    backup: SiteBackupData,
    label: string,
    type: 'manual' | 'auto-pre-restore' | 'baseline' = 'manual'
  ) => {
    try {
      const snap: BackupSnapshot = {
        id: `snap-${Date.now()}`,
        timestamp: new Date().toISOString(),
        label,
        exportedBy: backup.exportedBy,
        toursCount: backup.experiences.length,
        data: backup,
        type,
      };
      const updated = [snap, ...localSnapshots.filter((s) => s.id !== snap.id)].slice(0, 15);
      setLocalSnapshots(updated);
      localStorage.setItem('phoenix_backup_snapshots', JSON.stringify(updated));
      return snap;
    } catch (e) {
      console.warn('Failed saving local snapshot', e);
      return null;
    }
  };

  // Remove a local rollback snapshot
  const deleteLocalSnapshot = (id: string) => {
    if (id === 'baseline-gold-master') {
      showToast('The DTCM Factory Baseline cannot be deleted.');
      return;
    }
    const updated = localSnapshots.filter((s) => s.id !== id);
    setLocalSnapshots(updated);
    try {
      localStorage.setItem('phoenix_backup_snapshots', JSON.stringify(updated));
    } catch {}
    showToast('Snapshot removed from local storage.');
  };

  // Export and download full JSON backup file
  const handleExportBackup = (label?: string) => {
    setIsExporting(true);
    try {
      const payload = createCurrentBackupPayload(label);
      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const datePart = new Date().toISOString().slice(0, 10);
      const timePart = new Date().toTimeString().slice(0, 5).replace(':', '');
      a.href = url;
      a.download = `phoenix-safari-backup-${datePart}-${timePart}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      saveLocalSnapshot(payload, label || `Manual JSON Export (${datePart})`, 'manual');
      showToast('Backup file downloaded & saved to local recovery points.');
    } catch (err) {
      showToast('Failed to export backup. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Take a local manual snapshot point
  const handleCreateManualSnapshot = () => {
    const label =
      manualSnapshotName.trim() ||
      `Manual Snapshot (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
    const payload = createCurrentBackupPayload(label);
    saveLocalSnapshot(payload, label, 'manual');
    setShowManualSnapshotModal(false);
    setManualSnapshotName('');
    showToast(`Snapshot "${label}" created successfully.`);
  };

  // Parse and validate uploaded backup JSON file
  const processBackupFile = (file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      showToast('Please upload a valid JSON backup file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Root must be an object');
        }

        if (!parsed.cmsConfig && !parsed.experiences) {
          throw new Error('Backup must contain either cmsConfig or experiences.');
        }

        if (parsed.experiences && !Array.isArray(parsed.experiences)) {
          throw new Error('experiences must be an array.');
        }

        const normalized: SiteBackupData = {
          version: parsed.version || '1.0.0',
          exportedAt: parsed.exportedAt || new Date().toISOString(),
          exportedBy: parsed.exportedBy || 'Unknown Administrator',
          appletTitle: parsed.appletTitle || 'The Phoenix Desert Safari Dubai',
          dtcmLicense: parsed.dtcmLicense || 'EXP-2024-8849',
          cmsConfig: parsed.cmsConfig || { ...cmsConfig },
          experiences: Array.isArray(parsed.experiences) ? parsed.experiences : experiences,
          capacities: parsed.capacities || capacities,
          bookings: Array.isArray(parsed.bookings) ? parsed.bookings : bookings,
          metadata: parsed.metadata,
        };

        setPendingRestore(normalized);
        showToast('Backup verified! Please review snapshot details to confirm restore.');
      } catch (err: any) {
        showToast(`Corrupted or invalid backup file: ${err.message || 'Check JSON format'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processBackupFile(file);
    e.target.value = '';
  };

  // Execute confirmation of restore
  const handleConfirmRestore = () => {
    if (!pendingRestore) return;

    try {
      if (autoBackupBeforeRestore) {
        const currentPayload = createCurrentBackupPayload('Auto-Snapshot Before Restore');
        saveLocalSnapshot(currentPayload, 'Auto-Snapshot Before Restore', 'auto-pre-restore');
      }

      // Update CMS config
      if (pendingRestore.cmsConfig) {
        onUpdateCmsConfig(pendingRestore.cmsConfig);
        setHeroH1(pendingRestore.cmsConfig.heroTitle || heroH1);
        setHeroSub(pendingRestore.cmsConfig.heroSubtitle || heroSub);
        setAnnouncementText(pendingRestore.cmsConfig.announcementTicker || announcementText);
        setAnnouncementActive(pendingRestore.cmsConfig.showAnnouncement ?? announcementActive);
        setPhoneText(pendingRestore.cmsConfig.directPhone || phoneText);
        setHqText(pendingRestore.cmsConfig.headquarters || hqText);
      }

      // Update experiences catalog
      if (pendingRestore.experiences && Array.isArray(pendingRestore.experiences)) {
        if (onRestoreAll && pendingRestore.cmsConfig) {
          onRestoreAll(pendingRestore.cmsConfig, pendingRestore.experiences);
        } else {
          pendingRestore.experiences.forEach((exp) => onUpdateExperience(exp));
        }
      }

      if (pendingRestore.capacities) {
        setCapacities(pendingRestore.capacities);
      }

      if (pendingRestore.bookings && Array.isArray(pendingRestore.bookings)) {
        setBookings(pendingRestore.bookings);
      }

      const tourCount = pendingRestore.experiences?.length || experiences.length;
      showToast(`Website restored! ${tourCount} tours & CMS settings now active.`);
      setPendingRestore(null);
    } catch (e: any) {
      showToast(`Error restoring backup: ${e.message}`);
    }
  };

  // Factory reset back to standard baseline
  const handleFactoryReset = () => {
    const currentPayload = createCurrentBackupPayload('Auto-Snapshot Before Factory Reset');
    saveLocalSnapshot(currentPayload, 'Auto-Snapshot Before Factory Reset', 'auto-pre-restore');

    const defaultCms: CMSConfig = {
      heroTitle: "Experience the Untamed Spirit of Dubai's Golden Dunes",
      heroSubtitle:
        'Phoenix Desert Safari is a Dubai tour operator offering authentic Bedouin desert experiences, 5-star camp hospitality, private convoys, and 1000HP dune buggies.',
      heroImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCwh3IxGfRyabThS2IkAAkO8dgF-efStfsRxJ1OeVcgXu3uJ4GtgqV_Ma90tHpmLrmvedQGkOkh0VKcZlNh8e5DBmZy2TtfVPWAKzOJ2cZlwKwdVahe2FQVZ-BwAqh3Pi2Cpg_Y--XbSM36LrxiBL5HqQ55NT_aE_KkRfbdCo1qqbXXXhkZNoiG6yGKjm_Dzi9nmdUz_ADZ9vR_MmbdmkTNoWUG5oPjljsrmRK8AUVCrFZWyKzGs4vZ_A',
      announcementTicker:
        'DTCM Licensed Operator • Business Bay, Dubai | Instant Voucher Confirmation',
      showAnnouncement: true,
      defaultBookingExperience: 'evening-desert-safari',
      directPhone: '+971 56 150 5270',
      headquarters: 'DAMAC XL Tower - Business Bay, Dubai',
      whatsappWebhook: 'UltraMsg v2.4 (Active Webhook)',
    };

    if (onRestoreAll) {
      onRestoreAll(defaultCms, EXPERIENCES);
    } else {
      onUpdateCmsConfig(defaultCms);
      EXPERIENCES.forEach((e) => onUpdateExperience(e));
    }

    setHeroH1(defaultCms.heroTitle);
    setHeroSub(defaultCms.heroSubtitle);
    setAnnouncementText(defaultCms.announcementTicker);
    setAnnouncementActive(defaultCms.showAnnouncement);
    setPhoneText(defaultCms.directPhone);
    setHqText(defaultCms.headquarters);

    setShowFactoryResetModal(false);
    showToast('Factory baseline restored. Original 8 DTCM tours & settings active.');
  };

  // Open Edit Drawer for an existing tour
  const handleOpenEdit = (tour: Experience, focusSection?: string) => {
    setSelectedTour(tour);
    setDrawerMode('edit');
    setDrawerTitle(tour.title);
    setDrawerSubtitle(tour.subtitle || '');
    setDrawerDescription(tour.description || '');
    setDrawerImage(tour.image || '');
    setDrawerPrice(tour.priceAED);
    setDrawerBadge(tour.badge);
    setDrawerCategory(tour.category);
    setDrawerDuration(tour.duration);
    setDrawerTiming(tour.departureTime || '02:30 PM - 09:30 PM');
    setDrawerPickup(tour.hotelPickup ? 'Doorstep Home & Hotel Pickup across Dubai & Sharjah' : 'Desert Base Camp Meeting Point');
    setDrawerFeatured(tour.featured ?? true);

    if (tour.itinerary && tour.itinerary.length > 0) {
      setDrawerItinerary(tour.itinerary.map((item) => ({ ...item })));
    } else {
      setDrawerItinerary([
        { time: '02:30 PM - 03:30 PM', title: 'Doorstep 4x4 Pickup', description: 'Air-conditioned Land Cruiser pick up from your hotel or home in Dubai/Sharjah.' },
        { time: '04:00 PM - 05:00 PM', title: 'Red Dune Bashing & Sandboarding', description: 'Thrilling 30-45 mins dune bashing over Lahbab red sand dunes and sandboarding.' },
        { time: '05:30 PM - 06:15 PM', title: 'Sunset Dune Photography', description: 'Golden hour stop atop high dunes for panoramic sunset photos.' },
        { time: '06:30 PM - 09:00 PM', title: '5-Star Bedouin Camp Hospitality', description: 'Arabic coffee, BBQ buffet dinner, shisha, camel rides, falcon photos & 3 live dance shows.' },
        { time: '09:00 PM - 09:45 PM', title: 'Hotel Drop-Off', description: 'Comfortable chauffeur drop-off directly back to your residence.' },
      ]);
    }

    setIsDrawerOpen(true);

    if (focusSection === 'itinerary') {
      setTimeout(() => {
        const el = document.getElementById('drawer-itinerary-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    }
  };

  // Open Drawer to create a new tour
  const handleOpenCreate = () => {
    setSelectedTour(null);
    setDrawerMode('create');
    setDrawerTitle('');
    setDrawerSubtitle('Curated Phoenix Dubai Experience');
    setDrawerDescription('Experience the pinnacle of Arabian desert heritage, sunset dune bashing, and authentic Bedouin 5-star camp hospitality in the Dubai Desert Conservation Reserve.');
    setDrawerImage('https://lh3.googleusercontent.com/aida-public/AB6AXuD-WGzdpK8MS1oA3hauA_Ygx6gWG9_iDxkJhAkQyV5wuzUwmRq0ijeyHwq3h7p9z02MkR7BZE-vSYaLQwFsvp5MExNqXcROyPeCHHjDrUvM9bx70FlWEd_J2KOTqNcG-z7by7k8TKZvYm4gqz_sNTzbUj2XGT9NwvAOEI1l-7xTYTLJklG39UiXhzFbHysO08Qy-SRI5J9bPEztGnzm3Z-UC7hqAcsV6QYDodQ8Ykn4iQ3n7OPoPVohXg');
    setDrawerPrice(250);
    setDrawerBadge('New Experience');
    setDrawerCategory('desert-safaris');
    setDrawerDuration('4 Hours');
    setDrawerTiming('03:30 PM - 07:30 PM');
    setDrawerPickup('Doorstep Home & Hotel Pickup across Dubai & Sharjah');
    setDrawerFeatured(true);

    setDrawerItinerary([
      { time: '02:30 PM - 03:30 PM', title: 'Doorstep 4x4 Pickup', description: 'Air-conditioned Land Cruiser pick up from your hotel or home in Dubai/Sharjah.' },
      { time: '04:00 PM - 05:00 PM', title: 'Red Dune Bashing & Sandboarding', description: 'Thrilling 30-45 mins dune bashing over Lahbab red sand dunes and sandboarding.' },
      { time: '05:30 PM - 06:15 PM', title: 'Sunset Dune Photography', description: 'Golden hour stop atop high dunes for panoramic sunset photos.' },
      { time: '06:30 PM - 09:00 PM', title: '5-Star Bedouin Camp Hospitality', description: 'Arabic coffee, BBQ buffet dinner, shisha, camel rides, falcon photos & 3 live dance shows.' },
      { time: '09:00 PM - 09:45 PM', title: 'Hotel Drop-Off', description: 'Comfortable chauffeur drop-off directly back to your residence.' },
    ]);

    setIsDrawerOpen(true);
  };

  // Itinerary Helper Functions
  const handleAddItineraryStep = () => {
    setDrawerItinerary((prev) => [
      ...prev,
      {
        time: `Step ${prev.length + 1}`,
        title: 'New Timeline Activity',
        description: 'Provide details for this activity step...',
      },
    ]);
  };

  const handleUpdateItineraryStep = (index: number, field: 'time' | 'title' | 'description', value: string) => {
    setDrawerItinerary((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveItineraryStep = (index: number) => {
    setDrawerItinerary((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveItineraryStep = (index: number, direction: 'up' | 'down') => {
    setDrawerItinerary((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleLoadItineraryPreset = (presetType: 'safari' | 'offroad' | 'city' | 'clear') => {
    if (presetType === 'clear') {
      setDrawerItinerary([]);
      return;
    }
    if (presetType === 'safari') {
      setDrawerItinerary([
        { time: '02:30 PM - 03:30 PM', title: 'Doorstep 4x4 Pickup', description: 'Air-conditioned Land Cruiser pick up from your hotel or home in Dubai/Sharjah.' },
        { time: '04:00 PM - 05:00 PM', title: 'Red Dune Bashing & Sandboarding', description: 'Thrilling 30-45 mins dune bashing over Lahbab red sand dunes and sandboarding.' },
        { time: '05:30 PM - 06:15 PM', title: 'Sunset Dune Photography', description: 'Golden hour stop atop high dunes for panoramic sunset photos.' },
        { time: '06:30 PM - 09:00 PM', title: '5-Star Bedouin Camp Hospitality', description: 'Arabic coffee, BBQ buffet dinner, shisha, camel rides, falcon photos & 3 live dance shows.' },
        { time: '09:00 PM - 09:45 PM', title: 'Hotel Drop-Off', description: 'Comfortable chauffeur drop-off directly back to your residence.' },
      ]);
    } else if (presetType === 'offroad') {
      setDrawerItinerary([
        { time: '0-15 Min', title: 'Gear Fitting & Safety Briefing', description: 'Full helmet, goggles fitting, and professional briefing on vehicle throttle & safety controls.' },
        { time: '15-45 Min', title: 'Self-Drive Quad or Buggy Run', description: 'Ride across open red dunes or circle track with lead marshal guide escort.' },
        { time: '45-60 Min', title: 'High Dune Sunset Photo Stop & Refreshment', description: 'Stop at cresting dunes for photos and chilled mineral water.' },
      ]);
    } else if (presetType === 'city') {
      setDrawerItinerary([
        { time: '09:00 AM', title: 'Hotel Chauffeur Pickup', description: 'Luxury Mercedes or SUV pick-up from your hotel lobby.' },
        { time: '09:30 AM - 11:30 AM', title: 'Old Dubai & Gold Souk Heritage Walk', description: 'Al Fahidi Fort, Abra boat creek crossing, Gold & Spice Souk guided walk.' },
        { time: '12:00 PM - 01:30 PM', title: 'Modern Dubai Landmarks', description: 'Photo stops at Burj Al Arab, Palm Jumeirah, Atlantis, and Dubai Marina.' },
        { time: '02:00 PM', title: 'Burj Khalifa & Dubai Mall Drop-Off', description: 'Conclude tour at Dubai Mall / Burj Khalifa entrance or return to hotel.' },
      ]);
    }
  };

  // Save changes from drawer
  const handleSaveDrawer = () => {
    if (!drawerTitle.trim()) {
      showToast('Please enter a tour title.');
      return;
    }

    const cleanItinerary = drawerItinerary.filter(
      (step) => step.title.trim() !== '' || step.time.trim() !== ''
    );

    if (drawerMode === 'edit' && selectedTour) {
      const updated: Experience = {
        ...selectedTour,
        title: drawerTitle,
        subtitle: drawerSubtitle.trim() || selectedTour.subtitle,
        description: drawerDescription.trim() || selectedTour.description,
        image: drawerImage.trim() || selectedTour.image,
        altText: drawerTitle,
        priceAED: Number(drawerPrice),
        badge: drawerBadge,
        category: drawerCategory,
        duration: drawerDuration,
        departureTime: drawerTiming,
        featured: drawerFeatured,
        itinerary: cleanItinerary,
      };
      onUpdateExperience(updated);
      showToast(`Updated "${drawerTitle}" (AED ${drawerPrice}) & itinerary timeline!`);
    } else {
      const newId = 'tour-' + Date.now();
      const newExp: Experience = {
        id: newId,
        title: drawerTitle,
        subtitle: drawerSubtitle.trim() || 'Curated Phoenix Dubai Experience',
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
        description: drawerDescription.trim() || 'Exclusive desert adventure crafted to the highest DTCM Dubai luxury standards.',
        image:
          drawerImage.trim() ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuD-WGzdpK8MS1oA3hauA_Ygx6gWG9_iDxkJhAkQyV5wuzUwmRq0ijeyHwq3h7p9z02MkR7BZE-vSYaLQwFsvp5MExNqXcROyPeCHHjDrUvM9bx70FlWEd_J2KOTqNcG-z7by7k8TKZvYm4gqz_sNTzbUj2XGT9NwvAOEI1l-7xTYTLJklG39UiXhzFbHysO08Qy-SRI5J9bPEztGnzm3Z-UC7hqAcsV6QYDodQ8Ykn4iQ3n7OPoPVohXg',
        altText: drawerTitle,
        highlights: ['Desert Safari Convoy', 'Hotel Chauffeur', '5-Star Hospitality'],
        departureTime: drawerTiming,
        hotelPickup: true,
        featured: drawerFeatured,
        itinerary: cleanItinerary,
      };
      onAddExperience(newExp);
      setCapacities((prev) => ({
        ...prev,
        [newId]: { booked: 0, max: 30 },
      }));
      showToast(`Created new tour "${drawerTitle}" with itinerary timeline!`);
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

      {/* MOBILE SLIDE-OUT MENU DRAWER (Mobile & Tablet) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Drawer Canvas */}
          <div className="relative w-80 max-w-[85vw] bg-[#FBF2F0] h-full shadow-2xl z-10 flex flex-col justify-between py-5 px-4 overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="flex flex-col gap-4">
              {/* Header with Brand & Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-[#DBC2B0]/40">
                <div
                  className="flex items-center gap-2.5 cursor-pointer"
                  onClick={() => {
                    onSwitchToStorefront();
                    setIsMobileMenuOpen(false);
                  }}
                  title="Switch to Storefront"
                >
                  <PhoenixLogo className="h-8 w-auto" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-lg bg-[#EFE6E4] flex items-center justify-center text-[#554336] hover:text-[#1E1B1A]"
                  aria-label="Close menu drawer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1">
                {[
                  { id: 'homepage-cms', label: 'Homepage CMS & Showcase', icon: 'view_quilt', badge: 'Live' },
                  { id: 'tour-catalog-pricing', label: 'Tour Pricing & Slots', icon: 'explore', badge: `${experiences.length} Tours` },
                  { id: 'b2b-integration', label: 'B2B Supplier & API Sync', icon: 'hub', badge: 'Agency #1650' },
                  { id: 'offroad-pricing', label: 'Off-Road Machine Rates', icon: 'sports_motorsports', badge: 'Per Vehicle' },
                  { id: 'bookings-convoys', label: 'Bookings & Convoys', icon: 'directions_car', badge: '18 Active' },
                  { id: 'seo-audit', label: 'Technical SEO Audit', icon: 'travel_explore', badge: '98/100' },
                  { id: 'backup-restore', label: 'Backup & Restore Vault', icon: 'settings_backup_restore', badge: 'Safe' },
                  { id: 'overview-analytics', label: 'Overview & Analytics', icon: 'analytics', badge: null },
                  { id: 'customer-inquiries-whatsapp', label: 'WhatsApp Inquiries Desk', icon: 'chat', badge: 'Bot Active' },
                  { id: 'settings', label: 'Settings & Security', icon: 'settings', badge: null },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveNav(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                      activeNav === item.id
                        ? 'bg-[#8D4B00] text-white shadow-sm'
                        : 'text-[#554336] hover:bg-[#EFE6E4] hover:text-[#1E1B1A]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                          activeNav === item.id ? 'bg-white/20 text-white' : 'bg-[#EFE6E4] text-[#8D4B00]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Mobile Drawer Footer with Operator Session & Quick Actions */}
            <div className="flex flex-col gap-2.5 pt-3 border-t border-[#DBC2B0]/40">
              <div className="p-3 rounded-xl bg-stone-900 text-white flex flex-col gap-1 shadow-md border border-amber-500/30">
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
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSwitchToStorefront();
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-lg bg-white border border-[#E9E1DF] text-[#1E1B1A] text-xs font-bold text-center hover:bg-[#F5ECEA] transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#006194]">open_in_new</span>
                  <span>Storefront</span>
                </button>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      onSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-2.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/40 text-xs font-bold text-center transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[15px]">lock</span>
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FIXED SIDEBAR (W-72) - DESKTOP ONLY */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-[#FBF2F0] border-r border-[#E9E1DF] z-50 flex-col justify-between py-6 px-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-3 py-2 cursor-pointer" onClick={onSwitchToStorefront} title="Click to view Storefront">
            <PhoenixLogo className="h-8 w-auto" />
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
              onClick={() => setActiveNav('tours-availability')}
              className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                activeNav === 'tours-availability'
                  ? 'bg-[#8D4B00] text-white shadow-sm'
                  : 'text-[#554336] hover:bg-[#EFE6E4] hover:text-[#1E1B1A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                <span>Tours Availability</span>
              </div>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                  activeNav === 'tours-availability' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                Bulk
              </span>
            </button>

            <button
              onClick={() => setActiveNav('b2b-integration')}
              className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                activeNav === 'b2b-integration'
                  ? 'bg-[#8D4B00] text-white shadow-sm'
                  : 'text-[#554336] hover:bg-[#EFE6E4] hover:text-[#1E1B1A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">hub</span>
                <span>B2B Supplier &amp; API Sync</span>
              </div>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeNav === 'b2b-integration' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                }`}
              >
                78+ Live
              </span>
            </button>

            <button
              onClick={() => setActiveNav('offroad-pricing')}
              className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                activeNav === 'offroad-pricing'
                  ? 'bg-[#8D4B00] text-white shadow-sm'
                  : 'text-[#554336] hover:bg-[#EFE6E4] hover:text-[#1E1B1A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">sports_motorsports</span>
                <span>Off-Road Machine Rates</span>
              </div>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeNav === 'offroad-pricing' ? 'bg-white/20 text-white' : 'bg-[#FFDCC3] text-[#8D4B00]'
                }`}
              >
                Vehicles
              </span>
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
              onClick={() => setActiveNav('backup-restore')}
              className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                activeNav === 'backup-restore'
                  ? 'bg-[#8D4B00] text-white shadow-sm'
                  : 'text-[#554336] hover:bg-[#EFE6E4] hover:text-[#1E1B1A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">settings_backup_restore</span>
                <span>Backup &amp; Restore</span>
              </div>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeNav === 'backup-restore' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                }`}
              >
                Safe
              </span>
            </button>

            <button
              onClick={() => setActiveNav('ai-knowledge-base')}
              className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                activeNav === 'ai-knowledge-base'
                  ? 'bg-[#8D4B00] text-white shadow-sm'
                  : 'text-[#554336] hover:bg-[#EFE6E4] hover:text-[#1E1B1A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
                <span>AI Knowledge File</span>
              </div>
              <span
                className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                  activeNav === 'ai-knowledge-base' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                }`}
              >
                Live
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
      <div className="pl-0 lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* FIXED TOP HEADER (Responsive for Mobile & Desktop) */}
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 sm:h-20 bg-[#FFF8F6]/90 backdrop-blur-xl border-b border-[#E9E1DF] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40">
          {/* Mobile Header Bar (< lg) */}
          <div className="flex lg:hidden items-center justify-between h-16 px-4 gap-2 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-[#554336] hover:text-[#8D4B00] hover:bg-[#F5ECEA] transition-colors cursor-pointer"
                aria-label="Open menu drawer"
              >
                <span className="material-symbols-outlined text-[24px]">menu</span>
              </button>
              <div className="flex items-center gap-2 min-w-0">
                <PhoenixLogo className="h-7 w-auto" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EFE6E4] text-[#006194] shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006194] animate-pulse"></span>
                <span className="text-[10px] font-bold tracking-wide uppercase">DTCM</span>
              </div>
              <button
                type="button"
                onClick={() => showToast('All 18 desert convoys operating safely on schedule.')}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#554336] hover:text-[#1E1B1A] transition-colors"
                title="Notifications"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EA580C]"></span>
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="w-8 h-8 rounded-full bg-[#8D4B00] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#FFDCC3] cursor-pointer shadow-xs"
                title={adminSession?.email || 'awalgsm@gmail.com'}
              >
                A
              </button>
            </div>
          </div>

          {/* Desktop Header Bar (>= lg) */}
          <div className="hidden lg:flex h-20 w-full px-8 items-center justify-between gap-6">
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
        <main className="pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8 pb-28 lg:pb-16 w-full max-w-[1400px]">
          {/* Sub-header Breadcrumb & Direct Action Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 sm:pb-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-[#554336] text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mb-1 flex-wrap">
                <span className="hover:text-[#8D4B00] cursor-pointer transition-colors" onClick={() => setActiveNav('homepage-cms')}>
                  Admin Portal
                </span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-[#8D4B00]">
                  {activeNav === 'homepage-cms'
                    ? 'Homepage CMS & Tour Inventory'
                    : activeNav === 'tour-catalog-pricing'
                    ? 'Tour Catalog & Pricing Matrix'
                    : activeNav === 'tours-availability'
                    ? 'Tours Availability & Bulk Slot Engine'
                    : activeNav === 'bookings-convoys'
                    ? 'Bookings & Convoy Dispatch'
                    : activeNav === 'customer-inquiries-whatsapp'
                    ? 'WhatsApp & Inquiries Desk'
                    : activeNav === 'overview-analytics'
                    ? 'Operations & Revenue Analytics'
                    : activeNav === 'seo-audit'
                    ? 'SEO Audit & Search Engine Dominance'
                    : activeNav === 'backup-restore'
                    ? 'System Backup & Disaster Recovery'
                    : activeNav === 'ai-knowledge-base'
                    ? 'AI Concierge Tour Knowledge Base'
                    : 'System & DTCM Settings'}
                </span>
              </div>
              <h1 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-[#1E1B1A] tracking-tight leading-tight">
                {activeNav === 'homepage-cms'
                  ? 'Expeditions & Showcase Manager'
                  : activeNav === 'tour-catalog-pricing'
                  ? 'Tour Pricing & Capacity Matrix'
                  : activeNav === 'tours-availability'
                  ? 'Tours Availability & Bulk Slot Manager'
                  : activeNav === 'bookings-convoys'
                  ? 'Live Booking Vouchers & Convoys'
                  : activeNav === 'customer-inquiries-whatsapp'
                  ? 'Guest WhatsApp Concierge Desk'
                  : activeNav === 'overview-analytics'
                  ? 'Daily Revenue & Performance Metrics'
                  : activeNav === 'seo-audit'
                  ? 'Live Technical SEO Audit & Competitor Intelligence'
                  : activeNav === 'backup-restore'
                  ? 'System Backup & Disaster Recovery Vault'
                  : activeNav === 'ai-knowledge-base'
                  ? 'AI Knowledge Base File & Calculation Engine'
                  : 'Company Profile & Compliance Settings'}
              </h1>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFE6E4] shadow-xs text-xs font-semibold text-[#1E1B1A]">
                <span className="material-symbols-outlined text-[16px] text-[#8D4B00]">verified_user</span>
                <span>DTCM Permit #EXP-2024-8849</span>
              </div>

              {/* Quick Backup Action */}
              <button
                type="button"
                onClick={() => handleExportBackup('Quick Header Export')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#E9E1DF] text-[#1E1B1A] text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-[#F5ECEA] transition-all cursor-pointer"
                title="Download full site JSON backup"
              >
                <span className="material-symbols-outlined text-[16px] text-[#8D4B00]">download</span>
                <span>Backup</span>
              </button>

              {/* Quick Restore Vault Action */}
              <button
                type="button"
                onClick={() => setActiveNav('backup-restore')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer ${
                  activeNav === 'backup-restore'
                    ? 'bg-[#8D4B00] text-white'
                    : 'bg-white border border-[#E9E1DF] text-[#1E1B1A] hover:bg-[#F5ECEA]'
                }`}
                title="Open Backup & Restore Recovery Vault"
              >
                <span className="material-symbols-outlined text-[16px]">settings_backup_restore</span>
                <span>Restore Vault</span>
              </button>

              {/* Toggle to Live Storefront */}
              <button
                type="button"
                onClick={onSwitchToStorefront}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#E9E1DF] text-[#1E1B1A] text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-[#F5ECEA] transition-all cursor-pointer"
                title="Switch to customer storefront view"
              >
                <span className="material-symbols-outlined text-[16px] text-[#006194]">open_in_new</span>
                <span>Storefront</span>
              </button>

              {/* Publish CMS Button */}
              <button
                type="button"
                onClick={handlePublishCMS}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8D4B00] to-[#EA580C] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg hover:opacity-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">publish</span>
                <span>Publish Updates</span>
              </button>
            </div>
          </div>

          {/* KPI BENTO GRID (4 Cards) */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
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

                      {/* Direct Save & Publish Action Bar */}
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E9E1DF]">
                        <div className="flex items-center gap-2 text-xs text-[#554336]">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Changes auto-saved locally. Click Publish to update live storefront.</span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={handlePublishCMS}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#8D4B00] to-[#EA580C] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                          >
                            <span className="material-symbols-outlined text-[16px]">publish</span>
                            <span>Save &amp; Publish Changes</span>
                          </button>
                          <button
                            type="button"
                            onClick={onSwitchToStorefront}
                            className="px-3 py-2.5 rounded-lg bg-[#F5ECEA] hover:bg-[#EFE6E4] text-[#1E1B1A] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            title="View customer homepage"
                          >
                            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                            <span className="hidden sm:inline">View Site</span>
                          </button>
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

                {/* Main Data Container: Mobile Cards (md:hidden) & Desktop Table (hidden md:block) */}

                {/* 1. Mobile Cards View (Optimized for touch screens) */}
                <div className="md:hidden flex flex-col gap-3.5">
                  {filteredTours.map((tour) => {
                    const cap = capacities[tour.id] || { booked: 15, max: 25 };
                    const percentage = Math.round((cap.booked / cap.max) * 100);
                    const isHighDemand = percentage >= 80;

                    return (
                      <div
                        key={tour.id}
                        className="bg-white p-3.5 rounded-xl border border-[#E9E1DF] shadow-xs flex flex-col gap-3"
                      >
                        <div className="flex gap-3">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-[#F5ECEA] border border-[#E9E1DF]">
                            <img src={tour.image} alt={tour.altText} className="w-full h-full object-cover" />
                            {tour.badge && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#FFDBCE] text-[#370E00] text-[9px] uppercase font-bold tracking-tight">
                                {tour.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h3 className="font-bold text-sm text-[#1E1B1A] leading-tight line-clamp-1">{tour.title}</h3>
                              <div className="text-right shrink-0">
                                <span className="font-serif font-bold text-sm text-[#8D4B00] block leading-tight">
                                  AED {tour.priceAED}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-[#554336] line-clamp-1 mt-0.5">{tour.subtitle}</p>
                            <div className="flex items-center gap-2 mt-1.5 text-[#554336] text-[11px]">
                              <span className="flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[13px] text-[#8D4B00]">schedule</span>
                                {tour.duration}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[13px] text-[#EA580C]">departure_board</span>
                                {tour.departureTime || 'Daily Slot'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Capacity Bar & Touch Controls */}
                        <div className="pt-2 bg-[#FBF2F0] p-2.5 rounded-lg flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="text-[#1E1B1A] font-semibold">Booked {cap.booked}/{cap.max} Guests</span>
                              <span className={`font-bold ${isHighDemand ? 'text-[#EA580C]' : 'text-[#8D4B00]'}`}>
                                {percentage}%
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-[#EFE6E4] overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isHighDemand ? 'bg-gradient-to-r from-[#8D4B00] to-[#EA580C]' : 'bg-[#8D4B00]'}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(tour, 'itinerary')}
                              className="px-2 py-1 rounded-lg bg-[#FFDCC3] border border-[#8D4B00]/20 flex items-center gap-1 text-[#2F1500] font-bold text-[10px] shadow-2xs hover:bg-[#FFCBB0] cursor-pointer"
                              title="Edit & Add Itinerary Steps"
                            >
                              <span className="material-symbols-outlined text-[14px]">route</span>
                              <span>Itinerary ({tour.itinerary?.length || 0})</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(tour)}
                              className="w-8 h-8 rounded-lg bg-white border border-[#E9E1DF] flex items-center justify-center text-[#1E1B1A] hover:text-[#8D4B00] shadow-2xs cursor-pointer"
                              title="Edit tour"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleFeatured(tour)}
                              className={`w-8 h-8 rounded-lg border flex items-center justify-center shadow-2xs ${
                                tour.featured ? 'bg-[#FFDCC3] border-[#8D4B00]/40 text-[#8D4B00]' : 'bg-white border-[#E9E1DF] text-stone-400'
                              }`}
                              title={tour.featured ? 'Featured on storefront' : 'Not featured'}
                            >
                              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: tour.featured ? "'FILL' 1" : "'FILL' 0" }}>
                                star
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateTour(tour)}
                              className="w-8 h-8 rounded-lg bg-white border border-[#E9E1DF] flex items-center justify-center text-[#554336] hover:text-[#1E1B1A] shadow-2xs"
                              title="Duplicate tour"
                            >
                              <span className="material-symbols-outlined text-[16px]">content_copy</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Desktop Table View (Hidden on mobile) */}
                <div className="hidden md:block overflow-hidden rounded-xl bg-white border border-[#E9E1DF] shadow-xs">
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
                                    onClick={() => handleOpenEdit(tour, 'itinerary')}
                                    className="px-2.5 py-1 rounded-lg bg-[#FFDCC3] hover:bg-[#FFCBB0] border border-[#8D4B00]/20 text-[#2F1500] font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                    title="Edit & Add Itinerary Steps"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">route</span>
                                    <span>Itinerary ({tour.itinerary?.length || 0})</span>
                                  </button>
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
                        <span className="text-[11px] text-[#554336] font-medium">{exp.duration}</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenEdit(exp, 'itinerary')}
                            className="text-xs font-bold text-[#8D4B00] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">route</span>
                            <span>Itinerary ({exp.itinerary?.length || 0})</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(exp)}
                            className="text-xs font-bold text-[#8D4B00] hover:underline cursor-pointer"
                          >
                            Modify Rate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW TAB: OFF-ROAD MACHINE RATES (QUAD & DUNE BUGGY VEHICLE PRICING) */}
          {activeNav === 'offroad-pricing' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-white p-6 rounded-2xl border border-[#E9E1DF] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFDCC3] to-[#FFDBCE] text-[#8D4B00] flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[28px]">sports_motorsports</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-bold text-xl text-[#1E1B1A]">Off-Road Machine Rates (Per-Vehicle Pricing)</h3>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[#8D4B00] text-[10px] font-bold uppercase tracking-wider">
                        Full Vehicle Rates
                      </span>
                    </div>
                    <p className="text-xs text-[#554336] mt-1 max-w-2xl">
                      Prices are calculated <strong>per whole vehicle</strong> (not per person). Manage granular pricing for 30m vs 60m durations, single vs double rider quads, inside circle track vs open desert, and 2-seater vs 4-seater Polaris and Can-Am buggies.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleResetOffRoadDefaults}
                    className="px-3.5 py-2 rounded-lg bg-[#F5ECEA] hover:bg-[#EFE6E4] text-[#554336] hover:text-[#1E1B1A] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Reset Defaults</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateOffRoadPricing) {
                        onUpdateOffRoadPricing(localOffRoadPricing);
                      }
                      localStorage.setItem('phoenix_offroad_pricing', JSON.stringify(localOffRoadPricing));
                      showToast('All Quad Bike & Dune Buggy rates published and live on storefront!');
                    }}
                    className="px-4 py-2 rounded-lg bg-[#8D4B00] hover:bg-[#B15F00] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>Save &amp; Publish Rates</span>
                  </button>
                </div>
              </div>

              {/* Section 1: Quad Bikes (220cc & 350cc) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E9E1DF] pb-2">
                  <span className="material-symbols-outlined text-[#8D4B00]">two_wheeler</span>
                  <h4 className="font-serif font-bold text-base text-[#1E1B1A]">Quad Bike ATV Rates (Per Vehicle)</h4>
                  <span className="text-xs text-[#554336] font-medium">— Single &amp; Double Rider, Inside Circle &amp; Open Desert</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 220cc Standard Raptor */}
                  <div className="bg-white rounded-xl border border-[#E9E1DF] p-5 shadow-xs flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E9E1DF]">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-xs font-bold">250 CC</span>
                        <h5 className="font-bold text-sm text-[#1E1B1A]">250 CC Quad Bike Standard</h5>
                      </div>
                      <span className="text-[11px] text-[#554336] font-medium">Automatic • Single &amp; Double</span>
                    </div>

                    {/* Inside Circle Track Rates */}
                    <div className="p-3.5 rounded-lg bg-[#FBF2F0] border border-[#E9E1DF]/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#8D4B00] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">track_changes</span>
                          Inside Circle Track (Enclosed Circuit)
                        </span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded text-[#554336] font-medium">Safe &amp; Guided</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div>
                          <label className="text-[10px] font-bold text-[#554336] block">Single 30m (AED)</label>
                          <input
                            type="number"
                            value={localOffRoadPricing.quad220cc.singleInside30m}
                            onChange={(e) => handleUpdateQuadTier('quad220cc', 'singleInside30m', Number(e.target.value) || 0)}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#554336] block">Single 60m (AED)</label>
                          <input
                            type="number"
                            value={localOffRoadPricing.quad220cc.singleInside60m}
                            onChange={(e) => handleUpdateQuadTier('quad220cc', 'singleInside60m', Number(e.target.value) || 0)}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#554336] block">Double 30m (AED)</label>
                          <input
                            type="number"
                            value={localOffRoadPricing.quad220cc.doubleInside30m}
                            onChange={(e) => handleUpdateQuadTier('quad220cc', 'doubleInside30m', Number(e.target.value) || 0)}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#554336] block">Double 60m (AED)</label>
                          <input
                            type="number"
                            value={localOffRoadPricing.quad220cc.doubleInside60m}
                            onChange={(e) => handleUpdateQuadTier('quad220cc', 'doubleInside60m', Number(e.target.value) || 0)}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Open Desert Free Ride Rates */}
                    <div className="p-3.5 rounded-lg bg-[#FFDCC3]/30 border border-[#8D4B00]/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#8D4B00] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">landscape</span>
                          Open Desert Dunes (Red Sand Dunes)
                        </span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded text-[#8D4B00] font-bold">Marshal Escort</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div>
                          <label className="text-[10px] font-bold text-[#554336] block">Single 30m (AED)</label>
                          <input
                            type="number"
                            value={localOffRoadPricing.quad220cc.singleOpen30m}
                            onChange={(e) => handleUpdateQuadTier('quad220cc', 'singleOpen30m', Number(e.target.value) || 0)}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#554336] block">Single 60m (AED)</label>
                          <input
                            type="number"
                            value={localOffRoadPricing.quad220cc.singleOpen60m}
                            onChange={(e) => handleUpdateQuadTier('quad220cc', 'singleOpen60m', Number(e.target.value) || 0)}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#554336] block">Double 30m (AED)</label>
                          <input
                            type="number"
                            value={localOffRoadPricing.quad220cc.doubleOpen30m}
                            onChange={(e) => handleUpdateQuadTier('quad220cc', 'doubleOpen30m', Number(e.target.value) || 0)}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#554336] block">Double 60m (AED)</label>
                          <input
                            type="number"
                            value={localOffRoadPricing.quad220cc.doubleOpen60m}
                            onChange={(e) => handleUpdateQuadTier('quad220cc', 'doubleOpen60m', Number(e.target.value) || 0)}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 350cc High Dunes Beast */}
                  <div className="bg-white rounded-xl border border-[#E9E1DF] p-5 shadow-xs flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E9E1DF]">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-xs font-bold">350 CC</span>
                        <h5 className="font-bold text-sm text-[#1E1B1A]">350 CC Quad Bike High Dunes</h5>
                      </div>
                      <span className="text-[11px] text-[#8D4B00] font-bold">High-Power • Single &amp; Double</span>
                    </div>

                    {/* Inside Circle Track Rates */}
                    <div className="p-3.5 rounded-lg bg-[#FBF2F0] border border-[#E9E1DF]/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#8D4B00] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">track_changes</span>
                          Inside Circle Track (Enclosed Circuit)
                        </span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded text-[#554336] font-medium">Safe &amp; Guided</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div>
                          <label className="text-[10px] font-bold text-[#554336] block">Single 30m (AED)</label>
                          <input
                            type="number"
                            value={localOffRoadPricing.quad350cc.singleInside30m}
                            onChange={(e) => handleUpdateQuadTier('quad350cc', 'singleInside30m', Number(e.target.value) || 0)}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#554336] block">Single 60m (AED)</label>
                          <input
                            type="number"
                            value={localOffRoadPricing.quad350cc.singleInside60m}
                            onChange={(e) => handleUpdateQuadTier('quad350cc', 'singleInside60m', Number(e.target.value) || 0)}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#554336] block">Double 30m (AED)</label>
                          <input
                            type="number"
                            value={localOffRoadPricing.quad350cc.doubleInside30m}
                            onChange={(e) => handleUpdateQuadTier('quad350cc', 'doubleInside30m', Number(e.target.value) || 0)}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#554336] block">Double 60m (AED)</label>
                          <input
                            type="number"
                            value={localOffRoadPricing.quad350cc.doubleInside60m}
                            onChange={(e) => handleUpdateQuadTier('quad350cc', 'doubleInside60m', Number(e.target.value) || 0)}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Open Desert Free Ride Rates */}
                    <div className="p-3.5 rounded-lg bg-[#FFDCC3]/30 border border-[#8D4B00]/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#8D4B00] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">landscape</span>
                          Open Desert Dunes (Red Sand Dunes)
                        </span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded text-[#8D4B00] font-bold">High Octane</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div>
                          <label className="text-[10px] font-bold text-[#554336] block">Single 30m (AED)</label>
                          <input
                            type="number"
                            value={localOffRoadPricing.quad350cc.singleOpen30m}
                            onChange={(e) => handleUpdateQuadTier('quad350cc', 'singleOpen30m', Number(e.target.value) || 0)}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#554336] block">Single 60m (AED)</label>
                          <input
                            type="number"
                            value={localOffRoadPricing.quad350cc.singleOpen60m}
                            onChange={(e) => handleUpdateQuadTier('quad350cc', 'singleOpen60m', Number(e.target.value) || 0)}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#554336] block">Double 30m (AED)</label>
                          <input
                            type="number"
                            value={localOffRoadPricing.quad350cc.doubleOpen30m}
                            onChange={(e) => handleUpdateQuadTier('quad350cc', 'doubleOpen30m', Number(e.target.value) || 0)}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#554336] block">Double 60m (AED)</label>
                          <input
                            type="number"
                            value={localOffRoadPricing.quad350cc.doubleOpen60m}
                            onChange={(e) => handleUpdateQuadTier('quad350cc', 'doubleOpen60m', Number(e.target.value) || 0)}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Dune Buggies (Polaris RZR & Can-Am Maverick) */}
              <div className="space-y-4 pt-4 border-t border-[#E9E1DF]">
                <div className="flex items-center gap-2 border-b border-[#E9E1DF] pb-2">
                  <span className="material-symbols-outlined text-[#8D4B00]">sports_motorsports</span>
                  <h4 className="font-serif font-bold text-base text-[#1E1B1A]">Dune Buggy Rates (Per Vehicle)</h4>
                  <span className="text-xs text-[#554336] font-medium">— Polaris RZR vs Can-Am Maverick X3 (2-Seater &amp; 4-Seater)</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Polaris RZR Buggy */}
                  <div className="bg-white rounded-xl border border-[#E9E1DF] p-5 shadow-xs flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[#E9E1DF]">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-900 text-xs font-bold">1000cc</span>
                          <h5 className="font-bold text-sm text-[#1E1B1A]">Polaris RZR 1000cc Buggy</h5>
                        </div>
                        <span className="text-[11px] text-[#554336] font-medium">Automatic • Roll Cage</span>
                      </div>

                      <div className="mt-4 space-y-4">
                        {/* 2-Seater Polaris */}
                        <div className="p-3.5 rounded-lg bg-[#FBF2F0] border border-[#E9E1DF]/70">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#1E1B1A] flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px] text-[#8D4B00]">person</span>
                              2-Seater Configuration (Couple / Duo)
                            </span>
                            <span className="text-[10px] text-[#554336]">Entire Buggy</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-[#554336] block">30 Minutes (AED)</label>
                              <input
                                type="number"
                                value={localOffRoadPricing.buggyPolaris.twoSeater30m}
                                onChange={(e) => handleUpdateBuggyTier('buggyPolaris', 'twoSeater30m', Number(e.target.value) || 0)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#554336] block">60 Minutes (AED)</label>
                              <input
                                type="number"
                                value={localOffRoadPricing.buggyPolaris.twoSeater60m}
                                onChange={(e) => handleUpdateBuggyTier('buggyPolaris', 'twoSeater60m', Number(e.target.value) || 0)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 4-Seater Polaris */}
                        <div className="p-3.5 rounded-lg bg-[#FBF2F0] border border-[#E9E1DF]/70">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#1E1B1A] flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px] text-[#8D4B00]">group</span>
                              4-Seater Configuration (Family / Group)
                            </span>
                            <span className="text-[10px] text-[#554336]">Entire Buggy</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-[#554336] block">30 Minutes (AED)</label>
                              <input
                                type="number"
                                value={localOffRoadPricing.buggyPolaris.fourSeater30m}
                                onChange={(e) => handleUpdateBuggyTier('buggyPolaris', 'fourSeater30m', Number(e.target.value) || 0)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#554336] block">60 Minutes (AED)</label>
                              <input
                                type="number"
                                value={localOffRoadPricing.buggyPolaris.fourSeater60m}
                                onChange={(e) => handleUpdateBuggyTier('buggyPolaris', 'fourSeater60m', Number(e.target.value) || 0)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Can-Am Maverick X3 Buggy */}
                  <div className="bg-white rounded-xl border border-[#E9E1DF] p-5 shadow-xs flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[#E9E1DF]">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-900 text-xs font-bold">TURBO</span>
                          <h5 className="font-bold text-sm text-[#1E1B1A]">Can-Am Maverick X3 Turbo Buggy</h5>
                        </div>
                        <span className="text-[11px] text-[#8D4B00] font-bold">195HP • Premium Beast</span>
                      </div>

                      <div className="mt-4 space-y-4">
                        {/* 2-Seater Can-Am */}
                        <div className="p-3.5 rounded-lg bg-[#FFDCC3]/30 border border-[#8D4B00]/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#1E1B1A] flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px] text-[#8D4B00]">person</span>
                              2-Seater Maverick Turbo (Couple / Duo)
                            </span>
                            <span className="text-[10px] font-bold text-[#8D4B00]">Flagship Power</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-[#554336] block">30 Minutes (AED)</label>
                              <input
                                type="number"
                                value={localOffRoadPricing.buggyCanAm.twoSeater30m}
                                onChange={(e) => handleUpdateBuggyTier('buggyCanAm', 'twoSeater30m', Number(e.target.value) || 0)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#554336] block">60 Minutes (AED)</label>
                              <input
                                type="number"
                                value={localOffRoadPricing.buggyCanAm.twoSeater60m}
                                onChange={(e) => handleUpdateBuggyTier('buggyCanAm', 'twoSeater60m', Number(e.target.value) || 0)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 4-Seater Can-Am */}
                        <div className="p-3.5 rounded-lg bg-[#FFDCC3]/30 border border-[#8D4B00]/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#1E1B1A] flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px] text-[#8D4B00]">group</span>
                              4-Seater Maverick Turbo MAX (Family / VIP Group)
                            </span>
                            <span className="text-[10px] font-bold text-[#8D4B00]">Flagship Power</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-[#554336] block">30 Minutes (AED)</label>
                              <input
                                type="number"
                                value={localOffRoadPricing.buggyCanAm.fourSeater30m}
                                onChange={(e) => handleUpdateBuggyTier('buggyCanAm', 'fourSeater30m', Number(e.target.value) || 0)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#554336] block">60 Minutes (AED)</label>
                              <input
                                type="number"
                                value={localOffRoadPricing.buggyCanAm.fourSeater60m}
                                onChange={(e) => handleUpdateBuggyTier('buggyCanAm', 'fourSeater60m', Number(e.target.value) || 0)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-bold text-[#1E1B1A]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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

              {/* Main Bookings Container: Mobile Cards (md:hidden) & Desktop Table (hidden md:block) */}

              {/* 1. Mobile Cards View for Bookings */}
              <div className="md:hidden flex flex-col gap-3">
                {bookings.map((b) => (
                  <div key={b.id} className="p-4 rounded-xl bg-white border border-[#E9E1DF] shadow-xs flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono font-bold text-xs text-[#8D4B00]">{b.voucherCode}</span>
                        <h4 className="font-bold text-sm text-[#1E1B1A] mt-0.5">{b.guestName}</h4>
                        <span className="text-[11px] text-[#554336]">{b.hotel} ({b.room})</span>
                      </div>
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
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#FBF2F0] flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-[#1E1B1A] block">{b.experienceTitle}</span>
                        <span className="text-[11px] text-[#554336]">{b.partySize} • AED {b.totalAED}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#1E1B1A] block">{b.timeSlot}</span>
                        <span className="text-[10px] text-[#8D4B00]">{b.marshal}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#554336]">{b.convoyNumber}</span>
                      <a
                        href={`https://wa.me/971561505270?text=Hello%20${encodeURIComponent(
                          b.guestName
                        )},%20this%20is%20The%20Phoenix%20Dubai%20Desert%20Safari.%20Your%20marshal%20is%20${encodeURIComponent(
                          b.marshal
                        )}%20for%20today.`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 text-xs shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">chat</span> WhatsApp Guest
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. Desktop Table View for Bookings */}
              <div className="hidden md:block overflow-hidden rounded-xl bg-white border border-[#E9E1DF] shadow-xs">
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
                      Marhaba Sarah! Yes absolutely. We have 250 CC Quad Bikes and Can-Am buggies ready at the base camp. You can either pay the marshal upon arrival or have us pre-reserve them for you right now.
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

          {/* VIEW TAB: AI CONCIERGE KNOWLEDGE BASE & TRAINING STUDIO */}
          {activeNav === 'ai-knowledge-base' && (
            <KnowledgeBaseTab
              experiences={experiences}
              offRoadPricing={localOffRoadPricing}
              cmsConfig={cmsConfig}
              showToast={showToast}
            />
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

                {/* Gmail SMTP Notification Gateway Panel */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-[#FBF2F0] border border-emerald-200/80 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-[20px]">mail</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#1E1B1A]">Gmail Automated Email Gateway</h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live &amp; Connected
                          </span>
                        </div>
                        <p className="text-[11px] text-[#554336] mt-0.5">
                          Sender Address: <strong className="text-[#1E1B1A]">awalgsm@gmail.com</strong> (Google App Password Active)
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={testingSmtp}
                      onClick={handleTestSmtp}
                      className="px-3.5 py-2 rounded-lg bg-[#8D4B00] hover:bg-[#B15F00] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {testingSmtp ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">send</span>
                          <span>Send Test Email</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-[#554336]">
                    <div className="p-2.5 rounded-lg bg-white border border-[#E9E1DF] space-y-0.5">
                      <span className="text-[10px] font-bold text-[#8D4B00] uppercase block">Guest Booking Vouchers</span>
                      <p className="text-[11px] text-[#1E1B1A] font-medium">Automatic branded HTML vouchers sent upon booking.</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-[#E9E1DF] space-y-0.5">
                      <span className="text-[10px] font-bold text-[#8D4B00] uppercase block">Operator Dispatch Alerts</span>
                      <p className="text-[11px] text-[#1E1B1A] font-medium">Instant alerts sent to awalgsm@gmail.com for new leads.</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-[#E9E1DF] space-y-0.5">
                      <span className="text-[10px] font-bold text-[#8D4B00] uppercase block">Resend &amp; PDF Delivery</span>
                      <p className="text-[11px] text-[#1E1B1A] font-medium">Guests and marshals can trigger instant resends anytime.</p>
                    </div>
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

                {/* System Backup & Data Recovery Card in Settings */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#FFDCC3]/40 to-[#F5ECEA] border border-[#8D4B00]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#8D4B00] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[22px]">settings_backup_restore</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1E1B1A]">Disaster Recovery &amp; System Backup</h4>
                      <p className="text-xs text-[#554336] mt-0.5">
                        Download full JSON snapshots, roll back to prior versions, or restore from external files.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveNav('backup-restore')}
                    className="px-4 py-2 rounded-lg bg-[#8D4B00] text-white text-xs font-bold whitespace-nowrap hover:bg-[#B15F00] transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
                  >
                    <span>Open Backup Hub</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
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

          {/* VIEW TAB: TOURS AVAILABILITY & BULK SLOT ENGINE */}
          {activeNav === 'tours-availability' && (
            <ToursAvailabilityTab experiences={experiences} />
          )}

          {/* VIEW TAB: B2B.TICKETS / TRAVELDESK API INTEGRATION */}
          {activeNav === 'b2b-integration' && (
            <B2BIntegrationManager
              experiences={experiences}
              onAddExperience={onAddExperience}
              onUpdateExperience={onUpdateExperience}
              onDeleteExperience={onDeleteExperience}
              showToast={showToast}
            />
          )}

          {/* VIEW TAB 7: SEO & SEARCH DOMINANCE AUDIT */}
          {activeNav === 'seo-audit' && <SeoAuditDashboard />}

          {/* VIEW TAB 8: BACKUP & RESTORE RECOVERY VAULT */}
          {activeNav === 'backup-restore' && (
            <div className="space-y-6">
              {/* Vault Overview Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#E9E1DF] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFDCC3] to-[#FFDBCE] text-[#8D4B00] flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[28px]">settings_backup_restore</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-bold text-xl text-[#1E1B1A]">Disaster Recovery &amp; System Backup Vault</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        DTCM Vault Active
                      </span>
                    </div>
                    <p className="text-xs text-[#554336] mt-1 max-w-2xl">
                      Download full offline JSON backups of your website (all tours, pricing tiers, descriptions, CMS hero copy, quotas, and bookings), or roll back to historical recovery points with one click.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowManualSnapshotModal(true)}
                    className="px-3.5 py-2.5 rounded-lg bg-[#F5ECEA] hover:bg-[#EFE6E4] text-[#1E1B1A] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#8D4B00]">add_circle</span>
                    <span>Create Snapshot</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportBackup('Full Vault Export')}
                    disabled={isExporting}
                    className="px-4 py-2.5 rounded-lg bg-[#8D4B00] hover:bg-[#B15F00] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-98 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>{isExporting ? 'Exporting...' : 'Export JSON Backup'}</span>
                  </button>
                </div>
              </div>

              {/* Two Primary Action Pillars: Download vs Restore File */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pillar 1: Download Full Backup */}
                <div className="p-6 rounded-2xl bg-white border border-[#E9E1DF] shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#8D4B00] border border-amber-200 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[22px]">file_download</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-[#1E1B1A]">Download Complete Site Snapshot</h4>
                          <span className="text-[11px] text-[#554336]">Encrypted Point-in-Time JSON Archive</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        Ready
                      </span>
                    </div>

                    <p className="text-xs text-[#554336] leading-relaxed">
                      Exports every single asset and parameter of your live environment into a standardized, portable JSON format. You can archive it on your local drive, email it to your operations team, or transfer it to another domain.
                    </p>

                    {/* What's Included Pills */}
                    <div className="p-3.5 rounded-xl bg-[#FBF2F0] border border-[#E9E1DF] space-y-2">
                      <span className="text-[10px] font-bold text-[#8D4B00] uppercase tracking-wider block">
                        Included in this snapshot:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs text-[#1E1B1A]">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
                          <span>{experiences.length} Tour Packages</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
                          <span>All Pricing &amp; Durations</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
                          <span>Hero H1 &amp; Subtitles</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
                          <span>4K Images &amp; Badges</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
                          <span>Slot Quotas ({Object.keys(capacities).length} tours)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
                          <span>DTCM #EXP-2024-8849</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-[#E9E1DF]">
                    <button
                      type="button"
                      onClick={() => handleExportBackup('Full Manual Backup')}
                      disabled={isExporting}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#8D4B00] to-[#EA580C] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      <span>Download JSON Backup File</span>
                    </button>
                  </div>
                </div>

                {/* Pillar 2: Restore from Backup File */}
                <div className="p-6 rounded-2xl bg-white border border-[#E9E1DF] shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#006194] border border-blue-200 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[22px]">upload_file</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-[#1E1B1A]">Restore from Backup File</h4>
                          <span className="text-[11px] text-[#554336]">Upload &amp; Replace Site State</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#006194] bg-blue-50 px-2.5 py-1 rounded-full">
                        JSON Format
                      </span>
                    </div>

                    <p className="text-xs text-[#554336] leading-relaxed">
                      Select a previous `.json` backup file from your computer. Our integrity validator checks file syntax and tour configurations before applying, and automatically takes a safety rollback snapshot of your current state first.
                    </p>

                    {/* Interactive Dropzone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingFile(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingFile(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingFile(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processBackupFile(file);
                      }}
                      className={`p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
                        isDraggingFile
                          ? 'border-[#8D4B00] bg-[#FFDCC3]/40 scale-[1.01]'
                          : 'border-[#DBC2B0] hover:border-[#8D4B00] bg-[#FBF2F0] hover:bg-[#F5ECEA]'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-white shadow-2xs flex items-center justify-center text-[#8D4B00] group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[24px]">
                          {isDraggingFile ? 'file_download' : 'cloud_upload'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#1E1B1A] block">
                          {isDraggingFile ? 'Drop your JSON backup file here' : 'Click to browse backup file or drag & drop'}
                        </span>
                        <span className="text-[11px] text-[#554336] mt-0.5 block">
                          Supports .json backup snapshots exported from The Phoenix Admin
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-[#E9E1DF] flex items-center justify-between gap-3">
                    <span className="text-[11px] text-[#554336] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-emerald-600">shield</span>
                      Automatic pre-restore rollback enabled
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-white border border-[#E9E1DF] hover:bg-[#F5ECEA] text-[#1E1B1A] font-bold text-xs uppercase tracking-wider shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">folder_open</span>
                      <span>Select File</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Local Point-in-Time Rollback Points (Time Machine) */}
              <div className="bg-white p-6 rounded-2xl border border-[#E9E1DF] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E9E1DF]">
                  <div>
                    <h4 className="font-bold text-base text-[#1E1B1A] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[#8D4B00]">history</span>
                      <span>Local Point-in-Time Rollback Snapshots ({localSnapshots.length})</span>
                    </h4>
                    <p className="text-xs text-[#554336] mt-0.5">
                      Fast 1-click browser recovery points. Revert to any prior snapshot without uploading an external file.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowManualSnapshotModal(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#8D4B00] hover:bg-[#B15F00] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 self-start sm:self-auto shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Snapshot Current State</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {localSnapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="p-4 rounded-xl bg-[#FBF2F0] hover:bg-[#F5ECEA] border border-[#E9E1DF] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            snap.type === 'baseline'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : snap.type === 'auto-pre-restore'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-stone-200 text-stone-800'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {snap.type === 'baseline' ? 'stars' : snap.type === 'auto-pre-restore' ? 'restore' : 'bookmark'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-[#1E1B1A] truncate">{snap.label}</span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                snap.type === 'baseline'
                                  ? 'bg-[#FFDCC3] text-[#2F1500]'
                                  : snap.type === 'auto-pre-restore'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-stone-200 text-stone-700'
                              }`}
                            >
                              {snap.type === 'baseline' ? 'Gold Master' : snap.type === 'auto-pre-restore' ? 'Auto Rollback' : 'Manual'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#554336] mt-1 flex-wrap">
                            <span>{new Date(snap.timestamp).toLocaleString()}</span>
                            <span>&bull;</span>
                            <span className="font-semibold text-[#8D4B00]">{snap.toursCount} Tours</span>
                            <span>&bull;</span>
                            <span className="truncate max-w-xs">{snap.exportedBy}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedSnapshotForDetails(snap)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-semibold text-[#554336] hover:text-[#1E1B1A] shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                          title="Inspect snapshot content and tours"
                        >
                          <span className="material-symbols-outlined text-[15px] text-[#8D4B00]">visibility</span>
                          <span className="hidden sm:inline">Inspect</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(snap.data, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `phoenix-snapshot-${snap.id}.json`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E9E1DF] text-xs font-semibold text-[#554336] hover:text-[#1E1B1A] shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                          title="Download this snapshot as JSON"
                        >
                          <span className="material-symbols-outlined text-[15px]">download</span>
                          <span className="hidden sm:inline">JSON</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingRestore(snap.data)}
                          className="px-3 py-1.5 rounded-lg bg-[#8D4B00] hover:bg-[#B15F00] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[15px]">settings_backup_restore</span>
                          <span>Restore</span>
                        </button>
                        {snap.type !== 'baseline' && (
                          <button
                            type="button"
                            onClick={() => deleteLocalSnapshot(snap.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete snapshot"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone: Factory Reset */}
              <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">warning</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-950">Factory Baseline Emergency Reset</h4>
                    <p className="text-xs text-red-800/80 mt-0.5">
                      Reverts all tours, pricing, and CMS texts to the original pristine DTCM baseline (8 verified Dubai tours). An automatic safety snapshot will be stored before resetting.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFactoryResetModal(true)}
                  className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold whitespace-nowrap transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
                >
                  Factory Reset
                </button>
              </div>
            </div>
          )}

          {/* Hidden file input for backup JSON upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,application/json"
            className="hidden"
          />
        </main>
      </div>

      {/* BACKDROP FOR SLIDE-OVER DRAWER (MOBILE & DESKTOP) */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsDrawerOpen(false)}
        ></div>
      )}

      {/* QUICK EDIT / CREATE SLIDE-OVER DRAWER (Mobile-optimized bottom/side sheet) */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:max-w-md bg-white border-l border-[#E9E1DF] shadow-2xl z-[100] transform transition-transform duration-300 flex flex-col justify-between ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* Tactile Drag Handle for Mobile */}
          <div className="w-12 h-1.5 rounded-full bg-[#E9E1DF] mx-auto mb-3 sm:hidden"></div>

          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E9E1DF]">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#8D4B00] uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Direct Tour Modifier • DTCM Live
              </span>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1E1B1A]">
                {drawerMode === 'edit' ? selectedTour?.title : 'Add New Tour Experience'}
              </h3>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-[#F5ECEA] text-[#554336] transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Drawer Form Fields */}
          <div className="flex flex-col gap-4 sm:gap-5 pt-4">
            {/* Real-Time Capacity Stepper (Mobile Touch Optimized) */}
            <div className="p-3.5 rounded-xl bg-[#FBF2F0] border border-[#E9E1DF] flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#8D4B00] uppercase tracking-wider">Today's Real-time Slots</span>
                <span className="text-xs font-semibold text-[#1E1B1A]">Camp Permitted Capacity</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedTour) {
                      setCapacities((prev) => ({
                        ...prev,
                        [selectedTour.id]: {
                          ...prev[selectedTour.id],
                          max: Math.max(10, (prev[selectedTour.id]?.max || 30) - 5),
                        },
                      }));
                    }
                  }}
                  className="w-8 h-8 rounded-lg bg-white border border-[#E9E1DF] flex items-center justify-center font-bold text-[#1E1B1A] shadow-2xs hover:bg-[#F5ECEA] cursor-pointer active:scale-95 transition-transform"
                  title="Decrease 5 slots"
                >
                  -
                </button>
                <span className="font-serif font-bold text-sm sm:text-base text-[#8D4B00] min-w-[70px] text-center">
                  {selectedTour ? `${capacities[selectedTour.id]?.booked || 0} / ${capacities[selectedTour.id]?.max || 30}` : '30 Max'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedTour) {
                      setCapacities((prev) => ({
                        ...prev,
                        [selectedTour.id]: {
                          ...prev[selectedTour.id],
                          max: Math.min(120, (prev[selectedTour.id]?.max || 30) + 5),
                        },
                      }));
                    }
                  }}
                  className="w-8 h-8 rounded-lg bg-white border border-[#E9E1DF] flex items-center justify-center font-bold text-[#1E1B1A] shadow-2xs hover:bg-[#F5ECEA] cursor-pointer active:scale-95 transition-transform"
                  title="Increase 5 slots"
                >
                  +
                </button>
              </div>
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

            {/* Tour Image Showcase & Link Input */}
            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#FBF2F0] border border-[#E9E1DF]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#554336] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#8D4B00]">image</span>
                  Tour Showcase Image
                </label>
                <span className="text-[10px] text-[#8D4B00] font-bold uppercase tracking-wider">Live Preview</span>
              </div>

              {/* Visual Preview Box */}
              <div className="relative w-full h-36 rounded-lg overflow-hidden bg-stone-200 border border-[#E9E1DF] group shadow-inner">
                {drawerImage ? (
                  <img
                    src={drawerImage}
                    alt={drawerTitle || 'Tour preview'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuD-WGzdpK8MS1oA3hauA_Ygx6gWG9_iDxkJhAkQyV5wuzUwmRq0ijeyHwq3h7p9z02MkR7BZE-vSYaLQwFsvp5MExNqXcROyPeCHHjDrUvM9bx70FlWEd_J2KOTqNcG-z7by7k8TKZvYm4gqz_sNTzbUj2XGT9NwvAOEI1l-7xTYTLJklG39UiXhzFbHysO08Qy-SRI5J9bPEztGnzm3Z-UC7hqAcsV6QYDodQ8Ykn4iQ3n7OPoPVohXg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-1">
                    <span className="material-symbols-outlined text-[28px]">broken_image</span>
                    <span className="text-xs">No image link provided</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end justify-between p-2.5">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-[#FFDCC3] uppercase tracking-wider block">
                      {drawerBadge || 'Curated Tour'}
                    </span>
                    <span className="text-xs font-bold text-white truncate block">
                      {drawerTitle || 'Experience Title'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-[#8D4B00] text-[10px] font-bold shrink-0 shadow-xs">
                    AED {drawerPrice}
                  </span>
                </div>
              </div>

              {/* Direct Image URL Link Input */}
              <div className="flex flex-col gap-1 pt-1">
                <div className="flex items-center justify-between text-[11px] text-[#554336]">
                  <span className="font-semibold">Image URL Link (HTTPS)</span>
                  {drawerImage && (
                    <button
                      type="button"
                      onClick={() => setDrawerImage('')}
                      className="text-[10px] text-red-600 hover:underline cursor-pointer font-semibold"
                    >
                      Clear Link
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#554336] text-[16px]">
                    link
                  </span>
                  <input
                    type="url"
                    value={drawerImage}
                    onChange={(e) => setDrawerImage(e.target.value)}
                    placeholder="https://example.com/tour-photo.jpg"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white text-xs text-[#1E1B1A] placeholder:text-[#554336]/60 focus:outline-none focus:ring-2 focus:ring-[#8D4B00] border border-[#E9E1DF]"
                  />
                </div>
              </div>

              {/* Curated Dubai Preset Badges */}
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-[#554336] uppercase tracking-wider">
                  Or pick a curated 4K asset preset:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    {
                      label: 'Evening Sunset',
                      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-WGzdpK8MS1oA3hauA_Ygx6gWG9_iDxkJhAkQyV5wuzUwmRq0ijeyHwq3h7p9z02MkR7BZE-vSYaLQwFsvp5MExNqXcROyPeCHHjDrUvM9bx70FlWEd_J2KOTqNcG-z7by7k8TKZvYm4gqz_sNTzbUj2XGT9NwvAOEI1l-7xTYTLJklG39UiXhzFbHysO08Qy-SRI5J9bPEztGnzm3Z-UC7hqAcsV6QYDodQ8Ykn4iQ3n7OPoPVohXg',
                    },
                    {
                      label: 'Morning Falconry',
                      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfQTyycIShtNZY1IGG2YE6iI1BuJWbUOsfJNJ61gKLO7mQrl2-meoa5-Gmy6Jqp9yXEDUzye7H3nor3OHqBKqE4YeBbDxGhk5oRz6b_LjOJVlFbZK8Co2chrezHifZs5nLliPx3iemmVjLizVmk-Up001f7763-bL3Ti8L2y80d9YJgZrzudJS1xtbQ644JSyBa7a1bko3FZPyU4S8YXnTCi2cuQ0PiT7izULeWvPOFIx7xpACsll4tw',
                    },
                    {
                      label: 'VIP Luxury Camp',
                      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUe6c4XbtkCWu4pIFYnpZkBPQH3O-lTy9CcguRtQ45IZM9M05HI0gRtzPEdu4BaSfySyo9SSrvtbIX_J_qmMO0BzuRxmfMiu4Ui8oPLZ3PEXknuBp1gf1vyAjrDuY9HQcBiD_IMokRfK6KiUr_L0oOfCgXu5QxRBIHfRSgR56AGCKmkIn3VwKYsTjrJeuSqAccMEzilDFy4UYM1iY-fe1pO00TBnZaUUKho6Nfm7nFRaVfiM9qh9Ac2A',
                    },
                    {
                      label: 'ATV Quad Rush',
                      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvgtD4J-CCb2q95-AEEZivJSFNld4MC7WUtHkFEjDa8toVFC-VIZkHgy5ohOFf2OW_hHUk8VdWEwCCLSIDDWhIB674BTFDcUCGw7z4AgmTa6AfTxHyYGQCpjD73ZTUbqTlBGERN9GMGrxRdj8-gVIAAaLzeFChg2_zwgDSN45iIEBhIhtyT5qXQvHIV-7jN9R0sGXuPGv627zjVpdMsQBo00utZbb8nJPArhUr3KvdETzpFV--n7T9kA',
                    },
                    {
                      label: 'Can-Am Buggy',
                      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-TxXaiA4ximXtZzxDZDHtEF8cviLK2dvS3XgmJ7EXrZ3e7QYSJbMY8JoFIJt70Tpk6aeeOE-Ph_UC8bTLqvVd9CB5POfGXeHQr8kpKgrlfHX-Ibjo7PZw74sKn0DQXKn_cZkV8npxhWFfMIIGHlB6Kp7EN6tE0rQnMCV7CYUywQN04G6O_aGSUlEF6GllnHMNq1Vxu4TRQFzDYDdKzYAFhCh_bMRYuQ4sc0XO7051rR7e6AYYfIyAeg',
                    },
                    {
                      label: 'City Heritage',
                      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDz7AMgdCOpI2Gg3Z6XEbD6KbeN6oBkUUWyfauZR9m2V2I_7bJGMen2YRBCT7XomkDSw1JBqO9hCuPzQ8fNcUmZDkIDiYTG1hY1ZBCQeZRXBWoOWhIhu4SgmBuB8yku7MSFDrwqC7MLHsbgHP5sEVqDMG21qVg3WwEDCOMq_J1FIz3EcoWMvmgruN24kDMWlSo6yJZZMUN_NWokbiLIW-M7qt3yqnxKitNBXKqXWEhhUh5OksXgfjtw0w',
                    },
                    {
                      label: 'Marina Dhow',
                      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7pKMN_yYnPnptWbnoNksYgVGMMu4IDLfJHZ5Bg70TzsbfGTIotF26k5iiPmzj0QbgHo4xV4KrEvgOQMGRrN7QOgt6n86MfUC6lW3QG6xnIqFkRol87hi3HG0YjEQduhHqedaWPTYVpnwxuBismZMSseLQZjpdKzL6gfUYZh_ykmlplUHCxBsYPfpFsZ_-FKynGJT-9BPag2g14Vpi1dqFeOkLc92pNNHJHOcZmmoHqIwf5aIJAmuDhQ',
                    },
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setDrawerImage(preset.url)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer border ${
                        drawerImage === preset.url
                          ? 'bg-[#8D4B00] text-white border-[#8D4B00]'
                          : 'bg-white text-[#554336] border-[#E9E1DF] hover:bg-[#F5ECEA]'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Short Subtitle / Highlight Hook */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-[#554336]">Short Highlight Hook (Subtitle)</label>
                <span className="text-[10px] text-stone-400">Card &amp; Search preview</span>
              </div>
              <input
                type="text"
                value={drawerSubtitle}
                onChange={(e) => setDrawerSubtitle(e.target.value)}
                placeholder="e.g. Dune Bashing, BBQ Dinner, Fire & Tanoura Show"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5ECEA] text-xs text-[#1E1B1A] focus:outline-none focus:ring-2 focus:ring-[#8D4B00] border border-[#E9E1DF]"
              />
            </div>

            {/* Detailed Tour Description */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-[#554336]">Detailed Tour Description</label>
                <span className="text-[10px] text-stone-400">{drawerDescription.length} chars</span>
              </div>
              <textarea
                value={drawerDescription}
                onChange={(e) => setDrawerDescription(e.target.value)}
                rows={4}
                placeholder="Full description of the experience, what is included, schedule details, hospitality, and safety protocols..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5ECEA] text-xs text-[#1E1B1A] focus:outline-none focus:ring-2 focus:ring-[#8D4B00] border border-[#E9E1DF] resize-none leading-relaxed"
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

            {/* EXPEDITION ITINERARY TIMELINE BUILDER */}
            <div id="drawer-itinerary-section" className="p-4 rounded-xl bg-[#FBF2F0] border border-[#8D4B00]/30 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#E9E1DF] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8D4B00] text-[20px]">route</span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif font-bold text-sm text-[#1E1B1A]">Expedition Itinerary Timeline</span>
                      <span className="px-2 py-0.2 rounded-full bg-[#8D4B00] text-white text-[10px] font-bold">
                        {drawerItinerary.length} Steps
                      </span>
                    </div>
                    <span className="text-[10px] text-[#554336]">Customer viewable schedule &amp; time breakdown</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddItineraryStep}
                  className="px-2.5 py-1.5 rounded-lg bg-[#8D4B00] hover:bg-[#B15F00] text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>Add Step</span>
                </button>
              </div>

              {/* Preset Template Controls */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-[10px] text-[#554336] font-bold shrink-0 uppercase tracking-wider">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleLoadItineraryPreset('safari')}
                  className="px-2 py-1 rounded bg-white border border-[#E9E1DF] hover:bg-[#F5ECEA] text-[10px] font-bold text-[#8D4B00] shrink-0 cursor-pointer"
                >
                  Desert Safari
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadItineraryPreset('offroad')}
                  className="px-2 py-1 rounded bg-white border border-[#E9E1DF] hover:bg-[#F5ECEA] text-[10px] font-bold text-[#8D4B00] shrink-0 cursor-pointer"
                >
                  Quad &amp; Buggy
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadItineraryPreset('city')}
                  className="px-2 py-1 rounded bg-white border border-[#E9E1DF] hover:bg-[#F5ECEA] text-[10px] font-bold text-[#8D4B00] shrink-0 cursor-pointer"
                >
                  City Excursion
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadItineraryPreset('clear')}
                  className="px-2 py-1 rounded bg-white border border-red-200 hover:bg-red-50 text-[10px] font-bold text-red-600 shrink-0 cursor-pointer ml-auto"
                >
                  Clear All
                </button>
              </div>

              {/* Itinerary Step Cards List */}
              {drawerItinerary.length === 0 ? (
                <div className="p-4 rounded-lg bg-white border border-dashed border-[#E9E1DF] text-center text-xs text-[#554336]">
                  No itinerary steps added yet. Click <strong>+ Add Step</strong> or select a preset above.
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {drawerItinerary.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-white border border-[#E9E1DF] shadow-2xs space-y-2 relative group"
                    >
                      {/* Step Header with Reorder and Delete controls */}
                      <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#FFDCC3] text-[#2F1500] text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-[11px] font-bold text-[#8D4B00]">Timeline Event #{idx + 1}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveItineraryStep(idx, 'up')}
                            className="p-1 rounded hover:bg-stone-100 text-stone-600 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            title="Move Up"
                          >
                            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                          </button>
                          <button
                            type="button"
                            disabled={idx === drawerItinerary.length - 1}
                            onClick={() => handleMoveItineraryStep(idx, 'down')}
                            className="p-1 rounded hover:bg-stone-100 text-stone-600 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            title="Move Down"
                          >
                            <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItineraryStep(idx)}
                            className="p-1 rounded hover:bg-red-50 text-red-600 cursor-pointer ml-1"
                            title="Delete Step"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Step Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-1">
                          <label className="text-[10px] font-bold text-[#554336] block mb-0.5">Time / Duration</label>
                          <input
                            type="text"
                            value={step.time}
                            onChange={(e) => handleUpdateItineraryStep(idx, 'time', e.target.value)}
                            placeholder="02:30 PM - 03:30 PM"
                            className="w-full px-2.5 py-1.5 rounded bg-[#F5ECEA] text-xs font-bold text-[#1E1B1A] border border-[#E9E1DF] focus:outline-none focus:ring-1 focus:ring-[#8D4B00]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-[#554336] block mb-0.5">Step Heading / Title</label>
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => handleUpdateItineraryStep(idx, 'title', e.target.value)}
                            placeholder="e.g. Red Dune Bashing & Sandboarding"
                            className="w-full px-2.5 py-1.5 rounded bg-[#F5ECEA] text-xs font-bold text-[#1E1B1A] border border-[#E9E1DF] focus:outline-none focus:ring-1 focus:ring-[#8D4B00]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#554336] block mb-0.5">Activity Details &amp; Description</label>
                        <textarea
                          rows={2}
                          value={step.description}
                          onChange={(e) => handleUpdateItineraryStep(idx, 'description', e.target.value)}
                          placeholder="Describe what guests experience during this timeline window..."
                          className="w-full px-2.5 py-1.5 rounded bg-[#F5ECEA] text-xs text-[#1E1B1A] border border-[#E9E1DF] focus:outline-none focus:ring-1 focus:ring-[#8D4B00] resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Display & Automation Toggles */}
            <div className="flex flex-col gap-2.5 pt-1">
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
        <div className="p-4 sm:p-6 bg-[#FBF2F0] border-t border-[#E9E1DF] flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="flex-1 py-3 rounded-lg bg-[#F5ECEA] hover:bg-[#EFE6E4] text-xs font-bold uppercase tracking-wider text-[#1E1B1A] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveDrawer}
            className="flex-1 py-3 rounded-lg bg-[#8D4B00] hover:bg-[#B15F00] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BACKUP & RESTORE MODALS: RESTORE AUDIT, SNAPSHOT, RESET */}
      {/* ======================================================== */}

      {/* 1. RESTORE VERIFICATION & PREVIEW MODAL */}
      {pendingRestore && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E9E1DF] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FBF2F0] to-[#FFF8F6] border-b border-[#E9E1DF] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#8D4B00] border border-amber-300 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">settings_backup_restore</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1E1B1A]">
                      Confirm Site Restore
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                      Verified
                    </span>
                  </div>
                  <span className="text-xs text-[#554336] mt-0.5 block">
                    Review backup contents before applying to live environment
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingRestore(null)}
                className="w-8 h-8 rounded-lg bg-[#EFE6E4] hover:bg-[#E9E1DF] flex items-center justify-center text-[#554336] hover:text-[#1E1B1A] transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body: Scrollable Snapshot Inspection */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Snapshot Metadata Pill Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-[#FBF2F0] border border-[#E9E1DF]">
                  <span className="text-[10px] text-[#554336] block font-semibold">Tours Count</span>
                  <span className="font-serif font-bold text-base text-[#8D4B00]">
                    {pendingRestore.experiences?.length || 0} Experiences
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FBF2F0] border border-[#E9E1DF]">
                  <span className="text-[10px] text-[#554336] block font-semibold">DTCM License</span>
                  <span className="font-bold text-xs text-[#1E1B1A]">
                    {pendingRestore.dtcmLicense || 'EXP-2024-8849'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FBF2F0] border border-[#E9E1DF]">
                  <span className="text-[10px] text-[#554336] block font-semibold">Export Date</span>
                  <span className="font-bold text-xs text-[#1E1B1A] truncate block">
                    {new Date(pendingRestore.exportedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FBF2F0] border border-[#E9E1DF]">
                  <span className="text-[10px] text-[#554336] block font-semibold">Exported By</span>
                  <span className="font-bold text-xs text-[#1E1B1A] truncate block" title={pendingRestore.exportedBy}>
                    {pendingRestore.exportedBy?.split('@')[0] || 'Operator'}
                  </span>
                </div>
              </div>

              {/* CMS Hero Preview Card */}
              {pendingRestore.cmsConfig && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#8D4B00] uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">view_quilt</span>
                      CMS Hero Headlines Inside Backup
                    </span>
                    <span className="text-[10px] font-semibold text-stone-500">Live text replacement</span>
                  </div>
                  <div className="font-serif font-bold text-sm text-[#1E1B1A]">
                    "{pendingRestore.cmsConfig.heroTitle}"
                  </div>
                  <p className="text-[11px] text-[#554336] line-clamp-2">
                    {pendingRestore.cmsConfig.heroSubtitle}
                  </p>
                  {pendingRestore.cmsConfig.announcementTicker && (
                    <div className="text-[10px] font-mono text-[#8D4B00] bg-white/80 px-2 py-1 rounded border border-amber-200/60 truncate">
                      Ticker: {pendingRestore.cmsConfig.announcementTicker}
                    </div>
                  )}
                </div>
              )}

              {/* Tours Catalog Inside Backup */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#1E1B1A] uppercase tracking-wider">
                    Tours Catalog to be Restored ({pendingRestore.experiences?.length || 0})
                  </span>
                  <span className="text-[10px] text-[#554336]">Will update live pricing &amp; descriptions</span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 border border-[#E9E1DF] rounded-xl p-2 bg-[#FBF2F0]/50">
                  {pendingRestore.experiences?.map((tour, idx) => (
                    <div
                      key={tour.id || idx}
                      className="p-2.5 rounded-lg bg-white border border-[#E9E1DF] flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {tour.image ? (
                          <img
                            src={tour.image}
                            alt=""
                            className="w-10 h-10 rounded-md object-cover shrink-0 border border-[#E9E1DF]"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://lh3.googleusercontent.com/aida-public/AB6AXuD-WGzdpK8MS1oA3hauA_Ygx6gWG9_iDxkJhAkQyV5wuzUwmRq0ijeyHwq3h7p9z02MkR7BZE-vSYaLQwFsvp5MExNqXcROyPeCHHjDrUvM9bx70FlWEd_J2KOTqNcG-z7by7k8TKZvYm4gqz_sNTzbUj2XGT9NwvAOEI1l-7xTYTLJklG39UiXhzFbHysO08Qy-SRI5J9bPEztGnzm3Z-UC7hqAcsV6QYDodQ8Ykn4iQ3n7OPoPVohXg';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-[#F5ECEA] flex items-center justify-center text-[#8D4B00] shrink-0">
                            <span className="material-symbols-outlined text-[18px]">explore</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-[#1E1B1A] truncate block">{tour.title}</span>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#554336] mt-0.5">
                            <span className="capitalize">{tour.category}</span>
                            <span>&bull;</span>
                            <span>{tour.duration}</span>
                            {tour.badge && (
                              <>
                                <span>&bull;</span>
                                <span className="text-[#8D4B00] font-semibold">{tour.badge}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="font-serif font-bold text-xs text-[#8D4B00] shrink-0 bg-amber-50 px-2 py-1 rounded border border-amber-200/60">
                        AED {tour.priceAED}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automatic Rollback Checkbox */}
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="autoRollbackCheck"
                  checked={autoBackupBeforeRestore}
                  onChange={(e) => setAutoBackupBeforeRestore(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-[#006194] focus:ring-[#006194] accent-[#006194] cursor-pointer"
                />
                <label htmlFor="autoRollbackCheck" className="text-xs text-[#1E1B1A] cursor-pointer">
                  <span className="font-bold text-[#006194] block">Safety Rollback Protection (Recommended)</span>
                  <span className="text-[11px] text-[#554336]">
                    Automatically save a snapshot of the current live website before applying changes. You can revert back at any time.
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 bg-[#FBF2F0] border-t border-[#E9E1DF] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingRestore(null)}
                className="px-4 py-2.5 rounded-xl bg-white border border-[#E9E1DF] hover:bg-[#F5ECEA] text-xs font-bold uppercase tracking-wider text-[#1E1B1A] transition-colors cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8D4B00] to-[#EA580C] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-98"
              >
                <span className="material-symbols-outlined text-[18px]">settings_backup_restore</span>
                <span>Confirm &amp; Execute Restore</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CREATE MANUAL SNAPSHOT MODAL */}
      {showManualSnapshotModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E9E1DF] shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-[#FBF2F0] to-[#FFF8F6] border-b border-[#E9E1DF] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#8D4B00] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">bookmark</span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#1E1B1A]">
                    Create Point-in-Time Snapshot
                  </h3>
                  <span className="text-[11px] text-[#554336] block">Save local browser rollback checkpoint</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowManualSnapshotModal(false);
                  setManualSnapshotName('');
                }}
                className="w-8 h-8 rounded-lg bg-[#EFE6E4] hover:bg-[#E9E1DF] flex items-center justify-center text-[#554336] hover:text-[#1E1B1A] transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E1B1A]">Snapshot Label / Description</label>
                <input
                  type="text"
                  autoFocus
                  value={manualSnapshotName}
                  onChange={(e) => setManualSnapshotName(e.target.value)}
                  placeholder="e.g. Pre-Weekend Update or Eid Campaign"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5ECEA] text-xs font-semibold text-[#1E1B1A] focus:outline-none focus:ring-2 focus:ring-[#8D4B00] border border-[#E9E1DF]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateManualSnapshot();
                  }}
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#554336] uppercase tracking-wider block">
                  Quick Name Suggestions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Pre-Weekend Rates Update',
                    'Seasonal Campaign Launch',
                    'Catalog Pricing Revision',
                    'Before Hero Content Change',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setManualSnapshotName(preset)}
                      className="px-2.5 py-1 rounded-full bg-[#F5ECEA] hover:bg-[#EFE6E4] text-[#8D4B00] text-[10px] font-semibold transition-colors cursor-pointer border border-[#E9E1DF]"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Snapshot State Summary */}
              <div className="p-3.5 rounded-xl bg-[#FBF2F0] border border-[#E9E1DF] space-y-1 text-[#554336]">
                <div className="text-[10px] font-bold text-[#8D4B00] uppercase tracking-wider">
                  Live Snapshot Contents
                </div>
                <div className="flex items-center justify-between text-xs text-[#1E1B1A]">
                  <span>Total Tour Experiences:</span>
                  <span className="font-bold text-[#8D4B00]">{experiences.length} Active Tours</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#1E1B1A]">
                  <span>Hero Headline:</span>
                  <span className="font-bold truncate max-w-[200px]">{heroH1}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#1E1B1A]">
                  <span>Operator:</span>
                  <span className="font-mono text-[11px] truncate max-w-[180px]">
                    {adminSession?.email || 'awalgsm@gmail.com'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#FBF2F0] border-t border-[#E9E1DF] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowManualSnapshotModal(false);
                  setManualSnapshotName('');
                }}
                className="px-4 py-2 rounded-xl bg-white border border-[#E9E1DF] text-xs font-bold uppercase tracking-wider text-[#1E1B1A] hover:bg-[#F5ECEA] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateManualSnapshot}
                className="px-4 py-2 rounded-xl bg-[#8D4B00] hover:bg-[#B15F00] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Save Snapshot</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. FACTORY BASELINE RESET CONFIRMATION MODAL */}
      {showFactoryResetModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-red-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 bg-red-50 border-b border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">warning</span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-red-950">Factory Baseline Reset?</h3>
                  <span className="text-[11px] text-red-800 block">DTCM Official Baseline Reversion</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFactoryResetModal(false)}
                className="w-8 h-8 rounded-lg bg-red-100/70 hover:bg-red-200 flex items-center justify-center text-red-800 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs text-[#554336] leading-relaxed">
              <p>
                This action will restore the pristine factory catalog of <strong>8 official DTCM Dubai safari packages</strong> and default hero headlines.
              </p>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[#1E1B1A] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#8D4B00] text-[11px]">
                  <span className="material-symbols-outlined text-[16px]">shield</span>
                  <span>Safety Auto-Snapshot Enabled</span>
                </div>
                <p className="text-[11px] text-[#554336]">
                  A rollback snapshot of your current site will automatically be saved to your local recovery points before resetting, so no work is permanently lost.
                </p>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-[#E9E1DF] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowFactoryResetModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E9E1DF] text-xs font-bold uppercase tracking-wider text-[#1E1B1A] hover:bg-[#F5ECEA] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFactoryReset}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Restore Baseline</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SNAPSHOT DETAILS INSPECTION MODAL */}
      {selectedSnapshotForDetails && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#E9E1DF] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-[#FBF2F0] to-[#FFF8F6] border-b border-[#E9E1DF] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8D4B00] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">history</span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#1E1B1A]">
                    {selectedSnapshotForDetails.label}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#554336]">
                    <span>{new Date(selectedSnapshotForDetails.timestamp).toLocaleString()}</span>
                    <span>&bull;</span>
                    <span className="font-bold text-[#8D4B00] uppercase">
                      {selectedSnapshotForDetails.type}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSnapshotForDetails(null)}
                className="w-8 h-8 rounded-lg bg-[#EFE6E4] hover:bg-[#E9E1DF] flex items-center justify-center text-[#554336] hover:text-[#1E1B1A] transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-[#FBF2F0] border border-[#E9E1DF] space-y-1">
                <span className="text-[10px] font-bold text-[#8D4B00] uppercase tracking-wider block">
                  Snapshot Hero Copy
                </span>
                <div className="font-serif font-bold text-xs text-[#1E1B1A]">
                  "{selectedSnapshotForDetails.data.cmsConfig?.heroTitle}"
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#554336] uppercase tracking-wider block">
                  Tours in Snapshot ({selectedSnapshotForDetails.data.experiences?.length || 0})
                </span>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-[#E9E1DF] rounded-xl p-2 bg-[#FBF2F0]/50">
                  {selectedSnapshotForDetails.data.experiences?.map((tour, i) => (
                    <div
                      key={tour.id || i}
                      className="p-2 rounded-lg bg-white border border-[#E9E1DF] flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-[#1E1B1A] truncate block">{tour.title}</span>
                        <span className="text-[10px] text-[#554336]">{tour.duration} &bull; {tour.category}</span>
                      </div>
                      <span className="font-serif font-bold text-xs text-[#8D4B00] shrink-0">
                        AED {tour.priceAED}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#FBF2F0] border-t border-[#E9E1DF] flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(selectedSnapshotForDetails.data, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `phoenix-snapshot-${selectedSnapshotForDetails.id}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-2 rounded-xl bg-white border border-[#E9E1DF] text-xs font-bold text-[#554336] hover:text-[#1E1B1A] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download JSON</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSnapshotForDetails(null)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E9E1DF] text-xs font-bold uppercase tracking-wider text-[#1E1B1A] hover:bg-[#F5ECEA] transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const snapData = selectedSnapshotForDetails.data;
                    setSelectedSnapshotForDetails(null);
                    setPendingRestore(snapData);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#8D4B00] hover:bg-[#B15F00] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">settings_backup_restore</span>
                  <span>Restore This Snapshot</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE FIXED BOTTOM NAVIGATION BAR (< lg) */}
      <nav
        aria-label="Mobile Operator Admin Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FFF8F6]/95 backdrop-blur-xl border-t border-[#E9E1DF] shadow-[0_-2px_16px_rgba(141,75,0,0.08)] pb-safe"
      >
        <div className="flex justify-around items-center h-16 px-1 max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => setActiveNav('homepage-cms')}
            className={`flex flex-col items-center justify-center w-16 h-12 transition-colors cursor-pointer ${
              activeNav === 'homepage-cms' ? 'text-[#8D4B00] font-bold' : 'text-[#554336] hover:text-[#1E1B1A]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">view_quilt</span>
            <span className="text-[10px] mt-0.5 font-medium">CMS &amp; Hero</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveNav('tour-catalog-pricing')}
            className={`flex flex-col items-center justify-center w-16 h-12 transition-colors cursor-pointer relative ${
              activeNav === 'tour-catalog-pricing' ? 'text-[#8D4B00] font-bold' : 'text-[#554336] hover:text-[#1E1B1A]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">explore</span>
            <span className="text-[10px] mt-0.5 font-medium">Tours ({experiences.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveNav('bookings-convoys')}
            className={`flex flex-col items-center justify-center w-16 h-12 transition-colors cursor-pointer ${
              activeNav === 'bookings-convoys' ? 'text-[#8D4B00] font-bold' : 'text-[#554336] hover:text-[#1E1B1A]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">calendar_month</span>
            <span className="text-[10px] mt-0.5 font-medium">Bookings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveNav('seo-audit')}
            className={`flex flex-col items-center justify-center w-16 h-12 transition-colors cursor-pointer ${
              activeNav === 'seo-audit' ? 'text-[#8D4B00] font-bold' : 'text-[#554336] hover:text-[#1E1B1A]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">travel_explore</span>
            <span className="text-[10px] mt-0.5 font-medium">SEO Audit</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center w-16 h-12 text-[#554336] hover:text-[#8D4B00] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
            <span className="text-[10px] mt-0.5 font-medium">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
