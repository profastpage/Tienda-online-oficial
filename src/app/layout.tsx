import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tienda Online Oficial | Crea tu Tienda en Minutos",
  description: "Plataforma #1 en Perú para crear tu tienda online. Catálogo, carrito, WhatsApp y notificaciones push. Sin conocimientos técnicos.",
  keywords: ["tienda online", "crear tienda", "e-commerce", "Perú", "Tienda Online Oficial"],
  authors: [{ name: "Tienda Online Oficial" }],
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Tienda Online Oficial | Tu Tienda Profesional en Minutos",
    description: "Crea tu tienda online con catálogo, carrito, WhatsApp y push. La plataforma #1 en Perú.",
    type: "website",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
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
