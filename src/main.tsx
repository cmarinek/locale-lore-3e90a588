import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeErrorTracking, initializePerformanceMonitoring } from './utils/monitoring'
import { initializeSecurityMonitoring } from './lib/supabase-secure'

// Initialize monitoring and error tracking
initializeErrorTracking();
initializePerformanceMonitoring();
initializeSecurityMonitoring();

console.log('App starting to render...');
createRoot(document.getElementById("root")!).render(<App />);
