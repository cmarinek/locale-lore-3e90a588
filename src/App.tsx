import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MobileProvider } from "./components/providers/MobileProvider";
import { PWAInstallPrompt } from "@/components/offline/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/offline/OfflineIndicator";
import { usePWA } from "@/hooks/usePWA";
import { useEffect } from "react";
import Index from "./pages/Index";
import AuthMain from "./pages/AuthMain";
import AuthCallback from "./pages/AuthCallback";
import AuthConfirm from "./pages/AuthConfirm";
import AuthResetPassword from "./pages/AuthResetPassword";
import ComponentShowcase from "./pages/ComponentShowcase";
import { Discover } from "./pages/Discover";
import Discovery from "./pages/Discovery";
import { Explore } from "./pages/Explore";
import { Search } from "./pages/Search";
import { Submit } from "./pages/Submit";
import { Fact } from "./pages/Fact";
import { Profile } from "./pages/Profile";
import Gamification from "./pages/Gamification";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => {
  const { registerServiceWorker } = usePWA();

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MobileProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OfflineIndicator />
            <PWAInstallPrompt />
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<Discovery />} />
              <Route path="/auth" element={<AuthMain />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/confirm" element={<AuthConfirm />} />
              <Route path="/auth/reset-password" element={<AuthResetPassword />} />
              <Route path="/components" element={<ComponentShowcase />} />
              <Route path="/discover" element={<Discovery />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/search" element={<Search />} />
              <Route path="/submit" element={<Submit />} />
                <Route path="/fact/:id" element={<Fact />} />
                <Route path="/profile/:id?" element={<Profile />} />
                <Route path="/gamification" element={<Gamification />} />
                <Route path="/admin" element={<Admin />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </MobileProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;