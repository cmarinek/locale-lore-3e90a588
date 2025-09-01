
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import { AuthMain } from '@/pages/AuthMain';
import { AuthCallback } from '@/pages/AuthCallback';
import { AuthConfirm } from '@/pages/AuthConfirm';
import { AuthResetPassword } from '@/pages/AuthResetPassword';
import { Discovery } from '@/pages/Discovery';
import { Explore } from '@/pages/Explore';
import { Search } from '@/pages/Search';
import { Submit } from '@/pages/Submit';
import { Profile } from '@/pages/Profile';
import { Fact } from '@/pages/Fact';
import { NotFound } from '@/pages/NotFound';
import { Discover } from '@/pages/Discover';
import { ComponentShowcase } from '@/pages/ComponentShowcase';
import { Gamification } from '@/pages/Gamification';
import { MediaManagement } from '@/pages/MediaManagement';
import { Billing } from '@/pages/Billing';
import { Social } from '@/pages/Social';
import Stories from '@/pages/Stories';
import ContributorEconomy from '@/pages/ContributorEconomy';
import { LoreSubmit } from '@/pages/LoreSubmit';
import { Admin } from '@/pages/Admin';

import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth/*" element={<AuthMain />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/auth/confirm" element={<AuthConfirm />} />
                <Route path="/auth/reset-password" element={<AuthResetPassword />} />
                <Route path="/discovery" element={<Discovery />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/search" element={<Search />} />
                <Route path="/submit" element={<Submit />} />
                <Route path="/profile/:id?" element={<Profile />} />
                <Route path="/fact/:id" element={<Fact />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/gamification" element={<Gamification />} />
                <Route path="/media" element={<MediaManagement />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/social" element={<Social />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/contributor" element={<ContributorEconomy />} />
                <Route path="/lore/submit" element={<LoreSubmit />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/showcase" element={<ComponentShowcase />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
