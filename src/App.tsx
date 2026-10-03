/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Currency, Experience, OffRoadPricingConfig, Review } from './types';
import { DEFAULT_OFF_ROAD_PRICING, EXPERIENCES, REVIEWS } from './data/safaris';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SignatureExpeditions } from './components/SignatureExpeditions';
import { PriceMatchComparisonSection } from './components/PriceMatchComparisonSection';
import { AdrenalineBuggySection } from './components/AdrenalineBuggySection';
import { CityToursSection } from './components/CityToursSection';
import { TravelGuidesSection } from './components/TravelGuidesSection';
import { FAQSection } from './components/FAQSection';
import { ReviewsSection } from './components/ReviewsSection';
import { DirectOperatorSection } from './components/DirectOperatorSection';
import { JsonLdStructuredData } from './components/JsonLdStructuredData';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { ItineraryModal } from './components/ItineraryModal';
import { ReviewModal } from './components/ReviewModal';
import { WhatsAppDrawer } from './components/WhatsAppDrawer';
import { TourAssistant } from './components/TourAssistant';
import { InfoModal } from './components/InfoModal';
import { AdminDashboard, CMSConfig } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { getStoredAdminSession, clearAdminSession, AdminSession } from './utils/adminAuth';

export default function App() {
  // Navigation View State: 'storefront' or 'admin'
  const [currentView, setCurrentView] = useState<'storefront' | 'admin'>('storefront');

  // Admin Authentication State
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => getStoredAdminSession());
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);

  const [currency, setCurrency] = useState<Currency>('AED');
  const [activeSection, setActiveSection] = useState<string>('desert-safaris');
  const [reviewsList, setReviewsList] = useState<Review[]>(REVIEWS);

  // Dynamic CMS Configuration
  const [cmsConfig, setCmsConfig] = useState<CMSConfig>(() => {
    try {
      const saved = localStorage.getItem('phoenix_cms_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading stored cmsConfig', e);
    }
    return {
      heroTitle: "Experience the Untamed Spirit of Dubai's Golden Dunes",
      heroSubtitle:
        'Phoenix Desert Safari is a Dubai tour operator offering authentic Bedouin desert experiences, 5-star camp hospitality, private convoys, and 1000HP dune buggies.',
      heroImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCwh3IxGfRyabThS2IkAAkO8dgF-efStfsRxJ1OeVcgXu3uJ4GtgqV_Ma90tHpmLrmvedQGkOkh0VKcZlNh8e5DBmZy2TtfVPWAKzOJ2cZlwKwdVahe2FQVZ-BwAqh3Pi2Cpg_Y--XbSM36LrxiBL5HqQ55NT_aE_KkRfbdCo1qqbXXXhkZNoiG6yGKjm_Dzi9nmdUz_ADZ9vR_MmbdmkTNoWUG5oPjljsrmRK8AUVCrFZWyKzGs4vZ_A',
      announcementTicker:
        'DTCM Licensed Operator • Free Home & Hotel Pickup Across Dubai | Instant Confirmation',
      showAnnouncement: true,
      defaultBookingExperience: 'evening-desert-safari',
      directPhone: '+971 56 150 5270',
      headquarters: 'DAMAC XL Tower - Business Bay, Dubai',
      whatsappWebhook: 'UltraMsg v2.4 (Active Webhook)',
    };
  });

  // Dynamic Tours Catalog
  const [experiences, setExperiences] = useState<Experience[]>(() => {
    try {
      const saved = localStorage.getItem('phoenix_experiences');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading stored experiences', e);
    }
    return EXPERIENCES;
  });

  // Dynamic Off-Road Machine & Vehicle Rates (Quad Bikes & Buggies)
  const [offRoadPricing, setOffRoadPricing] = useState<OffRoadPricingConfig>(() => {
    try {
      const saved = localStorage.getItem('phoenix_offroad_pricing');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading stored offroad pricing', e);
    }
    return DEFAULT_OFF_ROAD_PRICING;
  });

  // Modal States
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingModalParams, setBookingModalParams] = useState<{
    experienceId?: string;
    date?: string;
    adults?: number;
    children?: number;
    duration?: '30m' | '60m';
    machine?: string;
    timeSlot?: string;
    quadRider?: 'single' | 'double';
    quadTerrain?: 'inside_circle' | 'open_desert';
    quadEngine?: '220cc' | '350cc';
    buggyModel?: 'polaris' | 'canam';
    buggySeater?: '2-seater' | '4-seater';
  }>({});

  const [itineraryModalOpen, setItineraryModalOpen] = useState(false);
  const [itineraryExperienceId, setItineraryExperienceId] = useState<string>('evening-desert-safari');

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [infoModalTopic, setInfoModalTopic] = useState<'privacy' | 'terms' | 'safety' | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleOpenBooking = (
    experienceId?: string,
    params?: {
      duration?: '30m' | '60m';
      machine?: string;
      timeSlot?: string;
      date?: string;
      adults?: number;
      children?: number;
      quadRider?: 'single' | 'double';
      quadTerrain?: 'inside_circle' | 'open_desert';
      quadEngine?: '220cc' | '350cc';
      buggyModel?: 'polaris' | 'canam';
      buggySeater?: '2-seater' | '4-seater';
    }
  ) => {
    setBookingModalParams({ experienceId, ...params });
    setBookingModalOpen(true);
  };

  const handleCheckLiveRates = (params: {
    experienceId: string;
    date: string;
    adults: number;
    children: number;
    duration?: '30m' | '60m';
    machine?: string;
    timeSlot?: string;
  }) => {
    setBookingModalParams(params);
    setBookingModalOpen(true);
  };

  const handleViewItinerary = (experienceId: string) => {
    setItineraryExperienceId(experienceId);
    setItineraryModalOpen(true);
  };

  const handleAddReview = (newRev: Review) => {
    setReviewsList([newRev, ...reviewsList]);
    setReviewModalOpen(false);
    showToast('Thank you for your 5-star review! It has been posted to our verified wall.');
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // CMS Handlers
  const handleUpdateCmsConfig = (updated: CMSConfig) => {
    setCmsConfig(updated);
    try {
      localStorage.setItem('phoenix_cms_config', JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving cmsConfig', e);
    }
  };

  // Tour Handlers
  const handleUpdateExperience = (updated: Experience) => {
    const next = experiences.map((exp) => (exp.id === updated.id ? updated : exp));
    setExperiences(next);
    try {
      localStorage.setItem('phoenix_experiences', JSON.stringify(next));
    } catch (e) {
      console.warn('Error saving experiences', e);
    }
  };

  const handleAddExperience = (newExp: Experience) => {
    const next = [newExp, ...experiences];
    setExperiences(next);
    try {
      localStorage.setItem('phoenix_experiences', JSON.stringify(next));
    } catch (e) {
      console.warn('Error saving experiences', e);
    }
  };

  const handleDeleteExperience = (id: string) => {
    const next = experiences.filter((exp) => exp.id !== id);
    setExperiences(next);
    try {
      localStorage.setItem('phoenix_experiences', JSON.stringify(next));
    } catch (e) {
      console.warn('Error saving experiences', e);
    }
  };

  // Off-Road Machine Pricing Handler
  const handleUpdateOffRoadPricing = (updated: OffRoadPricingConfig) => {
    setOffRoadPricing(updated);
    try {
      localStorage.setItem('phoenix_offroad_pricing', JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving offroad pricing', e);
    }
  };

  // Full System Restore Handler
  const handleRestoreAll = (
    newCmsConfig: CMSConfig,
    newExperiences: Experience[],
    newOffRoadPricing?: OffRoadPricingConfig
  ) => {
    setCmsConfig(newCmsConfig);
    setExperiences(newExperiences);
    if (newOffRoadPricing) {
      setOffRoadPricing(newOffRoadPricing);
      try {
        localStorage.setItem('phoenix_offroad_pricing', JSON.stringify(newOffRoadPricing));
      } catch (e) {
        console.warn('Error saving restored offroad pricing', e);
      }
    }
    try {
      localStorage.setItem('phoenix_cms_config', JSON.stringify(newCmsConfig));
      localStorage.setItem('phoenix_experiences', JSON.stringify(newExperiences));
    } catch (e) {
      console.warn('Error saving restored data', e);
    }
  };

  // Admin Authentication Actions
  const handleOpenAdmin = () => {
    if (adminSession) {
      setCurrentView('admin');
    } else {
      setAdminLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = (session: AdminSession) => {
    setAdminSession(session);
    setAdminLoginModalOpen(false);
    setCurrentView('admin');
    showToast(`Access Granted. Welcome, ${session.name} (${session.email})`);
  };

  const handleAdminSignOut = () => {
    clearAdminSession();
    setAdminSession(null);
    setCurrentView('storefront');
    showToast('Signed out of Operator Admin. Portal locked.');
  };

  // If in Admin Dashboard view, render the Admin Portal (gated by auth)
  if (currentView === 'admin') {
    if (!adminSession) {
      return (
        <div className="bg-[#181514] min-h-screen flex items-center justify-center p-4">
          <AdminLoginModal
            isOpen={true}
            onClose={() => setCurrentView('storefront')}
            onSuccess={handleAdminLoginSuccess}
          />
        </div>
      );
    }

    return (
      <AdminDashboard
        cmsConfig={cmsConfig}
        onUpdateCmsConfig={handleUpdateCmsConfig}
        experiences={experiences}
        onUpdateExperience={handleUpdateExperience}
        onAddExperience={handleAddExperience}
        onDeleteExperience={handleDeleteExperience}
        onSwitchToStorefront={() => setCurrentView('storefront')}
        adminSession={adminSession}
        onSignOut={handleAdminSignOut}
        onRestoreAll={handleRestoreAll}
        offRoadPricing={offRoadPricing}
        onUpdateOffRoadPricing={handleUpdateOffRoadPricing}
      />
    );
  }

  // Otherwise, render the customer-facing Storefront
  return (
    <div className="bg-[#FAF6F0] text-[#1C1917] min-h-screen flex flex-col selection:bg-amber-100 selection:text-amber-900 font-sans relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-amber-500/40 flex items-center gap-3 animate-in fade-in slide-from-top-4 duration-300">
          <span className="material-symbols-outlined text-emerald-400 text-[22px]">verified</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white ml-2 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Operator Portal Quick-Access Switcher */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          type="button"
          onClick={handleOpenAdmin}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-stone-900/90 hover:bg-stone-900 text-amber-300 hover:text-white text-xs font-bold shadow-2xl border border-amber-500/40 backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95 group"
          title={adminSession ? "Operator Admin Dashboard (Authenticated)" : "Secure Operator Admin Login"}
        >
          <span className="material-symbols-outlined text-[18px] text-amber-400 group-hover:rotate-12 transition-transform">
            {adminSession ? 'admin_panel_settings' : 'lock'}
          </span>
          <span>{adminSession ? 'Admin Portal' : 'Admin Login'}</span>
          <span className={`w-2 h-2 rounded-full ${adminSession ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse ml-0.5`}></span>
        </button>
      </div>

      {/* Sticky Header with Announcement Bar & Navigation */}
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenBooking={() => handleOpenBooking()}
        onOpenWhatsApp={() => setWhatsAppOpen(true)}
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onOpenAdmin={handleOpenAdmin}
        isAdminLoggedIn={!!adminSession}
        announcementText={cmsConfig.announcementTicker}
        showAnnouncement={cmsConfig.showAnnouncement}
        phone={cmsConfig.directPhone}
      />

      {/* Main Experience Layout */}
      <main className="flex-1 flex flex-col">
        <Hero
          onCheckLiveRates={handleCheckLiveRates}
          onOpenConcierge={() => setWhatsAppOpen(true)}
          heroTitle={cmsConfig.heroTitle}
          heroSubtitle={cmsConfig.heroSubtitle}
          heroImage={cmsConfig.heroImage}
          experiences={experiences}
          phone={cmsConfig.directPhone}
          announcementText={cmsConfig.announcementTicker}
        />

        <SignatureExpeditions
          currency={currency}
          onBookExperience={(id) => handleOpenBooking(id)}
          onViewItinerary={handleViewItinerary}
          experiences={experiences}
        />

        <PriceMatchComparisonSection
          currency={currency}
          onBookExperience={(id) => handleOpenBooking(id)}
          onOpenWhatsApp={() => setWhatsAppOpen(true)}
        />

        <AdrenalineBuggySection
          currency={currency}
          onBookExperience={(id, params) => handleOpenBooking(id, params)}
          onViewItinerary={handleViewItinerary}
          experiences={experiences}
          offRoadPricing={offRoadPricing}
        />

        <CityToursSection
          currency={currency}
          onViewItinerary={handleViewItinerary}
          onBookExperience={(id) => handleOpenBooking(id)}
          experiences={experiences}
        />

        <TravelGuidesSection />

        <FAQSection />

        <ReviewsSection
          reviews={reviewsList}
          onOpenWriteReview={() => setReviewModalOpen(true)}
        />

        <DirectOperatorSection
          onOpenWhatsApp={() => setWhatsAppOpen(true)}
          cmsConfig={cmsConfig}
        />
      </main>

      <JsonLdStructuredData />

      {/* Luxury Footer */}
      <Footer
        onSelectExperience={(id) => handleViewItinerary(id)}
        onOpenPrivacy={(topic) => setInfoModalTopic(topic as 'privacy' | 'terms' | 'safety')}
        onOpenAdmin={handleOpenAdmin}
        cmsConfig={cmsConfig}
        experiences={experiences}
      />

      {/* Booking Checkout Modal */}
      {bookingModalOpen && (
        <BookingModal
          initialExperienceId={bookingModalParams.experienceId}
          initialDate={bookingModalParams.date}
          initialAdults={bookingModalParams.adults}
          initialChildren={bookingModalParams.children}
          initialDuration={bookingModalParams.duration}
          initialMachine={bookingModalParams.machine}
          initialTimeSlot={bookingModalParams.timeSlot}
          initialQuadRider={bookingModalParams.quadRider}
          initialQuadTerrain={bookingModalParams.quadTerrain}
          initialQuadEngine={bookingModalParams.quadEngine}
          initialBuggyModel={bookingModalParams.buggyModel}
          initialBuggySeater={bookingModalParams.buggySeater}
          currency={currency}
          onClose={() => setBookingModalOpen(false)}
          experiences={experiences}
          offRoadPricing={offRoadPricing}
        />
      )}

      {/* Itinerary Viewer Modal */}
      {itineraryModalOpen && (
        <ItineraryModal
          experienceId={itineraryExperienceId}
          currency={currency}
          onClose={() => setItineraryModalOpen(false)}
          onBookNow={(id) => {
            setItineraryModalOpen(false);
            handleOpenBooking(id);
          }}
          experiences={experiences}
        />
      )}

      {/* Review Submission Modal */}
      {reviewModalOpen && (
        <ReviewModal
          onClose={() => setReviewModalOpen(false)}
          onSubmitReview={handleAddReview}
        />
      )}

      <TourAssistant />

      {/* UltraMsg WhatsApp Direct Concierge Drawer */}
      <WhatsAppDrawer
        isOpen={whatsAppOpen}
        onClose={() => setWhatsAppOpen(false)}
        onOpen={() => setWhatsAppOpen(true)}
      />

      {/* Privacy, Terms, and Safety Modal */}
      {infoModalTopic && (
        <InfoModal
          topic={infoModalTopic}
          onClose={() => setInfoModalTopic(null)}
        />
      )}
    </div>
  );
}

