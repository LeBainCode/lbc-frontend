import { ConsoleDebugger } from "../utils/consoleDebug";

const debugInstance = ConsoleDebugger.getInstance();

interface EmailParams {
  email: string;
  username: string;
  type: "approval" | "rejection";
}

export async function sendBetaEmail({ email, username, type }: EmailParams): Promise<boolean> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    debugInstance.showDevConsole({
      environment: process.env.NODE_ENV || "development",
      apiUrl: apiUrl || "http://localhost:5000",
      version: "1.0.0",
      buildTime: new Date().toISOString()
    });

    const response = await fetch(`${apiUrl}/api/email/beta/${type}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Error sending beta email:", error);
    throw error;
  }
} 