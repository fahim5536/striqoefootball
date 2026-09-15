import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Particles from './components/Particles';
import ScrollToTop from './components/ScrollToTop';
import { GlobalChat } from './components/GlobalChat';
import { PageLoader } from './components/ui/Loading';
import { ErrorState } from './components/ui/ErrorState';
import OfflineBanner from './components/OfflineBanner';
import SyncStatus from './components/SyncStatus';
import FeedbackButton from './components/FeedbackButton';
import { ClientConfigProvider } from './contexts/ClientConfigContext';
import { PushNotificationManager } from './components/PushNotificationManager';

// Lazy load routes
const Dashboard = lazy(() => import('./components/Dashboard'));
const Tournament = lazy(() => import('./components/Tournament'));
const TournamentDetails = lazy(() => import('./components/TournamentDetails'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const Match = lazy(() => import('./components/Match'));
const Profile = lazy(() => import('./components/Profile'));
const Admin = lazy(() => import('./components/Admin'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const DiscordCallback = lazy(() => import('./components/DiscordCallback'));

const TermsOfUse = lazy(() => import('./components/TermsOfUse'));
const NewsArticle = lazy(() => import('./components/NewsArticle'));
const News = lazy(() => import('./components/News'));
const FAQ = lazy(() => import('./components/FAQ'));
const Rules = lazy(() => import('./components/Rules'));
const ContactUs = lazy(() => import('./components/ContactUs'));

export default function App() {
  return (
    <HelmetProvider>
      <ClientConfigProvider>
      <BrowserRouter>
        <PushNotificationManager />
        <ScrollToTop />
        <OfflineBanner />
        <SyncStatus />
        <Particles />
        <div style={{ position: 'relative', zIndex: 1 }} className="min-h-screen flex flex-col">
          <Navbar />
          <GlobalChat />
          <main className="flex-grow flex flex-col">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tournaments" element={<Tournament />} />
                <Route path="/tournaments/:id" element={<TournamentDetails />} />\n                <Route path="/tournaments/:id/:slug" element={<TournamentDetails />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/match" element={<Match />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
                          <Route path="/discord-callback" element={<Suspense fallback={<PageLoader />}><DiscordCallback /></Suspense>} />
<Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-use" element={<TermsOfUse />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<NewsArticle />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <FeedbackButton />
        </div>
      </BrowserRouter>
    </ClientConfigProvider>
    </HelmetProvider>
  );
}
