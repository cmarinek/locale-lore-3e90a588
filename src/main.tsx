import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeErrorTracking, initializePerformanceMonitoring } from './utils/monitoring'

// Initialize monitoring and error tracking
initializeErrorTracking();
initializePerformanceMonitoring();

createRoot(document.getElementById("root")!).render(<App />);
