import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageProvider';

const SITE_URL = 'https://localelore.app'; // Update with actual domain

export const HreflangTags = () => {
  const location = useLocation();
  const { supportedLanguages, currentLanguage } = useLanguage();
  
  // Get current path without language prefix
  const currentPath = location.pathname;
  
  // Generate hreflang tags for all supported languages
  const hreflangLinks = Object.keys(supportedLanguages).map((langCode) => ({
    rel: 'alternate',
    hrefLang: langCode,
    href: `${SITE_URL}${currentPath}?lang=${langCode}`
  }));
  
  // Add x-default for default language (English)
  hreflangLinks.push({
    rel: 'alternate',
    hrefLang: 'x-default',
    href: `${SITE_URL}${currentPath}`
  });
  
  // Add canonical URL
  const canonicalUrl = `${SITE_URL}${currentPath}${currentLanguage !== 'en' ? `?lang=${currentLanguage}` : ''}`;

  return (
    <Helmet>
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Hreflang tags for all languages */}
      {hreflangLinks.map((link) => (
        <link
          key={link.hrefLang}
          rel={link.rel}
          hrefLang={link.hrefLang}
          href={link.href}
        />
      ))}
      
      {/* HTML lang attribute */}
      <html lang={currentLanguage} />
    </Helmet>
  );
};
