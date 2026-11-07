/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Currency, Experience, OffRoadPricingConfig, Review } from './types';
import { DEFAULT_OFF_ROAD_PRICING, EXPERIENCES, REVIEWS } from './data/safaris';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TopDestinationsSection } from './components/TopDestinationsSection';
import { AboutExperienceSection } from './components/AboutExperienceSection';
import { TravelServicesSection } from './components/TravelServicesSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { PlanTripCtaBanner } from './components/PlanTripCtaBanner';
import { GalleryStrip } from './components/GalleryStrip';
import { SignatureExpeditions } from './components/SignatureExpeditions';
import { AdrenalineBuggySection } from './components/AdrenalineBuggySection';
import { CityToursSection } from './components/CityToursSection';
import { PriceMatchComparisonSection } from './components/PriceMatchComparisonSection';
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
import { AiBookingAgentWidget } from './components/AiBookingAgentWidget';
import { InfoModal } from './components/InfoModal';
import { AdminDashboard, CMSConfig } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { getStoredAdminSession, clearAdminSession, AdminSession } from './utils/adminAuth';
import { useCanonicalSeo } from './utils/useCanonicalSeo';

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
    const defaultTicker =
      'Direct Tour Operator • Free Home & Hotel Pickup Across Dubai | Instant Confirmation';
    try {
      const saved = localStorage.getItem('phoenix_cms_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.announcementTicker) {
          parsed.announcementTicker = parsed.announcementTicker
            .replace(/DTCM\s*(?:-|\s*Licensed\s*)?Operator\s*•?\s*/gi, 'Direct Tour Operator • ')
            .replace(/DTCM\s*Licensed\s*/gi, '')
            .trim();
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored cmsConfig', e);
    }
    return {
      heroTitle: "Explore Dubai With The Phoenix Tours",
      heroSubtitle:
        'Discover breathtaking red dunes, unforgettable Bedouin camp experiences, and expertly crafted luxury tours across Dubai and beyond.',
      heroImage:
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1800&auto=format&fit=crop&q=85',
      announcementTicker: defaultTicker,
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

  // Dynamic Canonical & OpenGraph SEO Sync
  const activeModalTourId = itineraryModalOpen
    ? itineraryExperienceId
    : bookingModalOpen
    ? bookingModalParams.experienceId
    : undefined;
  useCanonicalSeo(activeSection, activeModalTourId);

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

  useEffect(() => {
    const handleUrlTrigger = () => {
      if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
        handleOpenAdmin();
      }
    };
    handleUrlTrigger();
    window.addEventListener('hashchange', handleUrlTrigger);
    return () => window.removeEventListener('hashchange', handleUrlTrigger);
  }, [adminSession]);

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
        <div
          role="status"
          aria-live="polite"
          className="fixed top-24 right-4 sm:right-8 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-amber-500/40 flex items-center gap-3 animate-in fade-in slide-from-top-4 duration-300"
        >
          <span className="material-symbols-outlined text-emerald-400 text-[22px]">verified</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="text-stone-400 hover:text-white ml-2 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

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
        {/* Section 1: Hero with 5-Column Trust Pillars Bar & Quick Rate Checker */}
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

        {/* Section 2: Top Destinations (5 Cards from reference design) */}
        <TopDestinationsSection
          currency={currency}
          onBookExperience={(id) => handleOpenBooking(id)}
          onViewItinerary={handleViewItinerary}
          experiences={experiences}
        />

        {/* Section 3: More Than Just a Trip, It's a Lifetime Experience (About from reference design) */}
        <AboutExperienceSection
          onLearnMore={() => scrollToSection('about-experience')}
          onOpenBooking={() => handleOpenBooking()}
        />

        {/* Section 4: Travel Services We Offer (Deep Navy Grid from reference design) */}
        <TravelServicesSection
          onSelectService={() => handleOpenBooking()}
          onOpenBooking={() => handleOpenBooking()}
          onOpenWhatsApp={() => setWhatsAppOpen(true)}
        />

        {/* Section 5: Signature Desert Safaris & Camp Expeditions */}
        <SignatureExpeditions
          currency={currency}
          onBookExperience={(id) => handleOpenBooking(id)}
          onViewItinerary={handleViewItinerary}
          experiences={experiences}
        />

        {/* Buggy & Quad Bikes */}
        <AdrenalineBuggySection
          currency={currency}
          onBookExperience={(id, params) => handleOpenBooking(id, params)}
          onViewItinerary={handleViewItinerary}
          experiences={experiences}
          offRoadPricing={offRoadPricing}
        />

        {/* City Tours */}
        <CityToursSection
          currency={currency}
          onViewItinerary={handleViewItinerary}
          onBookExperience={(id) => handleOpenBooking(id)}
          experiences={experiences}
        />

        {/* Price Match & Wholesale Assurance */}
        <PriceMatchComparisonSection
          currency={currency}
          onBookExperience={(id) => handleOpenBooking(id)}
          onOpenWhatsApp={() => setWhatsAppOpen(true)}
        />

        {/* Section 6: What Our Travelers Say (Testimonials from reference design) */}
        <TestimonialsSection
          onOpenWriteReview={() => setReviewModalOpen(true)}
          onSeeMoreReviews={() => scrollToSection('reviews')}
        />

        {/* Section 7: Let's Plan Your Dream Trip Today (Call to Action Banner from reference design) */}
        <PlanTripCtaBanner
          onPlanTrip={() => handleOpenBooking()}
          onOpenWhatsApp={() => setWhatsAppOpen(true)}
        />

        {/* Section 8: Bottom Gallery Strip with 'Travel More ✈️' */}
        <GalleryStrip />

        {/* Safari Guides & FAQs */}
        <TravelGuidesSection />
        <FAQSection />

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

      {/* Admin Login Modal */}
      {adminLoginModalOpen && (
        <AdminLoginModal
          isOpen={adminLoginModalOpen}
          onClose={() => setAdminLoginModalOpen(false)}
          onSuccess={handleAdminLoginSuccess}
        />
      )}

      {/* Phoenix AI Booking Concierge Widget */}
      <AiBookingAgentWidget
        currency={currency}
        onOpenBooking={(id) => handleOpenBooking(id)}
        onOpenWhatsApp={() => setWhatsAppOpen(true)}
        experiences={experiences}
      />

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
