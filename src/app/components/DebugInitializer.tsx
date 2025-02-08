// src/components/DebugInitializer.tsx
'use client';

import { useEffect } from 'react';
import { ConsoleDebugger } from '../utils/consoleDebug';

export function DebugInitializer() {
  useEffect(() => {
    const debugInstance = ConsoleDebugger.getInstance();
    
    // Show welcome message for all users
    debugInstance.showUserWelcome();
    
    // Show dev console only in development
    if (process.env.NODE_ENV === 'development') {
      debugInstance.showDevConsole({
        environment: process.env.NODE_ENV,
        apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        buildTime: new Date().toISOString()
      });
    }
  }, []);

  return null;
}