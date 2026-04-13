import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AuthHydrator } from "@/components/auth-hydrator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://tiendaonlineoficial.com";
const SITE_IMAGE = `${SITE_URL}/images/hero/banner.png`;

export const metadata: Metadata = {
  title: "Tienda Online Oficial | Crea tu Tienda en Minutos",
  description:
    "Plataforma #1 en Perú para crear tu tienda online. Catálogo digital, carrito de compras, WhatsApp integrado y notificaciones push. Sin conocimientos técnicos. Empieza gratis.",
  keywords: [
    "tienda online",
    "crear tienda online",
    "e-commerce Perú",
    "tienda virtual",
    "vender por internet",
    "catálogo digital",
    "WhatsApp business",
    "tienda online oficial",
    "e-commerce SaaS",
    "plataforma e-commerce",
  ],
  authors: [{ name: "Tienda Online Oficial", url: SITE_URL }],
  creator: "Tienda Online Oficial",
  publisher: "Tienda Online Oficial",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tienda Online Oficial | Tu Tienda Profesional en Minutos",
    description:
      "Crea tu tienda online con catálogo digital, carrito, WhatsApp y push notifications. La plataforma #1 en Perú para emprendedores.",
    url: SITE_URL,
    siteName: "Tienda Online Oficial",
    images: [
      {
        url: SITE_IMAGE,
        width: 1200,
        height: 630,
        alt: "Tienda Online Oficial - Crea tu tienda profesional en minutos",
      },
    ],
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tienda Online Oficial | Tu Tienda Profesional en Minutos",
    description:
      "Crea tu tienda online con catálogo, carrito, WhatsApp y push. La plataforma #1 en Perú.",
    images: [SITE_IMAGE],
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Tienda Online",
    "theme-color": "#0a0a0a",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          {/* Auth hydration runs once globally, before any child renders */}
          <AuthHydrator />
          {children}
          <Toaster />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // === EARLY PWA INSTALL INTERCEPT ===
              window.__deferredPrompt = null;
              window.__canInstallPwa = false;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.__deferredPrompt = e;
                window.__canInstallPwa = true;
                window.dispatchEvent(new CustomEvent('pwa-install-available'));
              });
              window.addEventListener('appinstalled', () => {
                window.__deferredPrompt = null;
                window.__canInstallPwa = false;
                window.dispatchEvent(new CustomEvent('pwa-installed'));
              });
              // Service Worker
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW registered:', reg.scope))
                    .catch(err => console.log('SW failed:', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
