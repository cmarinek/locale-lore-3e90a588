
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MobileProvider } from "./components/providers/MobileProvider";
import { PWAInstallPrompt } from "@/components/offline/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/offline/OfflineIndicator";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";
import { LazyRoutes } from "@/components/performance/LazyRoutes";
import { usePWA } from "@/hooks/usePWA";
import { useEffect } from "react";

// Optimize QueryClient for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        if (error?.status === 404 || error?.status === 403) return false;
        return failureCount < 2;
      },
    },
  },
});

const App = () => {
  const { registerServiceWorker } = usePWA();

  useEffect(() => {
    registerServiceWorker();
    
    // Preload critical resources
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Preload commonly used images
        const criticalImages = [
          '/placeholder.svg',
          // Add other critical images
        ];
        
        criticalImages.forEach(src => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = src;
          document.head.appendChild(link);
        });
      });
    }
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
            <PerformanceMonitor />
            <BrowserRouter>
              <LazyRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </MobileProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
