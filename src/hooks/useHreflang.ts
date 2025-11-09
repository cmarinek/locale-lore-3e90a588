import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageProvider';
import { SUPPORTED_LANGUAGES } from '@/utils/languages';

const SITE_URL = 'https://localelore.app'; // Update with actual domain

export interface HreflangLink {
  rel: string;
  hrefLang: string;
  href: string;
}

export const useHreflang = () => {
  const location = useLocation();
  const { currentLanguage } = useLanguage();
  
  const currentPath = location.pathname;
  
  // Generate hreflang links for all supported languages
  const generateHreflangLinks = (): HreflangLink[] => {
    const links: HreflangLink[] = [];
    
    // Add link for each supported language
    Object.keys(SUPPORTED_LANGUAGES).forEach((langCode) => {
      links.push({
        rel: 'alternate',
        hrefLang: langCode,
        href: `${SITE_URL}${currentPath}?lang=${langCode}`
      });
    });
    
    // Add x-default (typically English or auto-detect)
    links.push({
      rel: 'alternate',
      hrefLang: 'x-default',
      href: `${SITE_URL}${currentPath}`
    });
    
    return links;
  };
  
  // Generate canonical URL
  const getCanonicalUrl = (): string => {
    return `${SITE_URL}${currentPath}${currentLanguage !== 'en' ? `?lang=${currentLanguage}` : ''}`;
  };
  
  // Get alternate URL for specific language
  const getAlternateUrl = (langCode: string): string => {
    return `${SITE_URL}${currentPath}?lang=${langCode}`;
  };
  
  return {
    hreflangLinks: generateHreflangLinks(),
    canonicalUrl: getCanonicalUrl(),
    getAlternateUrl,
    currentPath,
    currentLanguage
  };
};
