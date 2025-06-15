// src/app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { DebugInitializer } from "./components/DebugInitializer";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Le Bain Code | Learn to Code by Jumping in the Deep End",
  description:
    "Immersive coding education platform where you learn by doing. Join our community of developers and start your coding journey today.",
  keywords: [
    "coding bootcamp",
    "learn to code",
    "programming education",
    "web development",
    "software engineering",
  ],
  openGraph: {
    title: "Le Bain Code | Learn to Code by Jumping in the Deep End",
    description: "Immersive coding education platform where you learn by doing",
    url: "https://lebaincode.com",
    siteName: "Le Bain Code",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Le Bain Code - Learn to Code",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  metadataBase: new URL("http://localhost:3000"),
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <DebugInitializer />
          {children}
          <Analytics />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1F2937",
                color: "#fff",
                border: "1px solid #374151",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
