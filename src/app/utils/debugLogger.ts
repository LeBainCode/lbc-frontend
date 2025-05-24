// utils/debugLogger.ts

// Control debug logging globally
const DEBUG_ENABLED = process.env.NODE_ENV === 'development';

// Configure which components should log (add/remove as needed)
const ENABLED_COMPONENTS = ['Auth', 'Hero', 'API'];

// Optional: Filter out specific message types (to reduce noise)
const FILTERED_MESSAGES = ['Modal not rendered', 'State updated'];

interface LogOptions {
  // Only log once per session for this message
  once?: boolean;
  // Force log even if component is disabled
  important?: boolean;
  // Store in localStorage
  persist?: boolean;
}

// Main debug function
export function debug(
  component: string, 
  message: string, 
  data?: unknown, 
  options: LogOptions = {}
) {
  // Skip logging if debugging is disabled or component not enabled
  if (!DEBUG_ENABLED || (!ENABLED_COMPONENTS.includes(component) && !options.important)) {
    return;
  }
  
  // Skip filtered messages unless they are marked as important
  if (!options.important && FILTERED_MESSAGES.some(filter => message.includes(filter))) {
    return;
  }
  
  // Handle "once" option using sessionStorage
  if (options.once) {
    const key = `debug_logged_${component}_${message}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(key)) {
      return;
    }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, 'true');
    }
  }
  
  // Format the log message
  const formattedMessage = `[${component}] ${message}`;
  
  // Log to console
  if (data !== undefined) {
    console.log(formattedMessage, data);
  } else {
    console.log(formattedMessage);
  }
  
  // Optionally persist to localStorage (limit to important logs)
  if (options.persist && typeof window !== 'undefined') {
    try {
      const logs = JSON.parse(localStorage.getItem('debugLogs') || '[]');
      logs.push({
        timestamp: new Date().toISOString(),
        component,
        message,
        data
      });
      
      // Keep only the last 50 logs
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50);
      }
      
      localStorage.setItem('debugLogs', JSON.stringify(logs));
    } catch (_error) {
      // Silent fail for localStorage errors
    }
  }
}

// Initialize debug system
export function initDebugger() {
  if (!DEBUG_ENABLED) return;
  
  console.log('%c🔍 LeBainCode Debug Mode Active', 'color: #BF9ACA; font-size: 14px; font-weight: bold;');
  console.log(`Enabled components: ${ENABLED_COMPONENTS.join(', ')}`);
  
  // Add keyboard shortcut to show debug info
  if (typeof window !== 'undefined') {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        console.group('%c🔍 Debug Information', 'color: #BF9ACA; font-size: 14px; font-weight: bold;');
        console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
        console.log('GitHub Client ID:', process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ? '✓ Configured' : '❌ Missing');
        console.log('Environment:', process.env.NODE_ENV);
        console.groupEnd();
      }
    });
  }
}
