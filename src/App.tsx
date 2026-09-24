/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Currency, Experience, Review } from './types';
import { EXPERIENCES, REVIEWS } from './data/safaris';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SignatureExpeditions } from './components/SignatureExpeditions';
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
  const [cmsConfig, setCmsConfig] = useState<CMSConfig>({
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
  });

  // Dynamic Tours Catalog
  const [experiences, setExperiences] = useState<Experience[]>(EXPERIENCES);

  // Modal States
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingModalParams, setBookingModalParams] = useState<{
    experienceId?: string;
    date?: string;
    adults?: number;
    children?: number;
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

  const handleOpenBooking = (experienceId?: string) => {
    setBookingModalParams({ experienceId });
    setBookingModalOpen(true);
  };

  const handleCheckLiveRates = (params: {
    experienceId: string;
    date: string;
    adults: number;
    children: number;
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

  // Experience Mutations for Admin CMS
  const handleUpdateExperience = (updated: Experience) => {
    setExperiences((prev) => prev.map((exp) => (exp.id === updated.id ? updated : exp)));
  };

  const handleAddExperience = (newExp: Experience) => {
    setExperiences((prev) => [newExp, ...prev]);
  };

  const handleDeleteExperience = (id: string) => {
    setExperiences((prev) => prev.filter((exp) => exp.id !== id));
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
        onUpdateCmsConfig={setCmsConfig}
        experiences={experiences}
        onUpdateExperience={handleUpdateExperience}
        onAddExperience={handleAddExperience}
        onDeleteExperience={handleDeleteExperience}
        onSwitchToStorefront={() => setCurrentView('storefront')}
        adminSession={adminSession}
        onSignOut={handleAdminSignOut}
      />
    );
  }

  // Otherwise, render the customer-facing Storefront
  return (
    <div className="bg-[#FAF6F0] text-[#1C1917] min-h-screen flex flex-col selection:bg-amber-100 selection:text-amber-900 font-sans relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-amber-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
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
      />

      {/* Main Content Sections */}
      <main className="w-full pt-20 bg-[#FAF6F0] flex-1">
        <Hero
          onCheckLiveRates={handleCheckLiveRates}
          onOpenConcierge={() => setWhatsAppOpen(true)}
          heroTitle={cmsConfig.heroTitle}
          heroSubtitle={cmsConfig.heroSubtitle}
          heroImage={cmsConfig.heroImage}
        />

        <SignatureExpeditions
          currency={currency}
          onBookExperience={(id) => handleOpenBooking(id)}
          onViewItinerary={handleViewItinerary}
          experiences={experiences}
        />

        <AdrenalineBuggySection
          currency={currency}
          onBookExperience={(id) => handleOpenBooking(id)}
          onViewItinerary={handleViewItinerary}
        />

        <CityToursSection
          currency={currency}
          onViewItinerary={handleViewItinerary}
          onBookExperience={(id) => handleOpenBooking(id)}
        />

        <TravelGuidesSection />

        <FAQSection />

        <ReviewsSection
          reviews={reviewsList}
          onOpenWriteReview={() => setReviewModalOpen(true)}
        />

        <DirectOperatorSection onOpenWhatsApp={() => setWhatsAppOpen(true)} />
      </main>

      <JsonLdStructuredData />

      {/* Luxury Footer */}
      <Footer
        onSelectExperience={(id) => handleViewItinerary(id)}
        onOpenPrivacy={(topic) => setInfoModalTopic(topic as 'privacy' | 'terms' | 'safety')}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Booking Checkout Modal */}
      {bookingModalOpen && (
        <BookingModal
          initialExperienceId={bookingModalParams.experienceId}
          initialDate={bookingModalParams.date}
          initialAdults={bookingModalParams.adults}
          initialChildren={bookingModalParams.children}
          currency={currency}
          onClose={() => setBookingModalOpen(false)}
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
        />
      )}

      {/* Write a Review Modal */}
      {reviewModalOpen && (
        <ReviewModal
          onClose={() => setReviewModalOpen(false)}
          onSubmitReview={handleAddReview}
        />
      )}

      {/* WhatsApp VIP Concierge Drawer & Floating Icon */}
      <WhatsAppDrawer
        isOpen={whatsAppOpen}
        onClose={() => setWhatsAppOpen(false)}
        onOpen={() => setWhatsAppOpen(true)}
      />

      {/* Privacy / Terms / Safety Modal */}
      {infoModalTopic && (
        <InfoModal
          topic={infoModalTopic}
          onClose={() => setInfoModalTopic(null)}
        />
      )}

      {/* Secure Operator Admin Login Modal */}
      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
