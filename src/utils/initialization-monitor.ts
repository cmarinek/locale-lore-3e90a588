/**
 * Initialization monitoring and debugging utilities
 */

interface InitMonitorData {
  startTime: number;
  phases: Record<string, { start: number; end?: number; duration?: number; success?: boolean; error?: string }>;
  errors: Array<{ timestamp: number; error: string; phase?: string }>;
  warnings: Array<{ timestamp: number; warning: string; phase?: string }>;
}

class InitializationMonitor {
  private data: InitMonitorData = {
    startTime: Date.now(),
    phases: {},
    errors: [],
    warnings: []
  };

  startPhase(phaseName: string): void {
    this.data.phases[phaseName] = {
      start: Date.now(),
    };
    console.log(`📊 Init phase started: ${phaseName}`);
  }

  endPhase(phaseName: string, success: boolean = true, error?: string): void {
    if (!this.data.phases[phaseName]) {
      this.logWarning(`Phase '${phaseName}' was not started`, phaseName);
      return;
    }

    const phase = this.data.phases[phaseName];
    phase.end = Date.now();
    phase.duration = phase.end - phase.start;
    phase.success = success;
    phase.error = error;

    const status = success ? '✅' : '❌';
    console.log(`📊 Init phase ${status}: ${phaseName} (${phase.duration}ms)`);

    if (error) {
      this.logError(error, phaseName);
    }
  }

  logError(error: string, phase?: string): void {
    this.data.errors.push({
      timestamp: Date.now(),
      error,
      phase
    });
    console.error(`📊 Init error${phase ? ` in ${phase}` : ''}: ${error}`);
  }

  logWarning(warning: string, phase?: string): void {
    this.data.warnings.push({
      timestamp: Date.now(),
      warning,
      phase
    });
    console.warn(`📊 Init warning${phase ? ` in ${phase}` : ''}: ${warning}`);
  }

  getReport(): {
    totalDuration: number;
    phases: Array<{ name: string; duration: number; success: boolean; error?: string }>;
    errorCount: number;
    warningCount: number;
    success: boolean;
  } {
    const totalDuration = Date.now() - this.data.startTime;
    const phases = Object.entries(this.data.phases).map(([name, phase]) => ({
      name,
      duration: phase.duration || 0,
      success: phase.success || false,
      error: phase.error
    }));

    const success = phases.every(p => p.success) && this.data.errors.length === 0;

    return {
      totalDuration,
      phases,
      errorCount: this.data.errors.length,
      warningCount: this.data.warnings.length,
      success
    };
  }

  printReport(): void {
    const report = this.getReport();
    
    console.group('📊 Initialization Report');
    console.log(`Total Duration: ${report.totalDuration}ms`);
    console.log(`Success: ${report.success ? '✅' : '❌'}`);
    console.log(`Errors: ${report.errorCount}`);
    console.log(`Warnings: ${report.warningCount}`);
    
    if (report.phases.length > 0) {
      console.group('Phases:');
      report.phases.forEach(phase => {
        const status = phase.success ? '✅' : '❌';
        console.log(`  ${status} ${phase.name}: ${phase.duration}ms${phase.error ? ` (${phase.error})` : ''}`);
      });
      console.groupEnd();
    }

    if (this.data.errors.length > 0) {
      console.group('Errors:');
      this.data.errors.forEach(error => {
        console.error(`  ${error.error}${error.phase ? ` [${error.phase}]` : ''}`);
      });
      console.groupEnd();
    }

    if (this.data.warnings.length > 0) {
      console.group('Warnings:');
      this.data.warnings.forEach(warning => {
        console.warn(`  ${warning.warning}${warning.phase ? ` [${warning.phase}]` : ''}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }

  // Store report in sessionStorage for debugging
  storeReport(): void {
    try {
      const report = this.getReport();
      sessionStorage.setItem('init_report', JSON.stringify({
        ...report,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }));
    } catch (error) {
      console.warn('Failed to store initialization report:', error);
    }
  }
}

// Global monitor instance
export const initMonitor = new InitializationMonitor();

// Helper to get stored reports for debugging
export const getStoredInitReports = (): any[] => {
  try {
    const reports = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('init_report')) {
        const report = sessionStorage.getItem(key);
        if (report) {
          reports.push(JSON.parse(report));
        }
      }
    }
    return reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.warn('Failed to retrieve stored reports:', error);
    return [];
  }
};

// Debug function to print all stored reports
export const debugInitHistory = (): void => {
  const reports = getStoredInitReports();
  console.group('🔍 Initialization History');
  reports.forEach((report, index) => {
    console.group(`Report ${index + 1} (${report.timestamp})`);
    console.log('Success:', report.success);
    console.log('Duration:', report.totalDuration + 'ms');
    console.log('Errors:', report.errorCount);
    console.log('Warnings:', report.warningCount);
    if (report.phases?.length > 0) {
      console.table(report.phases);
    }
    console.groupEnd();
  });
  console.groupEnd();
};

// Make debug functions available globally in development
if (import.meta.env.DEV) {
  (window as any).debugInitHistory = debugInitHistory;
  (window as any).getInitReports = getStoredInitReports;
}