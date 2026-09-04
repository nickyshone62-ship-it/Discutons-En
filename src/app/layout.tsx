import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DIScutons-En",
  description: "Seul face au problème, ensemble pour la solution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
