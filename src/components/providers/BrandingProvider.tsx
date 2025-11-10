import React, { createContext, useContext, ReactNode } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface BrandingSettings {
  logo_url: string;
  favicon_url: string;
  site_name: string;
}

interface ThemeSettings {
  primary_color: string;
  secondary_color: string;
}

interface BrandingContextValue {
  branding: BrandingSettings | undefined;
  theme: ThemeSettings | undefined;
  isLoading: boolean;
  updateBranding: (newBranding: Partial<BrandingSettings>) => void;
  uploadLogo: (file: File) => void;
  uploadFavicon: (file: File) => void;
  isUploading: boolean;
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const siteSettings = useSiteSettings();

  return (
    <BrandingContext.Provider value={siteSettings}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};
