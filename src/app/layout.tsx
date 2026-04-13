import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Jost } from "next/font/google";
import "./globals.css";
import { ThemeRegistry } from '@/theme-registry';
import { Annotations } from "@/annotations/provider";
import { AppStateProvider } from '@/context/AppStateContext';

const inter = Inter({ subsets: ["latin"] });
const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: '--font-jost' });

export const metadata: Metadata = { title: 'Pulse Core 4.0' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var p=localStorage.getItem('theme-mode');var d=p==='dark'||(p!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light')})()` }} />
      </head>
      <body className={`${inter.className} ${jost.variable}`} suppressHydrationWarning>
        <ThemeRegistry>
          <Annotations>
            <AppStateProvider>
              <Suspense fallback={null}>
                {children}
              </Suspense>
            </AppStateProvider>
          </Annotations>
        </ThemeRegistry>
      </body>
    </html>
  );
}
