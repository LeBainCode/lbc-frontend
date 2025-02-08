// src/app/utils/consoleDebug.ts

interface DebugInfo {
    environment: string;
    apiUrl: string;
    version: string;
    buildTime: string;
  }
  
  export class ConsoleDebugger {
    private static instance: ConsoleDebugger;
    private isDev: boolean;
  
    private constructor() {
      this.isDev = process.env.NODE_ENV === 'development';
    }
  
    static getInstance() {
      if (!ConsoleDebugger.instance) {
        ConsoleDebugger.instance = new ConsoleDebugger();
      }
      return ConsoleDebugger.instance;
    }
  
    private userAsciiArt = `
      ██╗     ██████╗  ██████╗
      ██║     ██╔══██╗██╔════╝
      ██║     ██████╔╝██║     
      ██║     ██╔══██╗██║     
      ███████╗██████╔╝╚██████╗
      ╚══════╝╚═════╝  ╚═════╝
      
      Welcome to Le Bain Code! 🚀
    `;
  
    private devAsciiArt = `
      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⣀⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠉⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀
      ⠀⠀⠀⠀⠀⠀⢀⠤⠒⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
      ⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
      ⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀
      ⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀
      ⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀
      ⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀
      ⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀
      ⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀
      
      🔧 DEV MODE ACTIVATED 🔧
    `;
  
    showUserWelcome() {
      console.log(
        '%c' + this.userAsciiArt,
        'color: #00ff00; font-family: monospace; font-size: 10px;'
      );
    }
  
    showDevConsole(info: DebugInfo) {
      if (!this.isDev) return;
  
      console.log(
        '%c' + this.devAsciiArt,
        'color: #ff0000; font-family: monospace; font-size: 10px;'
      );
  
      console.group('%c🔍 Debug Information', 'color: #ff0000; font-weight: bold;');
      console.table(info);
      console.groupEnd();
  
      // Add keyboard shortcut for debug panel
      this.initializeDevShortcuts();
    }
  
    private initializeDevShortcuts() {
      document.addEventListener('keydown', (e) => {
        // Ctrl + Shift + D to toggle debug panel
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
          this.showDebugPanel();
        }
      });
    }
  
    private showDebugPanel() {
      console.group('%c🛠️ Developer Tools', 'color: #ff0000; font-weight: bold;');
      console.log('%c📡 API Status:', 'color: #00ff00', 'Connected');
      console.log('%c🔄 Session:', 'color: #00ff00', 'Active');
      console.log('%c⚡ Performance:', 'color: #00ff00', 'Optimal');
      console.groupEnd();
    }
  }