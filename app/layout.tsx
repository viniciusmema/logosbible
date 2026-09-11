import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IDE Scriptum — Estudos bíblicos",
  description: "Seu caderno de estudos bíblicos, com contexto para compreender e devoção para viver.",
  other: { "codex-preview": "development" },
  icons: {
    icon: [
      { url: "/scriptum-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/scriptum-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/scriptum-favicon-64.png",
    apple: [{ url: "/scriptum-apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "IDE Scriptum",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
