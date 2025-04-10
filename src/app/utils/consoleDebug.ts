// src/app/utils/consoleDebug.ts

export interface DebugInfo {
  environment: string;
  apiUrl: string;
  backendType?: string;
  version: string;
  buildTime: string;
}

export class ConsoleDebugger {
  private static instance: ConsoleDebugger;
  private isDev: boolean;
  private localBackendUrl = "http://localhost:5000";
  private renderBackendUrl = "https://lebaincode-backend.onrender.com";

  private constructor() {
    this.isDev = process.env.NODE_ENV === "development";
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
      "%c" + this.userAsciiArt,
      "color: #00ff00; font-family: monospace; font-size: 10px;"
    );
  }

  private async detectBackendUrl(): Promise<string> {
    // If explicitly set to use render backend, return it immediately
    if (process.env.NEXT_PUBLIC_API_URL === this.renderBackendUrl) {
      return this.renderBackendUrl;
    }

    // If not in development mode, use render backend
    if (!this.isDev) {
      return this.renderBackendUrl;
    }

    // Skip localhost check if explicitly using render URL
    if (process.env.NEXT_PUBLIC_API_URL?.includes("render")) {
      return this.renderBackendUrl;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 500);

      const response = await fetch(`${this.localBackendUrl}/api/health`, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return this.localBackendUrl;
      }
    } catch {
      // Silently handle the error and fallback to render backend
    }

    return this.renderBackendUrl;
  }

  async showDevConsole(info: DebugInfo) {
    if (!this.isDev) return;

    const detectedApiUrl = await this.detectBackendUrl();
    const backendType =
      detectedApiUrl === this.localBackendUrl ? "Local" : "Render";

    const debugInfo = {
      ...info,
      apiUrl: detectedApiUrl,
      backendType: backendType,
    };

    console.log(
      "%c" + this.devAsciiArt,
      "color: #ff0000; font-family: monospace; font-size: 10px;"
    );

    console.group(
      "%c🔍 Debug Information",
      "color: #ff0000; font-weight: bold;"
    );
    console.table(debugInfo);
    console.groupEnd();

    this.initializeDevShortcuts();
  }

  private initializeDevShortcuts() {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        this.showDebugPanel();
      }
    });
  }

  private showDebugPanel() {
    console.group("%c🛠️ Developer Tools", "color: #ff0000; font-weight: bold;");
    console.log("%c📡 API Status:", "color: #00ff00", "Connected");
    console.log("%c🔄 Session:", "color: #00ff00", "Active");
    console.log("%c⚡ Performance:", "color: #00ff00", "Optimal");
    console.groupEnd();
  }
}
