import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import GlobalChatNotification from "@/components/notifications/GlobalChatNotification";
import PwaProvider from "@/components/pwa/PwaProvider";
import OfflineBanner from "@/components/pwa/OfflineBanner";
import PwaInstallPrompt from "@/components/pwa/PwaInstallPrompt";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "DIScutons-En — Ensemble pour la solution",
  description:
    "DIScutons-En est une communauté où chacun peut partager ses problèmes, demander des conseils et aider les autres.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Discutons-En",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/icons/icon-192x192.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${plusJakartaSans.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased selection:bg-cyan-400 selection:text-slate-950 min-h-screen bg-slate-950 text-slate-100">
        <PwaProvider>
          <OfflineBanner />
          <GlobalChatNotification />
          {children}
          <PwaInstallPrompt />
        </PwaProvider>
      </body>
    </html>
  );
}


