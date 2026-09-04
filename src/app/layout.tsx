import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DIScutons-En — Ensemble pour la solution",
  description:
    "DIScutons-En est une communauté où chacun peut partager ses problèmes, demander des conseils et aider les autres.",
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
