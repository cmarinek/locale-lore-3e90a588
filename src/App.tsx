import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Index } from '@/pages';
import { AuthMain } from '@/pages/auth';
import { AuthCallback } from '@/pages/auth/callback';
import { AuthConfirm } from '@/pages/auth/confirm';
import { AuthResetPassword } from '@/pages/auth/reset-password';
import { NotFound } from '@/pages/not-found';
import { ComponentShowcase } from '@/pages/components';
import { LoreSubmit } from '@/pages/lore/submit';
import {
  ExplorePageLazy,
  SearchPageLazy,
  SubmitPageLazy,
  ProfilePageLazy,
  FactPageLazy,
  AdminPageLazy,
  DiscoverPageLazy,
  DiscoveryPageLazy,
  GamificationPageLazy,
  MediaManagementPageLazy,
  BillingPageLazy
} from '@/components/performance/LazyRoutes';
import { Social } from '@/pages/Social';

function App() {
  return (
    <>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthMain />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/confirm" element={<AuthConfirm />} />
            <Route path="/auth/reset-password" element={<AuthResetPassword />} />
            <Route path="/explore" element={
              <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <ExplorePageLazy />
              </Suspense>
            } />
            <Route path="/search" element={
              <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <SearchPageLazy />
              </Suspense>
            } />
            <Route path="/submit" element={
              <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <SubmitPageLazy />
              </Suspense>
            } />
            <Route path="/gamification" element={
              <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <GamificationPageLazy />
              </Suspense>
            } />
            <Route path="/social" element={<Social />} />
            <Route path="/media" element={
              <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <MediaManagementPageLazy />
              </Suspense>
            } />
            <Route path="/profile/:id?" element={
              <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <ProfilePageLazy />
              </Suspense>
            } />
            <Route path="/fact/:id" element={
              <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <FactPageLazy />
              </Suspense>
            } />
            <Route path="/admin" element={
              <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <AdminPageLazy />
              </Suspense>
            } />
            <Route path="/discover" element={
              <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <DiscoverPageLazy />
              </Suspense>
            } />
            <Route path="/discovery" element={
              <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <DiscoveryPageLazy />
              </Suspense>
            } />
            <Route path="/billing" element={
              <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <BillingPageLazy />
              </Suspense>
            } />
            <Route path="/components" element={<ComponentShowcase />} />
            <Route path="/lore/submit" element={<LoreSubmit />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
    </>
  );
}

export default App;
