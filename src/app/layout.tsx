import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Jost } from "next/font/google";
import "./globals.css";
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@/theme';

const inter = Inter({ subsets: ["latin"] });
const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: '--font-jost' });

export const metadata: Metadata = { title: 'Pulse Core 4.0' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${jost.variable}`}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
