/**
 * Utility to capture and export console errors
 * Run this in the browser console to capture all errors
 */

interface CapturedError {
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  stack?: string;
  url?: string;
}

class ConsoleErrorCapture {
  private errors: CapturedError[] = [];
  private originalError: typeof console.error;
  private originalWarn: typeof console.warn;
  private originalInfo: typeof console.info;
  private isCapturing = false;

  constructor() {
    this.originalError = console.error.bind(console);
    this.originalWarn = console.warn.bind(console);
    this.originalInfo = console.info.bind(console);
  }

  start() {
    if (this.isCapturing) {
      console.warn('Already capturing console errors');
      return;
    }

    this.isCapturing = true;
    this.errors = [];

    // Capture errors
    console.error = (...args: any[]) => {
      this.capture('error', args);
      this.originalError(...args);
    };

    // Capture warnings
    console.warn = (...args: any[]) => {
      this.capture('warning', args);
      this.originalWarn(...args);
    };

    // Capture info (optional)
    console.info = (...args: any[]) => {
      this.capture('info', args);
      this.originalInfo(...args);
    };

    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.capture('error', [
        event.message,
        `File: ${event.filename}:${event.lineno}:${event.colno}`,
        event.error?.stack,
      ]);
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.capture('error', [
        'Unhandled Promise Rejection',
        event.reason?.message || String(event.reason),
        event.reason?.stack,
      ]);
    });

    console.log('✅ Console error capture started');
  }

  stop() {
    if (!this.isCapturing) {
      console.warn('Not currently capturing');
      return;
    }

    console.error = this.originalError;
    console.warn = this.originalWarn;
    console.info = this.originalInfo;
    this.isCapturing = false;

    console.log('⏹️ Console error capture stopped');
  }

  private capture(type: 'error' | 'warning' | 'info', args: any[]) {
    const message = args
      .map((arg) => {
        if (arg instanceof Error) {
          return `${arg.message}\n${arg.stack}`;
        }
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(' ');

    this.errors.push({
      type,
      message,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
  }

  getReport(): string {
    const errors = this.errors.filter((e) => e.type === 'error');
    const warnings = this.errors.filter((e) => e.type === 'warning');
    const info = this.errors.filter((e) => e.type === 'info');

    return `
=== CONSOLE ERROR REPORT ===
Generated: ${new Date().toISOString()}
URL: ${window.location.href}

ERRORS (${errors.length}):
${errors.length === 0 ? '  No errors captured' : errors.map((e, i) => `${i + 1}. [${e.timestamp}] ${e.message}`).join('\n\n')}

WARNINGS (${warnings.length}):
${warnings.length === 0 ? '  No warnings captured' : warnings.map((w, i) => `${i + 1}. [${w.timestamp}] ${w.message}`).join('\n\n')}

INFO (${info.length}):
${info.length === 0 ? '  No info messages captured' : info.map((i, idx) => `${idx + 1}. [${i.timestamp}] ${i.message}`).join('\n\n')}

TOTAL: ${this.errors.length} messages
    `.trim();
  }

  async copyToClipboard(): Promise<boolean> {
    const report = this.getReport();
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(report);
        console.log('✅ Report copied to clipboard!');
        return true;
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        return false;
      }
    } else {
      // Fallback: log to console
      console.log('📋 Clipboard API not available. Report:');
      console.log(report);
      return false;
    }
  }

  downloadReport() {
    const report = this.getReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-errors-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('✅ Report downloaded!');
  }

  clear() {
    this.errors = [];
    console.log('🗑️ Captured errors cleared');
  }

  getErrors() {
    return this.errors;
  }
}

// Export singleton instance
export const errorCapture = new ConsoleErrorCapture();

// Make it available globally for easy access in console
if (typeof window !== 'undefined') {
  (window as any).errorCapture = errorCapture;
  (window as any).captureErrors = () => {
    errorCapture.start();
    console.log(`
🎯 Console error capture started!

To get a report:
  - errorCapture.getReport() - Get formatted report
  - errorCapture.copyToClipboard() - Copy to clipboard
  - errorCapture.downloadReport() - Download as file
  - errorCapture.stop() - Stop capturing
  - errorCapture.clear() - Clear captured errors
    `);
  };
}

